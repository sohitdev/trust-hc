import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { MagnifyingGlass, Storefront } from "@phosphor-icons/react/dist/ssr"
import { Input } from "@/components/ui/input"
import { ProductCard } from "./product-card"

export const dynamic = "force-dynamic"

export default async function StorefrontPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient()
  const query = resolvedParams.q || ""
  
  let dbQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    
  if (query) {
    dbQuery = dbQuery.ilike("name", `%${query}%`)
  }

  const { data: products, error } = await dbQuery

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Asymmetric Split Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-12 lg:pt-24 pb-12">
        <div className="flex flex-col items-start max-w-lg">
          <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-medium tracking-tighter text-zinc-950 leading-[1.05] mb-6">
            Your Health,<br/> Delivered.
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed mb-8 max-w-[40ch]">
            Verified pharmaceuticals and daily essentials delivered securely to your door. Free delivery on orders above ₹200.
          </p>
          <div className="w-full max-w-sm">
            <form className="relative flex items-center w-full" action="#catalog">
              <MagnifyingGlass className="absolute left-4 w-5 h-5 text-zinc-400" />
              <Input 
                name="q" 
                defaultValue={query}
                placeholder="Search catalog..." 
                className="w-full pl-12 pr-24 h-14 rounded-full border-zinc-200/60 bg-white text-zinc-900 placeholder:text-zinc-400 shadow-sm focus-visible:ring-1 focus-visible:ring-emerald-500"
              />
              <Button type="submit" className="absolute right-1.5 h-11 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm px-6">
                Find
              </Button>
            </form>
          </div>
        </div>
        
        {/* Abstract Asset Composition */}
        <div className="hidden md:flex w-full h-[480px] bg-zinc-100 rounded-[2rem] items-center justify-center relative overflow-hidden border border-zinc-200/50">
          <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl -top-32 -right-32 pointer-events-none" />
          <div className="z-10 text-zinc-300 transform -rotate-6">
            <Storefront weight="duotone" className="w-48 h-48 opacity-40" />
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section id="catalog" className="scroll-mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-zinc-950">
              {query ? `Results for "${query}"` : "Available Medicines"}
            </h2>
            <p className="text-zinc-500 mt-2">Authentic stock, updated in real time.</p>
          </div>
        </div>
        
        {error ? (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 text-sm">{error.message}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.length === 0 ? (
              <div className="col-span-full py-24 text-center border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center">
                <span className="text-zinc-500 mb-2">No medicines found matching your search.</span>
                <a href="/" className="text-emerald-600 font-medium text-sm hover:underline">Clear search</a>
              </div>
            ) : (
              products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        )}
      </section>
    </div>
  )
}
