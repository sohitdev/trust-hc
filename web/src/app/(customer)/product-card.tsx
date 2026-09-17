"use client"

import { Database } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCustomerCartStore, CartItem } from "./cart-store"

type Product = Database['public']['Tables']['products']['Row']

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCustomerCartStore()
  const outOfStock = product.stock_quantity === 0
  const cartItem = items.find((item: CartItem) => item.product.id === product.id)
  const isMaxStockReached = cartItem ? cartItem.quantity >= product.stock_quantity : false

  return (
    <Card className="overflow-hidden border-zinc-200/60 shadow-sm hover:shadow-md transition-all flex flex-col rounded-2xl group bg-white">
      <div className="aspect-[4/3] bg-zinc-100 flex items-center justify-center relative overflow-hidden">
        {product.requires_prescription && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-zinc-900 border-zinc-200/50 shadow-sm backdrop-blur-md pointer-events-none text-[10px] uppercase tracking-wider font-medium">
            Rx Required
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <Badge variant="outline" className="bg-white border-zinc-200 text-zinc-600 shadow-sm rounded-full px-3 py-1">
              Out of Stock
            </Badge>
          </div>
        )}
        {/* Minimalist structural placeholder */}
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-zinc-300 border border-zinc-100 group-hover:scale-105 transition-transform duration-500">
          <span className="text-[10px] uppercase tracking-wider">Asset</span>
        </div>
      </div>
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <div className="flex justify-between items-start gap-3">
            <h3 className="font-medium text-zinc-900 tracking-tight leading-tight">{product.name}</h3>
            <span className="font-semibold text-zinc-900 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-md text-sm shrink-0">
              ₹{product.price.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-2">{product.category}</p>
        </div>
        <div className="flex flex-col gap-3 mt-auto">
          {product.mrp > product.price && (
            <div className="text-xs text-zinc-400 line-through">MRP: ₹{product.mrp.toFixed(2)}</div>
          )}
          <Button 
            size="sm" 
            onClick={() => addItem(product)}
            disabled={outOfStock || isMaxStockReached}
            className={outOfStock ? "rounded-full w-full" : "rounded-full w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"}
          >
            {cartItem ? `In Cart (${cartItem.quantity})` : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
