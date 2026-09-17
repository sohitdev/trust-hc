"use client"

import { Database } from "@/types/database.types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCustomerCartStore } from "../cart-store"

type Product = Database['public']['Tables']['products']['Row']

export function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCustomerCartStore()
  const outOfStock = product.stock_quantity === 0
  const cartItem = items.find(item => item.product.id === product.id)
  const isMaxStockReached = cartItem ? cartItem.quantity >= product.stock_quantity : false

  return (
    <Card className="overflow-hidden border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all flex flex-col">
      <div className="aspect-square bg-zinc-100 flex items-center justify-center p-6 relative">
        {product.requires_prescription && (
          <Badge variant="destructive" className="absolute top-3 left-3 bg-rose-100 text-rose-700 hover:bg-rose-100 border-none shadow-none text-[10px] uppercase">
            Rx Required
          </Badge>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <Badge variant="outline" className="bg-white border-zinc-200 text-zinc-600 shadow-sm">
              Out of Stock
            </Badge>
          </div>
        )}
        <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center text-zinc-300">
          <span className="text-xs">No Image</span>
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-zinc-900 leading-tight">{product.name}</h3>
          <p className="text-xs text-zinc-500 mt-1">{product.category}</p>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-lg font-semibold text-zinc-900">₹{product.price.toFixed(2)}</div>
            <div className="text-xs text-zinc-500 line-through">₹{product.mrp.toFixed(2)}</div>
          </div>
          <Button 
            size="sm" 
            onClick={() => addItem(product)}
            disabled={outOfStock || isMaxStockReached}
            className={outOfStock ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
          >
            {cartItem ? `In Cart (${cartItem.quantity})` : "Add"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
