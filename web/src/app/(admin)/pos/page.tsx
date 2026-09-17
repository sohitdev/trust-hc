import { createClient } from "@/lib/supabase/server"
import { PosTerminal } from "./pos-terminal"

export const dynamic = "force-dynamic"

export default async function POSPage() {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Point of Sale</h2>
        <p className="text-sm text-zinc-500 mt-1">In-store billing and checkout.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
          Failed to load products: {error.message}
        </div>
      ) : (
        <PosTerminal products={products || []} />
      )}
    </div>
  )
}
