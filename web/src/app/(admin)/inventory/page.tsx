import { createClient } from "@/lib/supabase/server"
import { AddProductDialog } from "./add-product-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WarningCircle } from "@phosphor-icons/react/dist/ssr"

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Inventory</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage stock, batches, and prices.</p>
        </div>
        <AddProductDialog />
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
          Failed to load inventory: {error.message}
        </div>
      ) : (
        <div className="border border-zinc-200 rounded-md bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Batch & Expiry</TableHead>
                <TableHead className="text-right">Price / MRP</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-zinc-500">
                    No products found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products?.map((product) => {
                  const isLowStock = product.stock_quantity <= product.low_stock_threshold;
                  const isOutOfStock = product.stock_quantity === 0;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium text-zinc-900">{product.name}</div>
                        {product.requires_prescription && (
                          <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider mt-1 block">Rx Required</span>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-600">{product.category}</TableCell>
                      <TableCell>
                        <div className="text-sm text-zinc-900">{product.batch_number}</div>
                        <div className="text-xs text-zinc-500">
                          Exp: {new Date(product.expiry_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm font-medium text-zinc-900">₹{product.price.toFixed(2)}</div>
                        <div className="text-xs text-zinc-500 line-through">₹{product.mrp.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-rose-200 shadow-none rounded-sm">
                              Out of stock
                            </Badge>
                          ) : isLowStock ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 shadow-none rounded-sm flex items-center gap-1">
                              <WarningCircle weight="fill" />
                              Low: {product.stock_quantity}
                            </Badge>
                          ) : (
                            <span className="text-sm text-zinc-700 font-medium">{product.stock_quantity} units</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <button className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Edit</button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
