import { Header } from "./header"

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
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} Trust Healthcare Pvt Ltd. All rights reserved.</p>
          <p className="mt-1">License No: [Pending] • FSSAI: [Pending]</p>
        </div>
      </footer>
    </div>
  )
}
