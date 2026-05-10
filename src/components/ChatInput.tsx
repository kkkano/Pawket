import React, { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  onStop: () => void
  isStreaming: boolean
  disabled?: boolean
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onStop,
  isStreaming,
  disabled = false
}) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSend = () => {
    if (isStreaming) {
      onStop()
      return
    }

    if (message.trim() && !disabled) {
      onSend(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-input">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'AI 正在回复...' : '输入消息... (Enter 发送，Shift+Enter 换行)'}
          disabled={disabled || isStreaming}
          rows={1}
        />
        <button
          className={`send-button ${isStreaming ? 'stop' : ''}`}
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !isStreaming)}
        >
          {isStreaming ? '⏹' : '↑'}
        </button>
      </div>
    </div>
  )
}
