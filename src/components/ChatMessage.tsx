import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Message } from '../types'

interface ChatMessageProps {
  message: Message
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user'
  const isStreaming = message.status === 'streaming'
  const isError = message.status === 'error'

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🐾'}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">
            {isUser ? '你' : 'Pawket'}
          </span>
          {message.model && (
            <span className="message-model">{message.model}</span>
          )}
          {isStreaming && (
            <span className="streaming-indicator">●</span>
          )}
        </div>
        <div className="message-body">
          {isUser ? (
            <div className="message-text">{message.content}</div>
          ) : (
            <div className="message-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match
                    return isInline ? (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    ) : (
                      <div className="code-block">
                        <div className="code-header">
                          <span>{match[1]}</span>
                          <button
                            className="copy-button"
                            onClick={() => navigator.clipboard.writeText(String(children))}
                          >
                            复制
                          </button>
                        </div>
                        <pre>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    )
                  }
                }}
              >
                {message.content || (isStreaming ? '思考中...' : '')}
              </ReactMarkdown>
            </div>
          )}
          {isError && (
            <div className="message-error">
              ❌ {message.error || '请求失败'}
            </div>
          )}
        </div>
        {message.tokens && (
          <div className="message-meta">
            <span>Token: {message.tokens.prompt} → {message.tokens.completion}</span>
          </div>
        )}
      </div>
    </div>
  )
}
