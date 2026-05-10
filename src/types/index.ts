export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  status: 'sending' | 'streaming' | 'done' | 'error'
  error?: string
  model?: string
  provider?: string
  tokens?: {
    prompt: number
    completion: number
  }
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  model: string
  provider: string
  systemPrompt?: string
}

export interface Provider {
  id: string
  name: string
  type: 'openai-compatible' | 'anthropic' | 'gemini'
  baseUrl: string
  apiKey: string
  defaultModel: string
  availableModels: string[]
}

export interface ChatRequest {
  model: string
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
}

export interface ChatResponse {
  id: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface StreamChunk {
  id: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }>
}

export type ThemeMode = 'light' | 'dark' | 'system'
