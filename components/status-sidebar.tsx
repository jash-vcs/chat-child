"use client"

import { useChat } from "@/components/chat-context"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "next-themes"

type StatusSidebarProps = {
  className?: string
}

export default function StatusSidebar({ className }: StatusSidebarProps) {
  const { sessions, activeSessionId, setActiveSessionId, createSession } = useChat()
  const { theme } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Draw the chat tree visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Node styling
    const nodeRadius = 25
    const activeNodeColor = "#3b82f6" // blue-500
    const inactiveNodeColor = "#9ca3af" // gray-400
    const lineColor = document.documentElement.classList.contains('dark') ? "#4b5563" : "#d1d5db" // gray-600 in dark mode, gray-300 in light
    const lineWidth = 2

    // Update canvas background to match theme
    canvas.style.backgroundColor = document.documentElement.classList.contains('dark') ? "transparent" : "transparent"

    // Build tree structure
    type TreeNode = {
      id: string
      x: number
      y: number
      children: TreeNode[]
      parent: TreeNode | null
    }

    // Create nodes map
    const nodesMap: Record<string, TreeNode> = {}

    // First pass: create all nodes
    Object.keys(sessions).forEach((id) => {
      nodesMap[id] = {
        id,
        x: 0,
        y: 0,
        children: [],
        parent: null,
      }
    })

    // Second pass: establish parent-child relationships
    Object.keys(sessions).forEach((id) => {
      const session = sessions[id]
      if (session.parentId && nodesMap[session.parentId]) {
        nodesMap[id].parent = nodesMap[session.parentId]
        nodesMap[session.parentId].children.push(nodesMap[id])
      }
    })

    // Find root nodes (nodes without parents)
    const rootNodes = Object.values(nodesMap).filter((node) => node.parent === null)

    // Position nodes
    const positionNodes = (node: TreeNode, x: number, y: number, horizontalSpacing: number) => {
      node.x = x
      node.y = y

      if (node.children.length === 0) return

      const childSpacing = horizontalSpacing / node.children.length
      let currentX = x - horizontalSpacing / 2 + childSpacing / 2

      node.children.forEach((child) => {
        positionNodes(child, currentX, y + 100, childSpacing)
        currentX += childSpacing
      })
    }

    // Position each root node
    const rootSpacing = canvas.width / (rootNodes.length || 1)
    let rootX = rootSpacing / 2

    rootNodes.forEach((root) => {
      positionNodes(root, rootX, 50, rootSpacing)
      rootX += rootSpacing
    })

    // Draw connections first (so they appear behind nodes)
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth

    const drawConnections = (node: TreeNode) => {
      node.children.forEach((child) => {
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(child.x, child.y)
        ctx.stroke()

        drawConnections(child)
      })
    }

    rootNodes.forEach((root) => drawConnections(root))

    // Draw nodes
    const drawNode = (node: TreeNode) => {
      const isActive = node.id === activeSessionId

      // Draw circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
      ctx.fillStyle = isActive ? activeNodeColor : inactiveNodeColor
      ctx.fill()

      // Add click handler data
      if (!node.id) return

      // Draw node name
      const session = sessions[node.id]
      if (session) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const shortName = session.agentConfig.name.substring(0, 8)
        ctx.fillText(shortName, node.x, node.y)
      }

      // Draw children
      node.children.forEach((child) => drawNode(child))
    }

    rootNodes.forEach((root) => drawNode(root))

    // Add click handler to canvas
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if click is within any node
      const isInNode = (node: TreeNode): string | null => {
        const dx = node.x - x
        const dy = node.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= nodeRadius) {
          return node.id
        }

        // Check children
        for (const child of node.children) {
          const childResult = isInNode(child)
          if (childResult) return childResult
        }

        return null
      }

      // Check all root nodes
      for (const root of rootNodes) {
        const clickedNodeId = isInNode(root)
        if (clickedNodeId) {
          setActiveSessionId(clickedNodeId)
          break
        }
      }
    }

    canvas.addEventListener("click", handleCanvasClick)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("click", handleCanvasClick)
    }
  }, [sessions, activeSessionId, setActiveSessionId, theme])

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 py-5 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Chat Tree</h2>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            const newId = createSession(activeSessionId)
            setActiveSessionId(newId)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Branch from Current
        </Button>
        {/* <Button
          variant="outline"
          className="w-full justify-start mt-2"
          onClick={() => {
            const newId = createSession()
            setActiveSessionId(newId)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Root Chat
        </Button> */}
      </div>
    </div>
  )
}
