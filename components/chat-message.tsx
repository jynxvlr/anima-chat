"use client"

import type { ChatMessage as ChatMessageType } from "@/lib/llm-providers"
import { MarkdownRenderer } from "./markdown-renderer"
import { Button } from "@/components/ui/button"
import { Copy, User, Bot, Check } from "lucide-react"
import { useState } from "react"

interface ChatMessageProps {
  message: ChatMessageType
  showTimestamp?: boolean
  showWordCount?: boolean
  compactMode?: boolean
  theme?: "dark" | "light"
}

export function ChatMessage({
  message,
  showTimestamp = true,
  showWordCount = false,
  compactMode = false,
  theme = "dark",
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Error copying:", error)
    }
  }

  const wordCount = message.content.split(/\s+/).filter((word) => word.length > 0).length

  const isUser = message.role === "user"

  return (
    <div
      className={`flex gap-3 ${compactMode ? "py-2" : "py-4"} animate-fade-in`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 ${compactMode ? "w-6 h-6" : "w-7 h-7"} rounded-full flex items-center justify-center ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {isUser ? (
          <User size={compactMode ? 12 : 14} />
        ) : (
          <Bot size={compactMode ? 12 : 14} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className={`flex items-center gap-2 ${compactMode ? "mb-0.5" : "mb-1.5"}`}>
          <span className={`${compactMode ? "text-xs" : "text-[13px]"} font-medium text-foreground`}>
            {isUser ? "You" : "AI"}
          </span>

          {showTimestamp && (
            <span className="text-[11px] text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          {showWordCount && (
            <span className="text-[11px] text-muted-foreground">{wordCount} words</span>
          )}
        </div>

        {/* Message body */}
        <div className="text-[14px] leading-relaxed text-foreground/90">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} theme={theme} />
          )}
        </div>

        {/* Copy action */}
        {!isUser && (
          <div className={compactMode ? "mt-1" : "mt-2"}>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className={`${compactMode ? "h-6 text-[11px]" : "h-7 text-xs"} text-muted-foreground hover:text-foreground gap-1`}
            >
              {copied ? (
                <Check size={compactMode ? 11 : 13} className="text-primary" />
              ) : (
                <Copy size={compactMode ? 11 : 13} />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
