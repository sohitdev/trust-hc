"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type OrderStatus = Database['public']['Tables']['orders']['Row']['status']

export function OrderStatusActions({ orderId, currentStatus }: { orderId: string, currentStatus: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleUpdate() {
    if (status === currentStatus) return
    
    setLoading(true)
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      alert("Error updating status: " + error.message)
    }
    
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(v: OrderStatus | null) => v && setStatus(v)}>
        <SelectTrigger className="h-8 text-xs bg-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending_review">Pending Review</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
          <SelectItem value="picked_up">Picked Up</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Button 
        size="sm" 
        className="h-8 bg-zinc-900 text-white text-xs" 
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
      >
        {loading ? "..." : "Save"}
      </Button>
    </div>
  )
}
