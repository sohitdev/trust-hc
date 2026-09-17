"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCustomerCartStore } from "../cart-store"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { UploadSimple, MapPinLine, CreditCard } from "@phosphor-icons/react"

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCustomerCartStore()
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi')
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [file, setFile] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if any cart item requires a prescription
  const needsPrescription = items.some(item => item.product.requires_prescription)

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setLoading(true)
    setError(null)

    if (needsPrescription && !file) {
      setError("Please upload a valid prescription for your medicines.")
      setLoading(false)
      return
    }

    let prescription_url: string | null = null

    // Upload prescription if exists
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `customer_uploads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(filePath, file)

      if (uploadError) {
        setError("Error uploading prescription: " + uploadError.message)
        setLoading(false)
        return
      }

      // Get public URL (or signed URL if private, but for now we store the path)
      const { data } = supabase.storage.from('prescriptions').getPublicUrl(filePath)
      prescription_url = data.publicUrl
    }

    // Call RPC
    const rpcItems = items.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price
    }))

    const { error: rpcError } = await supabase.rpc('process_customer_checkout', {
      p_customer_phone: phone,
      p_fulfillment_type: fulfillment,
      p_payment_method: paymentMethod,
      p_total_amount: getTotal(),
      p_delivery_address: fulfillment === 'delivery' ? address : null,
      p_prescription_url: prescription_url,
      p_items: rpcItems
    })

    if (rpcError) {
      setError(rpcError.message)
      setLoading(false)
      return
    }

    clearCart()
    setLoading(false)
    router.push('/checkout/success')
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push('/')}>Return to Catalog</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-8">Checkout</h1>
      
      <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-medium flex items-center gap-2">
              <MapPinLine className="text-zinc-500" />
              Delivery Details
            </h2>
            <div className="space-y-3">
              <Label>Fulfillment Method</Label>
              <Select value={fulfillment} onValueChange={(v: 'delivery'|'pickup'|null) => v && setFulfillment(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Home Delivery</SelectItem>
                  <SelectItem value="pickup">Store Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 99999 99999" />
            </div>

            {fulfillment === 'delivery' && (
              <div className="space-y-2">
                <Label htmlFor="address">Full Delivery Address</Label>
                <Input id="address" required value={address} onChange={e => setAddress(e.target.value)} placeholder="Flat, Building, Street..." />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-xl font-medium flex items-center gap-2">
              <CreditCard className="text-zinc-500" />
              Payment
            </h2>
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v: 'upi'|'cod'|null) => v && setPaymentMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI / Online Payment</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {needsPrescription && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-xl font-medium flex items-center gap-2">
                  <UploadSimple className="text-zinc-500" />
                  Prescription Required
                </h2>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-3">
                    One or more medicines in your cart require a valid prescription. Please upload it below. Our pharmacist will review it before confirming your order.
                  </p>
                  <Input 
                    type="file" 
                    accept="image/*,.pdf"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="bg-white"
                  />
                </div>
              </div>
            </>
          )}

          {error && <div className="text-red-600 bg-red-50 p-4 rounded-lg text-sm">{error}</div>}

        </div>

        <div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 sticky top-24">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <div className="flex gap-2">
                    <span className="text-zinc-500">{item.quantity}x</span>
                    <span className="font-medium text-zinc-900">{item.product.name}</span>
                  </div>
                  <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center text-lg font-semibold text-zinc-900 mb-6">
              <span>Total</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-12 text-base"
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
