import { useState, useRef, useEffect } from 'react'
import { useStore } from '~/stores'
import { cn } from '~/lib/utils'
import { Send, Square, Lightbulb, Search, Paperclip, X, ChevronDown } from 'lucide-react'
import type { ReasoningEffort } from '~/types'

interface Props {
  onSend: (content: string) => void
  onStop: () => void
  isStreaming: boolean
  modelId: string
  providerId: string
}

export function ChatInput({ onSend, onStop, isStreaming, modelId, providerId }: Props) {
  const { providers, updateConversation, activeConversationId, conversations } = useStore()
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [showThinkingPicker, setShowThinkingPicker] = useState(false)
  
  const conv = conversations.find(c => c.id === activeConversationId)
  const provider = providers.find(p => p.id === providerId)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [value])

  const handleSend = () => {
    if (isStreaming) {
      onStop()
      return
    }
    if (value.trim()) {
      onSend(value.trim())
      setValue('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const thinkingOptions: { value: ReasoningEffort; label: string; icon: string }[] = [
    { value: 'none', label: '关闭', icon: '💡' },
    { value: 'minimal', label: '最小', icon: '🔅' },
    { value: 'low', label: '低', icon: '🔆' },
    { value: 'medium', label: '中', icon: '💡' },
    { value: 'high', label: '高', icon: '🔦' },
    { value: 'auto', label: '自动', icon: '🔄' },
  ]

  const currentThinking = conv?.reasoningEffort || 'none'

  return (
    <div className="border-t bg-[var(--color-bg)] p-3 shrink-0">
      {/* Tool bar */}
      <div className="flex items-center gap-1 mb-2">
        {/* Model picker */}
        <div className="relative">
          <button
            onClick={() => { setShowModelPicker(!showModelPicker); setShowThinkingPicker(false) }}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-[#1c1c1c] rounded-lg border hover:bg-[#262626]"
          >
            <span>{modelId || '选择模型'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showModelPicker && provider && (
            <div className="absolute bottom-full mb-1 left-0 w-48 bg-[#1a1a1a] border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {provider.models.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    if (activeConversationId) {
                      updateConversation(activeConversationId, { modelId: m.id })
                    }
                    setShowModelPicker(false)
                  }}
                  className={cn('w-full text-left px-3 py-2 text-sm hover:bg-[#262626]', m.id === modelId && 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]')}
                >
                  {m.name}
                  {m.supportsThinking && <span className="ml-1 text-xs text-yellow-500">💡</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thinking picker */}
        <div className="relative">
          <button
            onClick={() => { setShowThinkingPicker(!showThinkingPicker); setShowModelPicker(false) }}
            className={cn('flex items-center gap-1 px-2 py-1 text-xs rounded-lg border', currentThinking !== 'none' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-[#1c1c1c] hover:bg-[#262626]')}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{thinkingOptions.find(o => o.value === currentThinking)?.label || '思考'}</span>
          </button>
          {showThinkingPicker && (
            <div className="absolute bottom-full mb-1 left-0 w-32 bg-[#1a1a1a] border rounded-lg shadow-lg z-50">
              {thinkingOptions.map(o => (
                <button
                  key={o.value}
                  onClick={() => {
                    if (activeConversationId) {
                      updateConversation(activeConversationId, { reasoningEffort: o.value })
                    }
                    setShowThinkingPicker(false)
                  }}
                  className={cn('w-full text-left px-3 py-2 text-sm hover:bg-[#262626]', o.value === currentThinking && 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]')}
                >
                  {o.icon} {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Web search toggle */}
        {conv && (
          <button
            onClick={() => updateConversation(conv.id, { webSearch: !conv.webSearch })}
            className={cn('flex items-center gap-1 px-2 py-1 text-xs rounded-lg border', conv.webSearch ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-[#1c1c1c] hover:bg-[#262626]')}
          >
            <Search className="w-3.5 h-3.5" />
            <span>搜索</span>
          </button>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'AI 正在回复...' : '输入消息...'}
          disabled={isStreaming}
          rows={1}
          className="flex-1 bg-[#1c1c1c] border rounded-xl px-4 py-3 text-sm resize-none outline-none focus:border-[var(--color-primary)] disabled:opacity-50 max-h-[200px]"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() && !isStreaming}
          className={cn('p-3 rounded-xl transition-colors shrink-0', isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 disabled:opacity-50')}
        >
          {isStreaming ? <Square className="w-4 h-4" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center justify-between mt-1 px-1">
        <span className="text-xs text-[var(--color-muted)]">{value.length} 字符</span>
        <span className="text-xs text-[var(--color-muted)]">Enter 发送</span>
      </div>
    </div>
  )
}
