import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { generateId } from '~/lib/utils'
import type { Provider, Model, Conversation, Message, ReasoningEffort, TokenUsage, AppSettings } from '~/types'

// Default providers
const DEFAULT_PROVIDERS: Provider[] = [
  {
    id: 'xiaomi-mimo',
    name: 'Xiaomi MiMo',
    apiUrl: 'https://token-plan-cn.xiaomimo.com/v1',
    apiKey: '',
    icon: '🐱',
    isBuiltIn: true,
    models: [
      { id: 'mimo-v2.5', name: 'MiMo v2.5' },
      { id: 'mimo-v2.5-pro', name: 'MiMo v2.5 Pro', supportsThinking: true },
      { id: 'mimo-v2.5-tts', name: 'MiMo v2.5 TTS' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1',
    apiKey: '',
    icon: '🤖',
    isBuiltIn: true,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', supportsVision: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'o1-mini', name: 'o1-mini', supportsThinking: true }
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/v1',
    apiKey: '',
    icon: '🐋',
    isBuiltIn: true,
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', supportsThinking: true }
    ]
  }
]

// Store interface
interface AppState {
  // Data
  providers: Provider[]
  currentProviderId: string
  conversations: Conversation[]
  activeConversationId: string | null
  settings: AppSettings
  
  // UI State
  sidebarOpen: boolean
  
  // Provider actions
  addProvider: (provider: Provider) => void
  updateProvider: (id: string, updates: Partial<Provider>) => void
  deleteProvider: (id: string) => void
  setCurrentProvider: (id: string) => void
  
  // Conversation actions
  createConversation: () => string
  deleteConversation: (id: string) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  setActiveConversation: (id: string | null) => void
  clearMessages: (id: string) => void
  togglePin: (id: string) => void
  
  // Message actions
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  
  // Chat actions
  sendMessage: (content: string) => Promise<void>
  stopGeneration: () => void
  regenerateMessage: (messageId: string) => Promise<void>
  
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void
  
  // UI
  setSidebarOpen: (open: boolean) => void
  
  // Helpers
  getActiveConversation: () => Conversation | undefined
  getCurrentProvider: () => Provider | undefined
}

let abortController: AbortController | null = null

export const useStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      providers: DEFAULT_PROVIDERS,
      currentProviderId: 'xiaomi-mimo',
      conversations: [],
      activeConversationId: null,
      settings: {
        theme: 'dark',
        sendOnEnter: true,
        showTimestamp: true,
        fontSize: 14
      },
      sidebarOpen: false,
      
      // Provider actions
      addProvider: (provider) => set(state => {
        state.providers.push(provider)
      }),
      
      updateProvider: (id, updates) => set(state => {
        const p = state.providers.find(p => p.id === id)
        if (p) Object.assign(p, updates)
      }),
      
      deleteProvider: (id) => set(state => {
        state.providers = state.providers.filter(p => p.id !== id)
        if (state.currentProviderId === id) {
          state.currentProviderId = state.providers[0]?.id || ''
        }
      }),
      
      setCurrentProvider: (id) => set({ currentProviderId: id }),
      
      // Conversation actions
      createConversation: () => {
        const state = get()
        const id = generateId()
        const now = Date.now()
        
        set(s => {
          s.conversations.unshift({
            id,
            title: '新对话',
            systemPrompt: '',
            modelId: state.providers.find(p => p.id === state.currentProviderId)?.models[0]?.id || '',
            providerId: state.currentProviderId,
            temperature: 0.7,
            maxTokens: 4096,
            reasoningEffort: 'none',
            webSearch: false,
            messages: [],
            createdAt: now,
            updatedAt: now
          })
          s.activeConversationId = id
        })
        
        return id
      },
      
      deleteConversation: (id) => set(state => {
        state.conversations = state.conversations.filter(c => c.id !== id)
        if (state.activeConversationId === id) {
          state.activeConversationId = state.conversations[0]?.id || null
        }
      }),
      
      updateConversation: (id, updates) => set(state => {
        const c = state.conversations.find(c => c.id === id)
        if (c) {
          Object.assign(c, updates)
          c.updatedAt = Date.now()
        }
      }),
      
      setActiveConversation: (id) => set({ activeConversationId: id }),
      
      clearMessages: (id) => set(state => {
        const c = state.conversations.find(c => c.id === id)
        if (c) {
          c.messages = []
          c.title = '新对话'
          c.updatedAt = Date.now()
        }
      }),
      
      togglePin: (id) => set(state => {
        const c = state.conversations.find(c => c.id === id)
        if (c) c.isPinned = !c.isPinned
      }),
      
      // Message actions
      addMessage: (conversationId, message) => set(state => {
        const c = state.conversations.find(c => c.id === conversationId)
        if (c) {
          c.messages.push(message)
          c.updatedAt = Date.now()
          if (c.messages.filter(m => m.role === 'user').length === 1 && message.role === 'user') {
            c.title = message.content.slice(0, 50) || '新对话'
          }
        }
      }),
      
      updateMessage: (conversationId, messageId, updates) => set(state => {
        const c = state.conversations.find(c => c.id === conversationId)
        if (c) {
          const m = c.messages.find(m => m.id === messageId)
          if (m) Object.assign(m, updates)
        }
      }),
      
      deleteMessage: (conversationId, messageId) => set(state => {
        const c = state.conversations.find(c => c.id === conversationId)
        if (c) c.messages = c.messages.filter(m => m.id !== messageId)
      }),
      
      // Chat actions - SSE streaming
      sendMessage: async (content) => {
        const state = get()
        let convId = state.activeConversationId
        
        if (!convId) {
          convId = get().createConversation()
        }
        
        const conv = state.conversations.find(c => c.id === convId!)
        if (!conv) return
        
        const provider = state.providers.find(p => p.id === conv.providerId)
        if (!provider) {
          get().addMessage(convId!, {
            id: generateId(),
            role: 'assistant',
            content: '',
            error: '未找到 Provider，请在设置中配置',
            createdAt: Date.now()
          })
          return
        }
        
        // Add user message
        const userMsg: Message = {
          id: generateId(),
          role: 'user',
          content,
          createdAt: Date.now()
        }
        
        // Add assistant placeholder
        const assistantMsgId = generateId()
        const assistantMsg: Message = {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          reasoningContent: '',
          isStreaming: true,
          createdAt: Date.now()
        }
        
        get().addMessage(convId!, userMsg)
        get().addMessage(convId!, assistantMsg)
        
        // Build messages for API
        const apiMessages: Array<{ role: string; content: string }> = []
        if (conv.systemPrompt) {
          apiMessages.push({ role: 'system', content: conv.systemPrompt })
        }
        for (const m of conv.messages) {
          if (m.id === assistantMsgId) continue
          apiMessages.push({ role: m.role, content: m.content })
        }
        
        // Stream
        abortController = new AbortController()
        const startTime = Date.now()
        let fullContent = ''
        let fullReasoning = ''
        
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' }
          if (provider.apiKey) headers['Authorization'] = `Bearer ${provider.apiKey}`
          
          const body: Record<string, unknown> = {
            model: conv.modelId,
            messages: apiMessages,
            stream: true,
            temperature: conv.temperature,
            max_tokens: conv.maxTokens
          }
          
          if (conv.reasoningEffort !== 'none') {
            body.reasoning_effort = conv.reasoningEffort
          }
          
          const response = await fetch(`${provider.apiUrl}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: abortController.signal
          })
          
          if (!response.ok) {
            throw new Error(`API Error ${response.status}: ${await response.text()}`)
          }
          
          const reader = response.body?.getReader()
          if (!reader) throw new Error('No response body')
          
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
                const json = JSON.parse(trimmed.slice(6))
                const delta = json.choices?.[0]?.delta
                
                if (delta?.content) fullContent += delta.content
                if (delta?.reasoning_content) fullReasoning += delta.reasoning_content
                
                const isDone = json.choices?.[0]?.finish_reason === 'stop' || 
                               json.choices?.[0]?.finish_reason === 'length'
                
                let usage: TokenUsage | undefined
                if (isDone && json.usage) {
                  usage = {
                    promptTokens: json.usage.prompt_tokens || 0,
                    completionTokens: json.usage.completion_tokens || 0,
                    totalTokens: json.usage.total_tokens || 0,
                    durationMs: Date.now() - startTime
                  }
                }
                
                get().updateMessage(convId!, assistantMsgId, {
                  content: fullContent,
                  reasoningContent: fullReasoning || undefined,
                  isStreaming: !isDone,
                  tokenUsage: usage
                })
              } catch {}
            }
          }
        } catch (err: unknown) {
          if (err instanceof Error && err.name === 'AbortError') {
            get().updateMessage(convId!, assistantMsgId, {
              isStreaming: false,
              error: !fullContent ? '生成已停止' : undefined
            })
          } else {
            get().updateMessage(convId!, assistantMsgId, {
              error: err instanceof Error ? err.message : '未知错误',
              isStreaming: false
            })
          }
        } finally {
          abortController = null
        }
      },
      
      stopGeneration: () => {
        abortController?.abort()
        abortController = null
      },
      
      regenerateMessage: async (messageId) => {
        const state = get()
        const conv = state.conversations.find(c => c.id === state.activeConversationId)
        if (!conv) return
        
        const idx = conv.messages.findIndex(m => m.id === messageId)
        if (idx === -1) return
        
        // Find user message before this
        let userIdx = -1
        for (let i = idx - 1; i >= 0; i--) {
          if (conv.messages[i].role === 'user') {
            userIdx = i
            break
          }
        }
        
        if (userIdx === -1) return
        
        const content = conv.messages[userIdx].content
        
        // Remove messages from user message onwards
        set(s => {
          const c = s.conversations.find(c => c.id === s.activeConversationId)
          if (c) c.messages = c.messages.slice(0, userIdx)
        })
        
        await get().sendMessage(content)
      },
      
      // Settings
      updateSettings: (updates) => set(state => {
        Object.assign(state.settings, updates)
      }),
      
      // UI
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Helpers
      getActiveConversation: () => {
        const state = get()
        return state.conversations.find(c => c.id === state.activeConversationId)
      },
      
      getCurrentProvider: () => {
        const state = get()
        return state.providers.find(p => p.id === state.currentProviderId)
      }
    })),
    {
      name: 'pawket-store',
      partialize: (state) => ({
        providers: state.providers,
        currentProviderId: state.currentProviderId,
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        settings: state.settings
      })
    }
  )
)
