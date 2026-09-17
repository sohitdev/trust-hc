import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { OrderStatusActions } from "./order-actions"
import { Phone, WhatsappLogo, FileText } from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const supabase = await createClient()

  // Fetch orders with their items and the product names
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        total_price,
        products ( name )
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Orders</h2>
        <p className="text-sm text-zinc-500 mt-1">Manage online and in-store orders, prescriptions, and fulfillment.</p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
          Failed to load orders: {error.message}
        </div>
      ) : (
        <div className="grid gap-6">
          {orders?.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-200 rounded-lg">
              No orders found.
            </div>
          ) : (
            orders?.map((order) => {
              const items = order.order_items
              return (
                <div key={order.id} className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col md:flex-row gap-6 justify-between">
                  
                  {/* Order Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-zinc-900">Order #{order.id.split("-")[0]}</span>
                      <Badge variant="outline" className="bg-zinc-50 text-zinc-600 capitalize">
                        {order.fulfillment_type.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className={`capitalize ${
                        order.status === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' || order.status === 'picked_up' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-zinc-100 text-zinc-800'
                      }`}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div className="text-sm text-zinc-600">
                      <div className="mb-2 font-medium">Items:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {items?.map((item: { id: string, quantity: number, total_price: number, products: { name: string } | null }) => (
                          <li key={item.id}>
                            {item.quantity}x {item.products?.name} <span className="text-zinc-400"> (₹{item.total_price})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-lg font-semibold text-zinc-900 pt-2 border-t border-zinc-100">
                      Total: ₹{order.total_amount} <span className="text-sm font-normal text-zinc-500 ml-2">via {order.payment_method.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Customer Info & Actions */}
                  <div className="w-full md:w-72 bg-zinc-50 rounded-lg p-4 border border-zinc-100 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-zinc-900">Customer</div>
                      {order.customer_phone ? (
                        <div className="flex flex-col gap-2">
                          <span className="text-sm text-zinc-600">{order.customer_phone}</span>
                          <div className="flex gap-2">
                            <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-2 py-1 rounded">
                              <Phone weight="fill" /> Call
                            </a>
                            <a href={`https://wa.me/${order.customer_phone.replace("+", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                              <WhatsappLogo weight="fill" /> WhatsApp
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-zinc-500">Walk-in Customer</div>
                      )}

                      {order.delivery_address && (
                        <div className="mt-4 text-sm text-zinc-600">
                          <div className="font-medium text-zinc-900">Delivery Address</div>
                          <p className="mt-1">{order.delivery_address}</p>
                        </div>
                      )}

                      {order.prescription_url && (
                        <div className="mt-4">
                          <Link href={order.prescription_url} target="_blank" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 p-2 rounded-md border border-blue-100">
                            <FileText weight="fill" className="w-4 h-4" />
                            View Prescription
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-200">
                      <OrderStatusActions orderId={order.id} currentStatus={order.status} />
                    </div>
                  </div>

                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
