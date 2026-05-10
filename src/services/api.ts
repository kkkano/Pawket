import { ChatRequest, ChatResponse, StreamChunk, Provider } from '../types'

export class ApiService {
  private provider: Provider
  private abortController: AbortController | null = null

  constructor(provider: Provider) {
    this.provider = provider
  }

  updateProvider(provider: Provider) {
    this.provider = provider
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    this.abortController = new AbortController()

    const response = await fetch(`${this.provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider.apiKey}`
      },
      body: JSON.stringify({
        ...request,
        model: request.model || this.provider.defaultModel,
        stream: false
      }),
      signal: this.abortController.signal
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    return response.json()
  }

  async *chatStream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    this.abortController = new AbortController()

    const response = await fetch(`${this.provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider.apiKey}`
      },
      body: JSON.stringify({
        ...request,
        model: request.model || this.provider.defaultModel,
        stream: true
      }),
      signal: this.abortController.signal
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error ${response.status}: ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          try {
            const json = JSON.parse(trimmed.slice(6))
            yield json as StreamChunk
          } catch (e) {
            console.warn('Failed to parse SSE chunk:', trimmed)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.provider.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.provider.apiKey}`
        }
      })

      if (!response.ok) {
        return this.provider.availableModels
      }

      const data = await response.json()
      return data.data?.map((m: any) => m.id) || this.provider.availableModels
    } catch {
      return this.provider.availableModels
    }
  }
}

export const createApiService = (provider: Provider) => new ApiService(provider)
