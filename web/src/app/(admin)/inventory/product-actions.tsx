"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Trash, PencilSimple } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

export function ProductActions({ productId }: { productId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm("Are you sure you want to remove this product?")) return
    
    setIsDeleting(true)
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId)

    if (error) {
      alert("Error deleting product: " + error.message)
    }
    
    setIsDeleting(false)
    router.refresh()
  }

  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
        <PencilSimple className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  )
}
