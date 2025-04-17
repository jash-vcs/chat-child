"use client"
import ChatArea from "@/components/chat-area"
import StatusSidebar from "@/components/status-sidebar"
import { ChatProvider } from "@/components/chat-context"

export default function Home() {
  return (
    <main className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ChatProvider>
        <StatusSidebar className="w-1/4 border-r border-gray-200 dark:border-gray-800" />
        <ChatArea className="w-3/4" />
      </ChatProvider>
    </main>
  )
}
