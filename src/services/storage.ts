import { Conversation, Provider } from '../types'

const STORAGE_KEYS = {
  CONVERSATIONS: 'pawket_conversations',
  CURRENT_CONVERSATION: 'pawket_current_conversation',
  PROVIDERS: 'pawket_providers',
  CURRENT_PROVIDER: 'pawket_current_provider',
  SETTINGS: 'pawket_settings'
}

export class StorageService {
  // Conversations
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  saveConversations(conversations: Conversation[]): void {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations))
  }

  getConversation(id: string): Conversation | null {
    const conversations = this.getConversations()
    return conversations.find(c => c.id === id) || null
  }

  saveConversation(conversation: Conversation): void {
    const conversations = this.getConversations()
    const index = conversations.findIndex(c => c.id === conversation.id)
    if (index >= 0) {
      conversations[index] = conversation
    } else {
      conversations.unshift(conversation)
    }
    this.saveConversations(conversations)
  }

  deleteConversation(id: string): void {
    const conversations = this.getConversations()
    this.saveConversations(conversations.filter(c => c.id !== id))
  }

  getCurrentConversationId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION)
  }

  setCurrentConversationId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, id)
  }

  // Providers
  getProviders(): Provider[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROVIDERS)
      return data ? JSON.parse(data) : [getDefaultProvider()]
    } catch {
      return [getDefaultProvider()]
    }
  }

  saveProviders(providers: Provider[]): void {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers))
  }

  getCurrentProviderId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PROVIDER) || 'xiaomi-mimo'
  }

  setCurrentProviderId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROVIDER, id)
  }

  // Settings
  getSettings(): Record<string, any> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }

  saveSettings(settings: Record<string, any>): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  }
}

export function getDefaultProvider(): Provider {
  return {
    id: 'xiaomi-mimo',
    name: 'Xiaomi MiMo',
    type: 'openai-compatible',
    baseUrl: 'https://token-plan-cn.xiaomimo.com/v1',
    apiKey: '',
    defaultModel: 'mimo-v2.5-pro',
    availableModels: ['mimo-v2.5', 'mimo-v2.5-pro', 'mimo-v2.5-tts']
  }
}

export const storage = new StorageService()
