"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "@phosphor-icons/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export function AddProductDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const product = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      price: parseFloat(formData.get("price") as string),
      mrp: parseFloat(formData.get("mrp") as string),
      batch_number: formData.get("batch_number") as string,
      expiry_date: formData.get("expiry_date") as string,
      stock_quantity: parseInt(formData.get("stock_quantity") as string, 10),
      low_stock_threshold: parseInt(formData.get("low_stock_threshold") as string, 10),
      requires_prescription: formData.get("requires_prescription") === "on",
      is_active: true
    }

    const { error: insertError } = await supabase
      .from('products')
      .insert(product)

    if (insertError) {
      console.error(insertError)
      setError(insertError.message)
      setLoading(false)
      return
    }

    setOpen(false)
    setLoading(false)
    router.refresh() // Reloads the server data for the table
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-emerald-600 text-zinc-50 hover:bg-emerald-600/90 shadow h-9 px-4 py-2">
        <Plus className="w-4 h-4" />
        Add Medicine
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" required placeholder="e.g. Paracetamol 500mg" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required placeholder="e.g. Tablets" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batch_number">Batch Number</Label>
              <Input id="batch_number" name="batch_number" required placeholder="B-12345" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Selling Price (₹)</Label>
              <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mrp">MRP (₹)</Label>
              <Input id="mrp" name="mrp" type="number" step="0.01" required placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Initial Stock</Label>
              <Input id="stock_quantity" name="stock_quantity" type="number" required defaultValue="0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="low_stock_threshold">Alert Threshold</Label>
              <Input id="low_stock_threshold" name="low_stock_threshold" type="number" required defaultValue="5" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input id="expiry_date" name="expiry_date" type="date" required />
            </div>

            <div className="space-y-2 col-span-2 flex items-center gap-2 mt-2">
              <input type="checkbox" id="requires_prescription" name="requires_prescription" className="rounded border-gray-300" />
              <Label htmlFor="requires_prescription" className="text-sm font-medium text-gray-700 m-0">Requires Prescription (Rx)</Label>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-zinc-900 text-white hover:bg-zinc-800">
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
