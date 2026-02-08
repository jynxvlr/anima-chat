"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Square } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  theme?: "dark" | "light"
  placeholder?: string
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  theme = "dark",
  placeholder = "Write a message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border px-4 py-3 bg-background">
      <div className="flex gap-2 items-end max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-[200px] resize-none bg-muted/50 border-border text-foreground placeholder:text-muted-foreground text-sm pr-12 rounded-lg focus-visible:ring-1 focus-visible:ring-ring"
            rows={1}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          size="icon"
          className={`h-9 w-9 rounded-lg shrink-0 transition-colors ${
            disabled || !message.trim()
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {disabled ? <Square size={14} /> : <ArrowUp size={16} />}
        </Button>
      </div>

      <div className="text-[11px] mt-1.5 text-center text-muted-foreground">
        <kbd className="px-1 py-0.5 rounded text-[10px] bg-muted font-mono">Enter</kbd>
        <span className="mx-1">to send</span>
        <kbd className="px-1 py-0.5 rounded text-[10px] bg-muted font-mono">Shift+Enter</kbd>
        <span className="ml-1">for new line</span>
      </div>
    </div>
  )
}
