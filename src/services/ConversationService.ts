import { Conversation, Message, Provider, Assistant } from '../types'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'pawket_conversations'
const PROVIDERS_KEY = 'pawket_providers'
const ASSISTANTS_KEY = 'pawket_assistants'

export class ConversationService {
  // Conversations
  static getConversations(): Conversation[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  static saveConversations(conversations: Conversation[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  }

  static getConversation(id: string): Conversation | null {
    const conversations = this.getConversations()
    return conversations.find(c => c.id === id) || null
  }

  static createConversation(title: string = 'New Chat', assistantId?: string): Conversation {
    const conversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      assistantId,
    }
    const conversations = this.getConversations()
    conversations.unshift(conversation)
    this.saveConversations(conversations)
    return conversation
  }

  static updateConversation(id: string, updates: Partial<Conversation>) {
    const conversations = this.getConversations()
    const index = conversations.findIndex(c => c.id === id)
    if (index !== -1) {
      conversations[index] = { ...conversations[index], ...updates, updatedAt: Date.now() }
      this.saveConversations(conversations)
    }
  }

  static deleteConversation(id: string) {
    const conversations = this.getConversations().filter(c => c.id !== id)
    this.saveConversations(conversations)
  }

  static addMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    }
    const conversations = this.getConversations()
    const index = conversations.findIndex(c => c.id === conversationId)
    if (index !== -1) {
      conversations[index].messages.push(newMessage)
      conversations[index].updatedAt = Date.now()
      // Auto-title from first user message
      if (conversations[index].messages.length === 1 && message.role === 'user') {
        conversations[index].title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
      }
      this.saveConversations(conversations)
    }
    return newMessage
  }

  static updateMessage(conversationId: string, messageId: string, updates: Partial<Message>) {
    const conversations = this.getConversations()
    const convIndex = conversations.findIndex(c => c.id === conversationId)
    if (convIndex !== -1) {
      const msgIndex = conversations[convIndex].messages.findIndex(m => m.id === messageId)
      if (msgIndex !== -1) {
        conversations[convIndex].messages[msgIndex] = {
          ...conversations[convIndex].messages[msgIndex],
          ...updates,
        }
        this.saveConversations(conversations)
      }
    }
  }

  // Providers
  static getProviders(): Provider[] {
    const data = localStorage.getItem(PROVIDERS_KEY)
    if (data) return JSON.parse(data)
    // Default providers
    const defaults: Provider[] = [
      {
        id: 'xiaomi-mimo',
        name: 'Xiaomi MiMo',
        type: 'openai-compatible',
        baseUrl: 'https://token-plan-cn.xiaomimo.com/v1',
        apiKey: '',
        defaultModel: 'mimo-v2.5-pro',
        availableModels: ['mimo-v2.5', 'mimo-v2.5-pro', 'mimo-v2.5-tts'],
      },
    ]
    this.saveProviders(defaults)
    return defaults
  }

  static saveProviders(providers: Provider[]) {
    localStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers))
  }

  static updateProvider(id: string, updates: Partial<Provider>) {
    const providers = this.getProviders()
    const index = providers.findIndex(p => p.id === id)
    if (index !== -1) {
      providers[index] = { ...providers[index], ...updates }
      this.saveProviders(providers)
    }
  }

  // Assistants
  static getAssistants(): Assistant[] {
    const data = localStorage.getItem(ASSISTANTS_KEY)
    if (data) return JSON.parse(data)
    // Default assistants
    const defaults: Assistant[] = [
      {
        id: 'default',
        name: 'General Assistant',
        avatar: '🤖',
        systemPrompt: 'You are a helpful AI assistant.',
        modelId: 'mimo-v2.5-pro',
        providerId: 'xiaomi-mimo',
        temperature: 0.7,
        maxTokens: 4096,
      },
      {
        id: 'coder',
        name: 'Code Expert',
        avatar: '💻',
        systemPrompt: 'You are an expert programmer. Help users write, debug, and understand code. Always provide clear explanations and best practices.',
        modelId: 'mimo-v2.5-pro',
        providerId: 'xiaomi-mimo',
        temperature: 0.3,
        maxTokens: 8192,
      },
      {
        id: 'creative',
        name: 'Creative Writer',
        avatar: '✍️',
        systemPrompt: 'You are a creative writer. Help users with writing stories, articles, and creative content. Be imaginative and engaging.',
        modelId: 'mimo-v2.5-pro',
        providerId: 'xiaomi-mimo',
        temperature: 0.9,
        maxTokens: 4096,
      },
    ]
    this.saveAssistants(defaults)
    return defaults
  }

  static saveAssistants(assistants: Assistant[]) {
    localStorage.setItem(ASSISTANTS_KEY, JSON.stringify(assistants))
  }

  static getAssistant(id: string): Assistant | null {
    return this.getAssistants().find(a => a.id === id) || null
  }
}
