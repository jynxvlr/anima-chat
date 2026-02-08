"use client"

import { useState, useEffect, useRef } from "react"
import type { ChatMessage as ChatMessageType } from "@/lib/llm-providers"
import type { ChatSession } from "@/lib/chat-storage"
import { ChatMessage } from "@/components/chat-message"
import { ChatInput } from "@/components/chat-input"
import { ChatSidebar } from "@/components/chat-sidebar"
import { SettingsModal } from "@/components/settings-modal"
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2 } from "lucide-react"
import { generateChatId } from "@/lib/utils"
import type { LLMConfig } from "@/lib/config"

interface AppConfig {
  providers: string[]
  models: Record<string, string[]>
  activeProvider: string
  defaultModel: string
  appName: string
  appLogo: string
  theme: "dark" | "light"
}

export default function ChatPage() {
  // State
  const [config, setConfig] = useState<LLMConfig | null>(null)
  const [chats, setChats] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load configuration and chats on startup
  useEffect(() => {
    loadConfig()
    loadChats()
  }, [])

  // Auto-scroll to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentSession?.messages, streamingMessage])

  // Apply theme
  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  const loadConfig = async () => {
    try {
      const response = await fetch("/api/config")
      const configData = await response.json()
      setConfig(configData)
      setTheme(configData.app?.theme || "dark")
    } catch (error) {
      console.error("Error loading configuration:", error)
    }
  }

  const loadChats = async () => {
    try {
      const response = await fetch("/api/sessions")
      const chatsData = await response.json()
      setChats(chatsData)
    } catch (error) {
      console.error("Error loading chats:", error)
    }
  }

  const saveConfig = async (newConfig: LLMConfig) => {
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      })

      if (response.ok) {
        setConfig(newConfig)
        setTheme(newConfig.app.theme)
      }
    } catch (error) {
      console.error("Error saving configuration:", error)
    }
  }

  const createNewChat = () => {
    if (!config) return

    const newSession: ChatSession = {
      id: generateChatId(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: config.llm.default_model,
      provider: config.llm.active_provider,
      settings: {
        temperature: config.llm.temperature,
        max_tokens: config.llm.max_tokens,
        system_prompt: config.llm.system_prompt,
      },
    }

    setCurrentSession(newSession)
    setCurrentChatId(newSession.id)
  }

  const selectChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/sessions/${chatId}`)
      const chat = await response.json()

      // Defensive check to prevent crash
      if (chat && !Array.isArray(chat.messages)) {
        console.warn("SelectChat: Fetched session is missing messages array. Patching.", chat);
        chat.messages = [];
      }

      setCurrentSession(chat)
      setCurrentChatId(chatId)
    } catch (error) {
      console.error("Error loading chat:", error)
    }
  }

  const saveCurrentSession = async (session: ChatSession) => {
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          session,
        }),
      })

      // Update chat list
      loadChats()
    } catch (error) {
      console.error("Error saving chat:", error)
    }
  }

  const deleteChat = async (chatId: string) => {
    try {
      // Delete on server
      await fetch(`/api/sessions?id=${chatId}`, {
        method: "DELETE",
      });

      // Reload the chats from server
      const response = await fetch("/api/sessions");
      const remainingChats = await response.json();
      setChats(remainingChats);

      // Decide what to show next
      if (currentChatId === chatId) {
        if (remainingChats.length > 0) {
          // If there are chats left, select the first one.
          selectChat(remainingChats[0].id);
        } else {
          // If no chats are left, create a new one.
          createNewChat();
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      loadChats(); // Re-sync with server on error
    }
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/sessions/${chatId}`)
      const chat = await response.json()

      chat.title = newTitle
      chat.updatedAt = Date.now()

      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          session: chat,
        }),
      })

      if (currentChatId === chatId) {
        setCurrentSession(chat)
      }

      loadChats()
    } catch (error) {
      console.error("Error renaming chat:", error)
    }
  }

  const exportChat = async (chatId: string, format: "txt" | "md" | "json") => {
    try {
      const response = await fetch(`/api/export?id=${chatId}&format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `chat_${chatId}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting chat:", error)
    }
  }

  const sendMessage = async (content: string) => {
    if (!currentSession || isLoading || !config) return

    setIsLoading(true)
    setStreamingMessage("")

    // Add user message
    const userMessage: ChatMessageType = {
      role: "user",
      content,
      timestamp: Date.now(),
    }

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      title: currentSession.messages.length === 0 ? content.slice(0, 50) : currentSession.title,
      updatedAt: Date.now(),
    }

    setCurrentSession(updatedSession)

    try {
      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedSession.messages,
          provider: updatedSession.provider,
          model: updatedSession.model,
          settings: updatedSession.settings,
        }),
      })

      if (!response.ok) {
        throw new Error("API call failed")
      }

      // Process streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error("Stream cannot be read")

      const decoder = new TextDecoder()
      let assistantContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim())

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantContent += parsed.content
                setStreamingMessage(assistantContent)
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              // Ignore parsing error
            }
          }
        }
      }

      // Add AI response to session
      const assistantMessage: ChatMessageType = {
        role: "assistant",
        content: assistantContent,
        timestamp: Date.now(),
      }

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
      }

      setCurrentSession(finalSession)
      setStreamingMessage("")

      // Save session
      if (config.app.auto_save) {
        await saveCurrentSession(finalSession)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setStreamingMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    if (config) {
      const newConfig = { ...config, app: { ...config.app, theme: newTheme } }
      saveConfig(newConfig)
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen h-screen flex bg-background">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={selectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        onExportChat={exportChat}
        onOpenSettings={() => setShowSettings(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {currentSession ? (
          <>
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-3xl mx-auto px-4 py-6">
                    {currentSession.messages.length === 0 ? (
                      <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={20} className="text-primary" />
                          </div>
                          <p className="text-base font-medium text-foreground">Start a conversation</p>
                          <p className="text-sm text-muted-foreground mt-1">Write a message below to begin</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {currentSession.messages.map((message, index) => (
                          <ChatMessage
                            key={`${message.timestamp}-${message.role}-${index}`}
                            message={message}
                            showTimestamp={config.ui.show_timestamps}
                            showWordCount={config.ui.show_word_count}
                            compactMode={config.ui.compact_mode}
                            theme={theme}
                          />
                        ))}

                        {streamingMessage && (
                          <ChatMessage
                            message={{
                              role: "assistant",
                              content: streamingMessage,
                              timestamp: Date.now(),
                            }}
                            showTimestamp={config.ui.show_timestamps}
                            showWordCount={config.ui.show_word_count}
                            compactMode={config.ui.compact_mode}
                            theme={theme}
                          />
                        )}

                        {isLoading && !streamingMessage && (
                          <div className="flex gap-3 py-4 animate-fade-in">
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                            </div>
                            <div className="text-sm text-muted-foreground pt-1">Thinking...</div>
                          </div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input */}
                <ChatInput
                  onSendMessage={sendMessage}
                  disabled={isLoading}
                  theme={theme}
                  placeholder="Write a message..."
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={28} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-1.5 text-balance">Welcome to Anima</h2>
              <p className="text-sm text-muted-foreground mb-6">Select a chat or start a new conversation</p>
              <Button
                onClick={createNewChat}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                New conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          config={config}
          onSave={saveConfig}
        />
      )}
    </div>
  )
}
