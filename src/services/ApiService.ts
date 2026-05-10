import { Provider, Message, StreamChunk } from '../types'

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

  async *streamChat(
    messages: { role: string; content: string }[],
    model?: string,
    temperature: number = 0.7,
    maxTokens: number = 4096
  ): AsyncGenerator<StreamChunk> {
    this.abortController = new AbortController()

    const modelId = model || this.provider.defaultModel
    const url = `${this.provider.baseUrl}/chat/completions`

    const body = {
      model: modelId,
      messages,
      stream: true,
      temperature,
      max_tokens: maxTokens,
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.provider.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: this.abortController.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error ${response.status}: ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

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
            const data = JSON.parse(trimmed.slice(6))
            const content = data.choices?.[0]?.delta?.content || ''
            const finishReason = data.choices?.[0]?.finish_reason

            if (content) {
              yield { type: 'content', content }
            }

            if (finishReason === 'stop') {
              yield { type: 'done' }
            }

            if (data.usage) {
              yield {
                type: 'usage',
                usage: {
                  promptTokens: data.usage.prompt_tokens,
                  completionTokens: data.usage.completion_tokens,
                },
              }
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }

      yield { type: 'done' }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        yield { type: 'done' }
      } else {
        yield { type: 'error', error: error.message }
      }
    } finally {
      this.abortController = null
    }
  }

  async chat(
    messages: { role: string; content: string }[],
    model?: string,
    temperature: number = 0.7,
    maxTokens: number = 4096
  ): Promise<{ content: string; usage?: { promptTokens: number; completionTokens: number } }> {
    const modelId = model || this.provider.defaultModel
    const url = `${this.provider.baseUrl}/chat/completions`

    const body = {
      model: modelId,
      messages,
      stream: false,
      temperature,
      max_tokens: maxTokens,
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
      } : undefined,
    }
  }
}
