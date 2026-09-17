import { Header } from "./header"
import Link from "next/link"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between text-sm text-zinc-500">
          <div>
            <p>© {new Date().getFullYear()} Trust Healthcare Pvt Ltd. All rights reserved.</p>
            <p className="mt-1">License No: [Pending] • FSSAI: [Pending]</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/login" className="hover:text-zinc-900 transition-colors">
              Staff Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
