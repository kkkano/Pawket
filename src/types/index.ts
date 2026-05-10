export interface Provider {
  id: string
  name: string
  apiUrl: string
  apiKey: string
  icon: string
  models: Model[]
  isBuiltIn?: boolean
}

export interface Model {
  id: string
  name: string
  supportsThinking?: boolean
  supportsVision?: boolean
}

export interface Conversation {
  id: string
  title: string
  systemPrompt: string
  modelId: string
  providerId: string
  temperature: number
  maxTokens: number
  reasoningEffort: ReasoningEffort
  webSearch: boolean
  messages: Message[]
  isPinned?: boolean
  createdAt: number
  updatedAt: number
}

export type ReasoningEffort = 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'auto'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoningContent?: string
  isStreaming?: boolean
  error?: string
  tokenUsage?: TokenUsage
  createdAt: number
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  durationMs?: number
}

export interface AppSettings {
  theme: 'dark' | 'light'
  sendOnEnter: boolean
  showTimestamp: boolean
  fontSize: number
}
