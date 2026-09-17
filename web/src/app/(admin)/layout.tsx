import { Package, Monitor, Storefront } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 text-zinc-300 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <Link href="/inventory" className="flex items-center gap-2 text-white font-medium hover:text-emerald-400 transition-colors">
            <Storefront weight="fill" className="w-6 h-6 text-emerald-500" />
            <span>Trust Health.care</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/pos" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 hover:text-white transition-colors"
          >
            <Monitor weight="duotone" className="w-5 h-5" />
            <span>POS Billing</span>
          </Link>
          <Link 
            href="/inventory" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-900 hover:text-white transition-colors bg-zinc-900 text-white"
          >
            <Package weight="duotone" className="w-5 h-5" />
            <span>Inventory</span>
          </Link>
        </nav>
        <div className="p-4 text-xs text-zinc-600 border-t border-zinc-800">
          Admin Session Active
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-8 shadow-sm">
          <h1 className="text-lg font-medium text-zinc-900">Store Operations</h1>
        </header>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
