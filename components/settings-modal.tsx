"use client"

import { useState, useEffect } from "react"
import { Settings, X, Save, RotateCcw, Eye, EyeOff, Zap, Globe, Palette, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { LLMConfig } from "@/lib/config"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  config: LLMConfig
  onSave: (config: LLMConfig) => void
}

export function SettingsModal({ isOpen, onClose, config, onSave }: SettingsModalProps) {
  const [localConfig, setLocalConfig] = useState<LLMConfig>(config)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalConfig(config)
    setHasChanges(false)
  }, [config, isOpen])

  const updateConfig = (updates: Partial<LLMConfig>) => {
    setLocalConfig((prev) => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const updateLLMConfig = (updates: Partial<LLMConfig["llm"]>) => {
    updateConfig({ llm: { ...localConfig.llm, ...updates } })
  }

  const updateAppConfig = (updates: Partial<LLMConfig["app"]>) => {
    updateConfig({ app: { ...localConfig.app, ...updates } })
  }

  const updateUIConfig = (updates: Partial<LLMConfig["ui"]>) => {
    updateConfig({ ui: { ...localConfig.ui, ...updates } })
  }

  const updateApiKey = (provider: string, key: string) => {
    updateLLMConfig({
      api_keys: { ...localConfig.llm.api_keys, [provider]: key },
    })
  }

  const handleSave = () => {
    onSave(localConfig)
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalConfig(config)
    setHasChanges(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Settings</h2>
            {hasChanges && (
              <Badge variant="secondary" className="text-[11px] h-5 bg-primary/10 text-primary border-0">
                Unsaved
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {hasChanges && (
              <>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>

                <Button
                  onClick={handleSave}
                  size="sm"
                  className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                >
                  <Save className="h-3 w-3" />
                  Save
                </Button>
              </>
            )}

            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-56px)]">
          <Tabs defaultValue="llm" className="space-y-6">
            <TabsList className="bg-muted h-9 p-1">
              <TabsTrigger value="llm" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                <Zap className="h-3 w-3" />
                AI Models
              </TabsTrigger>
              <TabsTrigger value="app" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                <Globe className="h-3 w-3" />
                General
              </TabsTrigger>
              <TabsTrigger value="ui" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                <Palette className="h-3 w-3" />
                Interface
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground">
                <Code className="h-3 w-3" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* AI Models Tab */}
            <TabsContent value="llm" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">Provider & Models</h3>
                  <p className="text-xs text-muted-foreground">Configure your AI providers and models</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Active Provider</Label>
                    <Select
                      value={localConfig.llm.active_provider}
                      onValueChange={(value) => updateLLMConfig({ active_provider: value })}
                    >
                      <SelectTrigger className="h-9 bg-background border-border text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(localConfig.llm.models).map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground">Default Model</Label>
                    <Select
                      value={localConfig.llm.default_model}
                      onValueChange={(value) => updateLLMConfig({ default_model: value })}
                    >
                      <SelectTrigger className="h-9 bg-background border-border text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {localConfig.llm.models[localConfig.llm.active_provider]?.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-foreground">API Keys</Label>
                    <Button
                      onClick={() => setShowApiKeys(!showApiKeys)}
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showApiKeys ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>

                  {Object.entries(localConfig.llm.api_keys).map(([provider, key]) => (
                    <div key={provider} className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground capitalize">{provider}</Label>
                      <Input
                        type={showApiKeys ? "text" : "password"}
                        value={key}
                        onChange={(e) => updateApiKey(provider, e.target.value)}
                        placeholder={`${provider} API Key`}
                        className="h-9 bg-background border-border text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">Model Parameters</h3>
                  <p className="text-xs text-muted-foreground">Fine-tune the AI responses</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Temperature</Label>
                      <span className="text-xs font-mono text-muted-foreground">{localConfig.llm.temperature}</span>
                    </div>
                    <Slider
                      value={[localConfig.llm.temperature]}
                      onValueChange={([value]) => updateLLMConfig({ temperature: value })}
                      max={2}
                      min={0}
                      step={0.1}
                    />
                    <p className="text-[11px] text-muted-foreground">Lower = more consistent, higher = more creative</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Max Tokens</Label>
                      <span className="text-xs font-mono text-muted-foreground">{localConfig.llm.max_tokens}</span>
                    </div>
                    <Slider
                      value={[localConfig.llm.max_tokens]}
                      onValueChange={([value]) => updateLLMConfig({ max_tokens: value })}
                      max={4096}
                      min={256}
                      step={256}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Top P</Label>
                      <span className="text-xs font-mono text-muted-foreground">{localConfig.llm.top_p}</span>
                    </div>
                    <Slider
                      value={[localConfig.llm.top_p]}
                      onValueChange={([value]) => updateLLMConfig({ top_p: value })}
                      max={1}
                      min={0}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">System Prompt</h3>
                  <p className="text-xs text-muted-foreground">Define the AI behavior</p>
                </div>
                <Textarea
                  value={localConfig.llm.system_prompt}
                  onChange={(e) => updateLLMConfig({ system_prompt: e.target.value })}
                  placeholder="You are a helpful assistant..."
                  className="min-h-[100px] bg-background border-border text-sm"
                />
              </div>
            </TabsContent>

            {/* General Tab */}
            <TabsContent value="app" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">General Settings</h3>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">Theme</Label>
                  <Select
                    value={localConfig.app.theme}
                    onValueChange={(value: "dark" | "light") => updateAppConfig({ theme: value })}
                  >
                    <SelectTrigger className="h-9 bg-background border-border text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-foreground">Auto Save</Label>
                    <p className="text-[11px] text-muted-foreground">Automatically save chats</p>
                  </div>
                  <Switch
                    checked={localConfig.app.auto_save}
                    onCheckedChange={(checked) => updateAppConfig({ auto_save: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-foreground">Max chat history</Label>
                    <span className="text-xs font-mono text-muted-foreground">{localConfig.app.max_history_files}</span>
                  </div>
                  <Slider
                    value={[localConfig.app.max_history_files]}
                    onValueChange={([value]) => updateAppConfig({ max_history_files: value })}
                    max={500}
                    min={10}
                    step={10}
                  />
                </div>
              </div>
            </TabsContent>

            {/* UI Tab */}
            <TabsContent value="ui" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">Interface</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-foreground">Sidebar width</Label>
                    <span className="text-xs font-mono text-muted-foreground">{localConfig.ui.sidebar_width}px</span>
                  </div>
                  <Slider
                    value={[localConfig.ui.sidebar_width]}
                    onValueChange={([value]) => updateUIConfig({ sidebar_width: value })}
                    max={400}
                    min={200}
                    step={20}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-foreground">Show timestamps</Label>
                    <p className="text-[11px] text-muted-foreground">Display time on messages</p>
                  </div>
                  <Switch
                    checked={localConfig.ui.show_timestamps}
                    onCheckedChange={(checked) => updateUIConfig({ show_timestamps: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-foreground">Show word count</Label>
                    <p className="text-[11px] text-muted-foreground">Display word count on messages</p>
                  </div>
                  <Switch
                    checked={localConfig.ui.show_word_count}
                    onCheckedChange={(checked) => updateUIConfig({ show_word_count: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-foreground">Compact mode</Label>
                    <p className="text-[11px] text-muted-foreground">Reduced spacing and smaller elements</p>
                  </div>
                  <Switch
                    checked={localConfig.ui.compact_mode}
                    onCheckedChange={(checked) => updateUIConfig({ compact_mode: checked })}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-1">Advanced Settings</h3>
                  <p className="text-xs text-muted-foreground">For experienced users</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-foreground">Configuration (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(localConfig, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        setLocalConfig(parsed)
                        setHasChanges(true)
                      } catch {
                        // Ignore invalid JSON
                      }
                    }}
                    className="min-h-[300px] bg-background border-border font-mono text-xs"
                    placeholder="Configuration as JSON..."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Warning: Invalid configuration may break the application.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
