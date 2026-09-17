"use client"

import { useCustomerCartStore } from "../cart-store"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash, ShoppingCart } from "@phosphor-icons/react"
import Link from "next/link"

export function CartView() {
  const { items, updateQuantity, removeItem, getTotal } = useCustomerCartStore()

  if (items.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-8 shadow-sm border border-zinc-200/50">
          <ShoppingCart className="w-10 h-10" weight="duotone" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 mb-4">Your cart is empty</h2>
        <p className="text-zinc-500 mb-10 leading-relaxed text-lg">
          Looks like you haven&apos;t added any medicines yet. Browse our catalog to find what you need.
        </p>
        <Link href="/">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-10 h-14 text-base shadow-sm">
            Browse Medicines
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Your Cart</h2>
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="flex gap-4 p-4 bg-white border border-zinc-200 rounded-xl">
              <div className="w-24 h-24 bg-zinc-50 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-zinc-400">
                Image
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-zinc-900">{item.product.name}</h3>
                    <p className="text-sm text-zinc-500">{item.product.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-zinc-900">₹{(item.product.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1">
                    <button 
                      onClick={() => {
                        if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1)
                        else removeItem(item.product.id)
                      }}
                      className="text-zinc-500 hover:text-zinc-900"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => {
                        if (item.quantity < item.product.stock_quantity) {
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                      }}
                      className="text-zinc-500 hover:text-zinc-900"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.product.id)}
                    className="text-sm text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
                  >
                    <Trash className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 sticky top-24">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Delivery</span>
              <span>Free</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center text-lg font-semibold text-zinc-900 mb-6">
            <span>Total</span>
            <span>₹{getTotal().toFixed(2)}</span>
          </div>
          
          <Link href="/checkout" className="block w-full">
            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-full h-12 text-base">
              Proceed to Checkout
            </Button>
          </Link>
          
          <p className="text-xs text-zinc-500 text-center mt-4">
            Minimum order amount is ₹200 for free delivery.
          </p>
        </div>
      </div>
    </div>
  )
}
