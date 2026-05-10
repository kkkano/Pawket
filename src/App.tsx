import React, { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './components/ChatMessage'
import { ChatInput } from './components/ChatInput'
import { ConversationList } from './components/ConversationList'
import { Settings } from './components/Settings'
import { useStore } from './stores/chat'
import './styles/app.css'

function App() {
  const {
    conversations,
    currentConversation,
    currentProvider,
    providers,
    createConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
    stopGeneration,
    updateProvider,
    setCurrentProvider
  } = useStore()

  const [showSettings, setShowSettings] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isStreaming = currentConversation?.messages.some(m => m.status === 'streaming') || false

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <ConversationList
          conversations={conversations}
          currentId={currentConversation?.id || null}
          onSelect={selectConversation}
          onDelete={deleteConversation}
          onNew={createConversation}
        />
        <div className="sidebar-footer">
          <button
            className="provider-button"
            onClick={() => setShowSettings(true)}
          >
            ⚙️ {currentProvider.name}
          </button>
          <select
            className="provider-select"
            value={currentProvider.id}
            onChange={(e) => setCurrentProvider(e.target.value)}
          >
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main">
        <div className="chat-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="header-info">
            <h1>{currentConversation?.title || 'Pawket'}</h1>
            {currentConversation && (
              <span className="model-info">
                {currentConversation.model} · {currentProvider.name}
              </span>
            )}
          </div>
          <button
            className="settings-button"
            onClick={() => setShowSettings(true)}
          >
            ⚙️
          </button>
        </div>

        <div className="messages">
          {!currentConversation ? (
            <div className="welcome">
              <div className="welcome-icon">🐾</div>
              <h2>欢迎使用 Pawket</h2>
              <p>Pocket-sized cat-paw AI</p>
              <button onClick={createConversation}>
                开始新对话
              </button>
            </div>
          ) : currentConversation.messages.length === 0 ? (
            <div className="empty-chat">
              <p>开始对话吧！</p>
            </div>
          ) : (
            currentConversation.messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          onSend={sendMessage}
          onStop={stopGeneration}
          isStreaming={isStreaming}
          disabled={!currentConversation && !currentProvider.apiKey}
        />
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          provider={currentProvider}
          onUpdate={updateProvider}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App
