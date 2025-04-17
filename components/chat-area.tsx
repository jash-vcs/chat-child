"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat } from "@/components/chat-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Split, Send, GitBranch } from "lucide-react"
import ChatMessage from "@/components/chat-message"
import AgentConfigModal from "@/components/agent-config-modal"
import { ThemeToggleSimple } from "@/components/theme-toggle"

type ChatAreaProps = {
  className?: string
}

export default function ChatArea({ className }: ChatAreaProps) {
  const {
    sessions,
    activeSessionId,
    addMessage,
    updateMessage,
    appendToMessage,
    splitChat,
    setActiveSessionId
  } = useChat()

  const [input, setInput] = useState("")
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const activeSession = sessions[activeSessionId]

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [activeSession.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    const userInput = input
    setInput("")

    // Add user message
    const userMessageId = addMessage(activeSessionId, {
      content: userInput,
      role: "user",
    })

    // Add an empty assistant message with loading state
    const assistantMessageId = addMessage(activeSessionId, {
      content: "",
      role: "assistant",
      isLoading: true,
    })

    try {
      // Prepare messages for the API
      const messages = activeSession.messages
        .filter(msg => !msg.isLoading) // Filter out any loading messages
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Add the user's new message
      messages.push({
        role: "user",
        content: userInput,
      });

      // Start streaming the response
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          config: {
            model: activeSession.agentConfig.model,
            temperature: activeSession.agentConfig.temperature,
            systemInstruction: activeSession.agentConfig.systemInstruction,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Update the message to show it's streaming but not loading anymore
      updateMessage(activeSessionId, assistantMessageId, {
        isLoading: false,
        isStreaming: true,
      });

      // Process the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get stream reader');

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (done) break;

        // Process the chunk
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Stream is complete
              break;
            }

            try {
              const { text } = JSON.parse(data);
              if (text) {
                appendToMessage(activeSessionId, assistantMessageId, text);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }

      // Mark the message as no longer streaming
      updateMessage(activeSessionId, assistantMessageId, {
        isStreaming: false,
      });
    } catch (error) {
      console.error('Error processing chat:', error);
      // Update the message to show the error
      updateMessage(activeSessionId, assistantMessageId, {
        content: 'Sorry, there was an error processing your request.',
        isLoading: false,
        isStreaming: false,
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const handleSplitChat = () => {
    const newSessionId = splitChat(activeSessionId)
    setActiveSessionId(newSessionId)
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-bold truncate">{activeSession.agentConfig.name}</h2>
        <div className="flex space-x-2">
          {/* <ThemeToggleSimple /> */}
          <Button variant="outline" size="icon" onClick={handleSplitChat} title="Split Chat">
            <Split className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsConfigOpen(true)} title="Agent Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {activeSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <GitBranch className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Start a new conversation</h3>
              <p className="text-sm text-gray-500 max-w-md mt-2">
                This chat can be split into multiple branches. Parent context is shared with children, but siblings
                don't share context.
              </p>
            </div>
          ) : (
            activeSession.messages.map((message) => <ChatMessage key={message.id} message={message} />)
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isProcessing}
          />
          <Button type="submit" disabled={!input.trim() || isProcessing}>
            {isProcessing ? (
              <>
                <span className="animate-pulse mr-2">•••</span>
                Processing
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </form>
      </div>

      <AgentConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} sessionId={activeSessionId} />
    </div>
  )
}
