"use client"

import type { Message } from "@/components/chat-context"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { CircleUser, Bot } from "lucide-react"

type ChatMessageProps = {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-start gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className={cn("h-8 w-8", isUser ? "bg-blue-500" : "bg-gray-500")}>
        {isUser ? <CircleUser className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
      </Avatar>

      <div
        className={cn(
          "rounded-lg p-3 max-w-[80%]",
          isUser ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
          message.isLoading && "animate-pulse",
        )}
      >
        {message.isLoading ? (
          <>
            <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </>
        ) : (
          <p className="whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block animate-pulse ml-1">▋</span>
            )}
          </p>
        )}
        <div className={cn("text-xs mt-1", isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400")}>
          {message.timestamp.toLocaleTimeString()}
          {message.isStreaming && " · Streaming..."}
        </div>
      </div>
    </div>
  )
}
