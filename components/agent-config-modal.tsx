"use client"

import { useState, useEffect } from "react"
import { useChat, type AgentConfig } from "@/components/chat-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

type AgentConfigModalProps = {
  isOpen: boolean
  onClose: () => void
  sessionId: string
}

export default function AgentConfigModal({ isOpen, onClose, sessionId }: AgentConfigModalProps) {
  const { sessions, updateAgentConfig } = useChat()
  const [config, setConfig] = useState<AgentConfig>({
    id: "",
    name: "",
    systemInstruction: "",
    model: "",
    temperature: 0.7,
  })

  useEffect(() => {
    if (sessionId && sessions[sessionId]) {
      setConfig(sessions[sessionId].agentConfig)
    }
  }, [sessionId, sessions, isOpen])

  const handleSave = () => {
    updateAgentConfig(sessionId, config)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure AI Agent</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Select value={config.model} onValueChange={(value) => setConfig({ ...config, model: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                <SelectItem value="gemini-2.0-pro">Gemini 2.0 Pro</SelectItem>
                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="temperature" className="text-right">
              Temperature: {config.temperature.toFixed(1)}
            </Label>
            <div className="col-span-3">
              <Slider
                id="temperature"
                min={0}
                max={2}
                step={0.1}
                value={[config.temperature]}
                onValueChange={(value) => setConfig({ ...config, temperature: value[0] })}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="systemInstruction" className="text-right pt-2">
              System Instructions
            </Label>
            <Textarea
              id="systemInstruction"
              value={config.systemInstruction}
              onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
              className="col-span-3 min-h-[100px]"
              placeholder="Enter system instructions for the AI..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
