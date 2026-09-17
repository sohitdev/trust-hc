import Link from "next/link"
import { Storefront, ShoppingCart, User } from "@phosphor-icons/react/dist/ssr"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-900 font-medium hover:text-emerald-600 transition-colors">
            <Storefront weight="fill" className="w-6 h-6 text-emerald-600" />
            <span className="text-lg tracking-tight">Trust Health.care</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Medicines
            </Link>
            <Link href="/cart" className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 relative">
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {/* Optional: Cart badge can go here */}
            </Link>
            <Link href="/auth" className="flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900">
              <User className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Trust Healthcare Pvt Ltd. All rights reserved.</p>
          <p className="mt-1">License No: [Pending] • FSSAI: [Pending]</p>
        </div>
      </footer>
    </div>
  )
}
