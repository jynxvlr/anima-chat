"use client"

import { useState } from "react"
import {
  MessageSquare,
  Plus,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  Download,
  Settings,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { ChatSession } from "@/lib/chat-storage"

interface ChatSidebarProps {
  chats: ChatSession[]
  currentChatId: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
  onExportChat: (chatId: string, format: "txt" | "md" | "json") => void
  onOpenSettings: () => void
  theme: "dark" | "light"
  onThemeToggle: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function ChatSidebar({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onExportChat,
  onOpenSettings,
  theme,
  onThemeToggle,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleStartEdit = (chat: ChatSession) => {
    setEditingChatId(chat.id)
    setEditTitle(chat.title)
  }

  const handleSaveEdit = () => {
    if (editingChatId && editTitle.trim()) {
      onRenameChat(editingChatId, editTitle.trim())
    }
    setEditingChatId(null)
    setEditTitle("")
  }

  const handleCancelEdit = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString("en-US")
  }

  const groupedChats = filteredChats.reduce(
    (groups, chat) => {
      const dateKey = formatDate(chat.updatedAt)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(chat)
      return groups
    },
    {} as Record<string, ChatSession[]>,
  )

  if (isCollapsed) {
    return (
      <div className="w-14 bg-sidebar-bg border-r border-sidebar-border flex flex-col items-center py-4">
        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-sidebar-fg hover:text-foreground hover:bg-sidebar-hover"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-1">
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-sidebar-fg hover:text-foreground hover:bg-sidebar-hover"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            onClick={onOpenSettings}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-sidebar-fg hover:text-foreground hover:bg-sidebar-hover"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            onClick={onThemeToggle}
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-sidebar-fg hover:text-foreground hover:bg-sidebar-hover"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-72 bg-sidebar-bg border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border">
        <span className="text-sm font-semibold tracking-tight text-foreground">Anima</span>
        <div className="flex items-center gap-1">
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-fg hover:text-foreground hover:bg-sidebar-hover"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-fg hover:text-foreground hover:bg-sidebar-hover"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-transparent border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 px-2">
        <div className="py-1">
          {Object.entries(groupedChats).map(([dateGroup, groupChats]) => (
            <div key={dateGroup} className="mb-3">
              <h3 className="text-[11px] font-medium text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
                {dateGroup}
              </h3>

              {groupChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    group relative flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer
                    transition-colors duration-100
                    ${
                      currentChatId === chat.id
                        ? "bg-accent text-foreground"
                        : "text-sidebar-fg hover:bg-sidebar-hover hover:text-foreground"
                    }
                  `}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />

                  <div className="flex-1 min-w-0">
                    {editingChatId === chat.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit()
                          if (e.key === "Escape") handleCancelEdit()
                        }}
                        className="h-5 text-xs bg-transparent border-none p-0 focus:ring-0"
                        autoFocus
                      />
                    ) : (
                      <div className="text-[13px] font-medium truncate leading-tight">{chat.title}</div>
                    )}
                    <div className="text-[11px] opacity-50 truncate">{chat.messages.length} messages</div>
                  </div>

                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="bg-popover border-border w-40">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(chat)
                          }}
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-2" />
                          Rename
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onExportChat(chat.id, "md")
                          }}
                        >
                          <Download className="h-3.5 w-3.5 mr-2" />
                          Export as Markdown
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onExportChat(chat.id, "txt")
                          }}
                        >
                          <Download className="h-3.5 w-3.5 mr-2" />
                          Export as Text
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The chat &ldquo;{chat.title}&rdquo; will be
                                permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteChat(chat.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className="text-center text-muted-foreground text-xs py-8">
              {searchQuery ? "No chats found" : "No chats yet"}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <Button
            onClick={onOpenSettings}
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-sidebar-fg hover:text-foreground hover:bg-sidebar-hover gap-1.5"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Button>

          <Button
            onClick={onThemeToggle}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-sidebar-fg hover:text-foreground hover:bg-sidebar-hover"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function ChatSidebar({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onExportChat,
  onOpenSettings,
  theme,
  onThemeToggle,
  isCollapsed,
  onToggleCollapse,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  // Filtered chats based on search query
  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Edit chat title
  const handleStartEdit = (chat: ChatSession) => {
    setEditingChatId(chat.id)
    setEditTitle(chat.title)
  }

  const handleSaveEdit = () => {
    if (editingChatId && editTitle.trim()) {
      onRenameChat(editingChatId, editTitle.trim())
    }
    setEditingChatId(null)
    setEditTitle("")
  }

  const handleCancelEdit = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Heute"
    if (diffDays === 1) return "Gestern"
    if (diffDays < 7) return `Vor ${diffDays} Tagen`
    return date.toLocaleDateString("de-DE")
  }

  // Group chats by date
  const groupedChats = filteredChats.reduce(
    (groups, chat) => {
      const dateKey = formatDate(chat.updatedAt)
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(chat)
      return groups
    },
    {} as Record<string, ChatSession[]>,
  )

  if (isCollapsed) {
    return (
      <div className="w-16 bg-gray-900 border-r border-gray-700 flex flex-col">
        <div className="p-3">
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-gray-400 hover:text-white"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1" />

        <div className="p-3 space-y-2">
          <Button onClick={onNewChat} variant="ghost" size="icon" className="w-10 h-10 text-gray-400 hover:text-white">
            <Plus className="h-5 w-5" />
          </Button>

          <Button
            onClick={onOpenSettings}
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-gray-400 hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <Button
            onClick={onThemeToggle}
            variant="ghost"
            size="icon"
            className="w-10 h-10 text-gray-400 hover:text-white"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Anima</h2>
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onNewChat} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          New chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat-List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(groupedChats).map(([dateGroup, groupChats]) => (
            <div key={dateGroup} className="mb-4">
              <h3 className="text-xs font-medium text-gray-400 px-2 py-1 mb-2">{dateGroup}</h3>

              {groupChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    group relative flex items-center p-2 rounded-lg cursor-pointer
                    transition-colors duration-150
                    ${currentChatId === chat.id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"}
                  `}
                  onClick={() => onChatSelect(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    {editingChatId === chat.id ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleSaveEdit}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit()
                          if (e.key === "Escape") handleCancelEdit()
                        }}
                        className="h-6 text-sm bg-transparent border-none p-0 focus:ring-0"
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm font-medium truncate">{chat.title}</div>
                    )}

                    <div className="text-xs opacity-70 truncate">{chat.messages.length} Messages</div>
                  </div>

                  {/* Chat-Actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartEdit(chat)
                          }}
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-gray-600" />

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onExportChat(chat.id, "md")
                          }}
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          As Markdown
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onExportChat(chat.id, "txt")
                          }}
                          className="text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          As Text
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-gray-600" />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="bg-gray-800 border-gray-600">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete chat?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                This action cannot be undone. The chat “{chat.title}” will be 
                                permanently deleted..
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteChat(chat.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              {searchQuery ? "No chats found" : "No chats available yet"}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <Button onClick={onOpenSettings} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>

          <Button
            onClick={onThemeToggle}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-white"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
