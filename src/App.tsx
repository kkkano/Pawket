import { useStore } from '~/stores'
import { Menu } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { ChatArea } from './components/ChatArea'

export default function App() {
  const { sidebarOpen, setSidebarOpen } = useStore()
  
  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-30 p-2 bg-[#1a1a1a] rounded-lg border hover:bg-[#262626] md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <ChatArea />
      </div>
    </div>
  )
}
