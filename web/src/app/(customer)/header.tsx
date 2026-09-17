"use client"

import Link from "next/link"
import { Storefront, ShoppingCart, User } from "@phosphor-icons/react"
import { useCustomerCartStore } from "./cart-store"

export function Header() {
  const getItemCount = useCustomerCartStore(state => state.getItemCount)
  const count = getItemCount()

  return (
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
            {count > 0 && (
              <span className="absolute -top-2 -right-3 bg-emerald-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}
