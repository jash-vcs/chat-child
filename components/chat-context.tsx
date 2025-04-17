"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useChatStore } from "@/store/chat-store"

// Re-export types from the store
export type { AgentConfig, Message, ChatSession } from "@/store/chat-store"

// Create a context to provide the Zustand store through React context
const ChatContext = createContext<ReturnType<typeof useChatStore.getState> | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  // We're using the store directly here
  return (
    <ChatContext.Provider value={useChatStore.getState()}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }

  // Return the store with all its methods
  return useChatStore()
}
