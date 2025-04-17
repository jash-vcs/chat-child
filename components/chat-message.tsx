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
      <Avatar className={cn("h-8 w-8 flex justify-center items-center", isUser ? "bg-primary" : "bg-muted")}>
        {isUser ? <CircleUser className="h-5 w-5 text-primary-foreground" /> : <Bot className="h-5 w-5 text-muted-foreground" />}
      </Avatar>

      <div
        className={cn(
          "rounded-lg p-3 max-w-[80%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
          message.isLoading && "animate-pulse",
        )}
      >
        {message.isLoading ? (
          <>
            <div className="h-4 w-12 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
          </>
        ) : (
          <p className="whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block animate-pulse ml-1">▋</span>
            )}
          </p>
        )}
        <div className={cn("text-xs mt-1", isUser ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {message.timestamp.toLocaleTimeString()}
          {message.isStreaming && " · Streaming..."}
        </div>
      </div>
    </div>
  )
}
