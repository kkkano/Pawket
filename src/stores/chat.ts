import { useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Conversation, Message, Provider } from '../types'
import { storage, getDefaultProvider } from '../services/storage'
import { ApiService, createApiService } from '../services/api'

// Global state
let conversations: Conversation[] = []
let currentConversationId: string | null = null
let providers: Provider[] = []
let currentProviderId: string = 'xiaomi-mimo'
let apiService: ApiService | null = null
let listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach(listener => listener())
}

export function useStore() {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])

  // Initialize
  useEffect(() => {
    conversations = storage.getConversations()
    currentConversationId = storage.getCurrentConversationId()
    providers = storage.getProviders()
    currentProviderId = storage.getCurrentProviderId()

    const provider = providers.find(p => p.id === currentProviderId) || getDefaultProvider()
    apiService = createApiService(provider)

    notifyListeners()
  }, [])

  const currentConversation = conversations.find(c => c.id === currentConversationId) || null
  const currentProvider = providers.find(p => p.id === currentProviderId) || getDefaultProvider()

  const createConversation = useCallback(() => {
    const conversation: Conversation = {
      id: uuidv4(),
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: currentProvider.defaultModel,
      provider: currentProviderId
    }

    conversations = [conversation, ...conversations]
    currentConversationId = conversation.id
    storage.saveConversations(conversations)
    storage.setCurrentConversationId(conversation.id)
    notifyListeners()
    return conversation
  }, [currentProvider, currentProviderId])

  const selectConversation = useCallback((id: string) => {
    currentConversationId = id
    storage.setCurrentConversationId(id)
    notifyListeners()
  }, [])

  const deleteConversation = useCallback((id: string) => {
    conversations = conversations.filter(c => c.id !== id)
    if (currentConversationId === id) {
      currentConversationId = conversations[0]?.id || null
      storage.setCurrentConversationId(currentConversationId || '')
    }
    storage.saveConversations(conversations)
    notifyListeners()
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!apiService || !content.trim()) return

    let conversation = currentConversation
    if (!conversation) {
      conversation = createConversation()
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      status: 'done'
    }

    // Add assistant placeholder
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'streaming',
      model: conversation.model,
      provider: conversation.provider
    }

    conversation.messages = [...conversation.messages, userMessage, assistantMessage]
    conversation.updatedAt = Date.now()

    // Update title if first message
    if (conversation.messages.length === 2) {
      conversation.title = content.slice(0, 50) + (content.length > 50 ? '...' : '')
    }

    storage.saveConversation(conversation)
    notifyListeners()

    try {
      // Prepare messages for API
      const apiMessages = conversation.messages
        .filter(m => m.id !== assistantMessage.id)
        .map(m => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content
        }))

      if (conversation.systemPrompt) {
        apiMessages.unshift({
          role: 'system',
          content: conversation.systemPrompt
        })
      }

      // Stream response
      let fullContent = ''
      const stream = apiService.chatStream({
        model: conversation.model,
        messages: apiMessages,
        stream: true
      })

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) {
          fullContent += delta
          assistantMessage.content = fullContent
          notifyListeners()
        }
      }

      assistantMessage.status = 'done'
      assistantMessage.tokens = {
        prompt: 0,
        completion: 0
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        assistantMessage.status = 'done'
      } else {
        assistantMessage.status = 'error'
        assistantMessage.error = error.message
      }
    }

    storage.saveConversation(conversation)
    notifyListeners()
  }, [currentConversation, createConversation])

  const stopGeneration = useCallback(() => {
    apiService?.abort()
  }, [])

  const updateProvider = useCallback((provider: Provider) => {
    const index = providers.findIndex(p => p.id === provider.id)
    if (index >= 0) {
      providers[index] = provider
    } else {
      providers.push(provider)
    }
    storage.saveProviders(providers)
    apiService?.updateProvider(provider)
    notifyListeners()
  }, [])

  const setCurrentProvider = useCallback((id: string) => {
    currentProviderId = id
    storage.setCurrentProviderId(id)
    const provider = providers.find(p => p.id === id)
    if (provider) {
      apiService?.updateProvider(provider)
    }
    notifyListeners()
  }, [])

  return {
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
  }
}
