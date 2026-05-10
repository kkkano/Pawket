import { useStore } from '~/stores'
import { formatDate, cn } from '~/lib/utils'
import { Plus, MessageSquare, Settings, Bot, BookOpen, MoreHorizontal, Pin, Trash2, X } from 'lucide-react'
import { useState } from 'react'

export function Sidebar() {
  const { conversations, activeConversationId, sidebarOpen, setSidebarOpen, createConversation, deleteConversation, togglePin, setActiveConversation } = useStore()
  const [tab, setTab] = useState<'chat' | 'settings'>('chat')
  const [menuId, setMenuId] = useState<string | null>(null)

  // Group conversations
  const pinned = conversations.filter(c => c.isPinned)
  const unpinned = conversations.filter(c => !c.isPinned)
  const groups: { label: string; items: typeof conversations }[] = []
  let lastDate = ''
  
  for (const conv of unpinned) {
    const label = formatDate(conv.updatedAt)
    if (label !== lastDate) {
      groups.push({ label, items: [] })
      lastDate = label
    }
    groups[groups.length - 1].items.push(conv)
  }

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--color-sidebar)] border-r flex flex-col transition-transform duration-200',
      'md:relative md:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="font-semibold">Pawket</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-[#262626] rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New chat */}
      <div className="p-2">
        <button
          onClick={() => { createConversation(); setSidebarOpen(false) }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-[#262626] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新对话</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setTab('chat')}
          className={cn('flex-1 flex items-center justify-center gap-1 py-2 text-xs', tab === 'chat' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-muted)]')}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          对话
        </button>
        <button
          onClick={() => setTab('settings')}
          className={cn('flex-1 flex items-center justify-center gap-1 py-2 text-xs', tab === 'settings' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-muted)]')}
        >
          <Settings className="w-3.5 h-3.5" />
          设置
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'chat' ? (
          <>
            {/* Pinned */}
            {pinned.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs text-[var(--color-muted)]">已固定</div>
                {pinned.map(conv => (
                  <ConvItem key={conv.id} conv={conv} active={conv.id === activeConversationId} 
                    onSelect={() => { setActiveConversation(conv.id); setSidebarOpen(false) }}
                    onDelete={() => deleteConversation(conv.id)}
                    onPin={() => togglePin(conv.id)}
                    menuId={menuId} setMenuId={setMenuId} />
                ))}
              </div>
            )}
            
            {/* Grouped */}
            {groups.map(g => (
              <div key={g.label}>
                <div className="px-4 py-2 text-xs text-[var(--color-muted)]">{g.label}</div>
                {g.items.map(conv => (
                  <ConvItem key={conv.id} conv={conv} active={conv.id === activeConversationId}
                    onSelect={() => { setActiveConversation(conv.id); setSidebarOpen(false) }}
                    onDelete={() => deleteConversation(conv.id)}
                    onPin={() => togglePin(conv.id)}
                    menuId={menuId} setMenuId={setMenuId} />
                ))}
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-[var(--color-muted)]">
                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                <p>还没有对话</p>
              </div>
            )}
          </>
        ) : (
          <SettingsTab />
        )}
      </div>
    </div>
  )
}

function ConvItem({ conv, active, onSelect, onDelete, onPin, menuId, setMenuId }: any) {
  return (
    <div className={cn('group relative px-2 py-1', active && 'bg-[#262626]')}>
      <button onClick={onSelect} className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1c1c1c] transition-colors">
        <div className="text-sm truncate">{conv.title}</div>
      </button>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
        <button onClick={(e) => { e.stopPropagation(); setMenuId(menuId === conv.id ? null : conv.id) }} className="p-1 hover:bg-[#262626] rounded">
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuId === conv.id && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1a] border rounded-lg shadow-lg z-50">
            <button onClick={() => { onPin(); setMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#262626]">
              <Pin className="w-4 h-4" /> {conv.isPinned ? '取消固定' : '固定'}
            </button>
            <button onClick={() => { onDelete(); setMenuId(null) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-[#262626]">
              <Trash2 className="w-4 h-4" /> 删除
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsTab() {
  const { providers, currentProviderId, setCurrentProvider, settings, updateSettings } = useStore()
  
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">当前 Provider</h3>
        {providers.map(p => (
          <button
            key={p.id}
            onClick={() => setCurrentProvider(p.id)}
            className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-sm', p.id === currentProviderId ? 'bg-[var(--color-primary)] text-white' : 'bg-[#1c1c1c] hover:bg-[#262626]')}
          >
            <span>{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">显示设置</h3>
        <label className="flex items-center justify-between py-2">
          <span className="text-sm">按 Enter 发送</span>
          <input type="checkbox" checked={settings.sendOnEnter} onChange={e => updateSettings({ sendOnEnter: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between py-2">
          <span className="text-sm">显示时间戳</span>
          <input type="checkbox" checked={settings.showTimestamp} onChange={e => updateSettings({ showTimestamp: e.target.checked })} />
        </label>
      </div>
    </div>
  )
}
