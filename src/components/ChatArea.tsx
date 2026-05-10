import { useRef, useEffect } from 'react'
import { useStore } from '~/stores'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { MessageSquare, Settings, Bot } from 'lucide-react'

export function ChatArea() {
  const { conversations, activeConversationId, sendMessage, stopGeneration } = useStore()
  const conv = conversations.find(c => c.id === activeConversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv?.messages])

  if (!conv) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">🐾</div>
        <h1 className="text-2xl font-bold mb-2">欢迎使用 Pawket</h1>
        <p className="text-[var(--color-muted)] mb-8">选择一个对话或创建新对话开始</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md">
          {[
            { icon: '💬', text: '智能对话' },
            { icon: '🔄', text: '流式响应' },
            { icon: '🤖', text: '多模型' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-2 p-3 bg-[#141414] rounded-lg border">
              <span>{f.icon}</span>
              <span className="text-sm">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isStreamingThis = conv.messages.some(m => m.isStreaming)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <div className="flex items-center gap-2 ml-10 md:ml-0">
          <h2 className="text-sm font-medium truncate">{conv.title}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
          <span>{conv.modelId}</span>
          {conv.reasoningEffort !== 'none' && <span className="text-yellow-500">💡 {conv.reasoningEffort}</span>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conv.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-muted)]">
            <div className="text-4xl mb-3">💭</div>
            <p>开始对话吧</p>
          </div>
        ) : (
          conv.messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} conversation={conv} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onStop={stopGeneration}
        isStreaming={isStreamingThis}
        modelId={conv.modelId}
        providerId={conv.providerId}
      />
    </div>
  )
}
