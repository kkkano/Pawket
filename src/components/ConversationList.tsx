import React from 'react'
import { Conversation } from '../types'

interface ConversationListProps {
  conversations: Conversation[]
  currentId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentId,
  onSelect,
  onDelete,
  onNew
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="conversation-list">
      <div className="conversation-header">
        <h2>🐾 Pawket</h2>
        <button className="new-chat-button" onClick={onNew}>
          ✚ 新对话
        </button>
      </div>
      <div className="conversations">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <p>还没有对话</p>
            <p>点击上方按钮开始新对话</p>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${conv.id === currentId ? 'active' : ''}`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="conversation-info">
                <div className="conversation-title">{conv.title}</div>
                <div className="conversation-meta">
                  <span className="conversation-model">{conv.model}</span>
                  <span className="conversation-time">
                    {formatDate(conv.updatedAt)}
                  </span>
                </div>
              </div>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(conv.id)
                }}
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
