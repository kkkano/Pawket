import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '~/stores'
import { cn, formatDuration } from '~/lib/utils'
import { Copy, RefreshCw, Trash2, Pencil, Check, ChevronDown, ChevronRight } from 'lucide-react'
import type { Message, Conversation } from '~/types'

interface Props {
  message: Message
  conversation: Conversation
}

export function ChatMessage({ message, conversation }: Props) {
  const { deleteMessage, regenerateMessage, updateMessage } = useStore()
  const [showThinking, setShowThinking] = useState(true)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  
  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming
  const hasThinking = message.reasoningContent && message.reasoningContent.length > 0
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleEdit = () => {
    if (editing) {
      updateMessage(conversation.id, message.id, { content: editContent })
      setEditing(false)
    } else {
      setEditContent(message.content)
      setEditing(true)
    }
  }
  
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-sm shrink-0">🐾</div>}
      
      <div className={cn('max-w-[85%] space-y-1', isUser ? 'order-1' : '')}>
        {/* Thinking block */}
        {hasThinking && !isUser && (
          <div className="rounded-lg border border-[var(--color-thinking-border)] bg-[var(--color-thinking)] overflow-hidden">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-white/5"
            >
              {showThinking ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span>💡 思考过程</span>
              {message.tokenUsage?.durationMs && (
                <span className="text-xs">({formatDuration(message.tokenUsage.durationMs)})</span>
              )}
            </button>
            {showThinking && (
              <div className="px-3 py-2 border-t border-[var(--color-thinking-border)] text-sm text-[var(--color-muted)] markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.reasoningContent!}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
        
        {/* Message content */}
        <div className={cn('rounded-xl px-4 py-3', isUser ? 'bg-[var(--color-primary)] text-white' : 'bg-[#1c1c1c]')}>
          {isStreaming && !message.content && (
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
          
          {message.error ? (
            <div className="text-red-400 text-sm">❌ {message.error}</div>
          ) : editing ? (
            <div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full bg-transparent border rounded p-2 text-sm resize-none"
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={handleEdit} className="px-3 py-1 bg-[var(--color-primary)] rounded text-sm">保存</button>
                <button onClick={() => setEditing(false)} className="px-3 py-1 bg-[#333] rounded text-sm">取消</button>
              </div>
            </div>
          ) : (
            <div className={cn('markdown-body text-sm', isUser ? 'whitespace-pre-wrap' : '')}>
              {isUser ? (
                message.content
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const isInline = !match
                      return isInline ? (
                        <code className="bg-[#1c1c1c] px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between px-4 py-1 bg-[#111] border border-[var(--color-border)] rounded-t-lg text-xs text-[var(--color-muted)]">
                            <span>{match[1]}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(String(children))}
                              className="hover:text-white"
                            >复制</button>
                          </div>
                          <pre className="!rounded-t-none !mt-0 !border !border-t-0">
                            <code className={className} {...props}>{children}</code>
                          </pre>
                        </div>
                      )
                    },
                    a({ href, children }) {
                      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] underline">{children}</a>
                    },
                    table({ children }) {
                      return <div className="overflow-x-auto">{children}</div>
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )}
        </div>
        
        {/* Token usage */}
        {message.tokenUsage && !isUser && (
          <div className="flex items-center gap-3 px-1 text-xs text-[var(--color-muted)]">
            <span>↑ {message.tokenUsage.promptTokens}</span>
            <span>↓ {message.tokenUsage.completionTokens}</span>
            {message.tokenUsage.durationMs && <span>⏱ {formatDuration(message.tokenUsage.durationMs)}</span>}
          </div>
        )}
        
        {/* Actions */}
        {!isUser && !isStreaming && !message.error && (
          <div className="flex items-center gap-1 px-1">
            <button onClick={handleCopy} className="p-1.5 hover:bg-[#262626] rounded text-[var(--color-muted)]" title="复制">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => regenerateMessage(message.id)} className="p-1.5 hover:bg-[#262626] rounded text-[var(--color-muted)]" title="重新生成">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {!isUser && <button onClick={handleEdit} className="p-1.5 hover:bg-[#262626] rounded text-[var(--color-muted)]" title="编辑">
              <Pencil className="w-3.5 h-3.5" />
            </button>}
            <button onClick={() => deleteMessage(conversation.id, message.id)} className="p-1.5 hover:bg-[#262626] rounded text-[var(--color-muted)]" title="删除">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      
      {isUser && <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-sm shrink-0">👤</div>}
    </div>
  )
}
