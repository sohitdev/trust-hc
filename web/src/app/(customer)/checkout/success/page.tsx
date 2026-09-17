import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "@phosphor-icons/react/dist/ssr"

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <CheckCircle weight="fill" className="w-16 h-16 text-emerald-500 mb-6" />
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">Order Placed Successfully!</h1>
      <p className="text-zinc-500 max-w-md mx-auto mb-8">
        Your order has been received. If you uploaded a prescription, our pharmacist will review it shortly. You will receive updates on your phone number.
      </p>
      <Link href="/">
        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8">
          Continue Shopping
        </Button>
      </Link>
    </div>
  )
}
