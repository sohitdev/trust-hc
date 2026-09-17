import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MagnifyingGlass, WarningCircle } from "@phosphor-icons/react/dist/ssr"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = await createClient()
  const query = searchParams.q || ""
  
  let dbQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    
  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`)
  }

  const { data: products, error } = await dbQuery

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4 py-12 bg-zinc-950 text-zinc-50 rounded-2xl">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight">Your Local Pharmacy,<br/>Now Online.</h1>
        <p className="text-zinc-400 max-w-[600px] text-lg">
          Order genuine medicines online. Free delivery on orders above ₹200 or pick up in-store.
        </p>
        <div className="w-full max-w-md pt-4 px-4">
          <form className="relative flex items-center w-full">
            <MagnifyingGlass className="absolute left-3 w-5 h-5 text-zinc-500" />
            <Input 
              name="q" 
              defaultValue={query}
              placeholder="Search for medicines, categories..." 
              className="w-full pl-10 h-12 rounded-full border-0 bg-white/10 text-white placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
            <Button type="submit" className="absolute right-1 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {query ? `Search results for "${query}"` : "Available Medicines"}
        </h2>
        
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">Error loading products: {error.message}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.length === 0 ? (
              <div className="col-span-full py-12 text-center text-zinc-500">
                No medicines found. Try adjusting your search.
              </div>
            ) : (
              products?.map((product) => {
                const outOfStock = product.stock_quantity === 0
                return (
                  <Card key={product.id} className="overflow-hidden border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all flex flex-col">
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
                      {/* Placeholder for product image */}
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
                          disabled={outOfStock}
                          className={outOfStock ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                        >
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
