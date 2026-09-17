"use client"

import { useState, useMemo } from "react"
import { Database } from "@/types/database.types"
import { useCartStore } from "./cart-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart, MagnifyingGlass, Plus, Minus, Trash, Receipt } from "@phosphor-icons/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = Database['public']['Tables']['products']['Row']
type PaymentMethod = 'upi' | 'cod' | 'cash' | 'card'

export function PosTerminal({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("")
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!search) return products
    const s = search.toLowerCase()
    return products.filter(
      p => p.name.toLowerCase().includes(s) || 
           p.batch_number.toLowerCase().includes(s) ||
           p.category.toLowerCase().includes(s)
    )
  }, [products, search])

  const handleCheckout = async () => {
    if (items.length === 0) return
    setProcessing(true)
    setError(null)
    
    // Prepare items for RPC
    const rpcItems = items.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price
    }))

    const { error: rpcError } = await supabase.rpc('process_in_store_checkout', {
      p_payment_method: paymentMethod,
      p_total_amount: getTotal(),
      p_items: rpcItems
    })

    if (rpcError) {
      setError(rpcError.message)
      setProcessing(false)
      return
    }

    // Success
    setProcessing(false)
    setCheckoutOpen(false)
    clearCart()
    // Ideally, we'd trigger a print dialog or show a success toast here
    alert("Order completed successfully!")
  }

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
      
      {/* Left side: Product Catalog */}
      <div className="lg:col-span-2 flex flex-col bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 relative">
          <MagnifyingGlass className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <Input 
            type="text" 
            placeholder="Search medicines, batches, categories..." 
            className="pl-10 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const outOfStock = product.stock_quantity === 0
              return (
                <div 
                  key={product.id} 
                  onClick={() => !outOfStock && addItem(product)}
                  className={`border rounded-lg p-4 flex flex-col cursor-pointer transition-colors ${
                    outOfStock 
                      ? 'border-red-100 bg-red-50/50 opacity-60 cursor-not-allowed' 
                      : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                  }`}
                >
                  <div className="font-medium text-sm text-zinc-900 truncate">{product.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">{product.category} • Batch: {product.batch_number}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-semibold text-zinc-900">₹{product.price.toFixed(2)}</div>
                    <div className="text-xs font-medium bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-600">
                      Stock: {product.stock_quantity}
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500">
                No products found.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right side: Cart */}
      <div className="flex flex-col bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-zinc-700" />
          <h3 className="font-semibold text-zinc-900">Current Order</h3>
        </div>

        <ScrollArea className="flex-1 p-4">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
              Cart is empty
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex flex-col gap-2 bg-zinc-50/50 p-3 rounded-md border border-zinc-100">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-sm">{item.product.name}</div>
                    <div className="font-medium text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1)
                          else removeItem(item.product.id)
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded bg-white border border-zinc-200 hover:bg-zinc-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => {
                          if (item.quantity < item.product.stock_quantity) {
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded bg-white border border-zinc-200 hover:bg-zinc-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.product.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Subtotal</span>
            <span className="font-medium">₹{getTotal().toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span>₹{getTotal().toFixed(2)}</span>
          </div>
          
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
            size="lg"
            disabled={items.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            <Receipt className="w-5 h-5 mr-2" />
            Proceed to Pay
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Order</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center text-2xl font-semibold bg-zinc-50 p-4 rounded-lg border border-zinc-100">
              <span>Total</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card (External Machine)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {processing ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
