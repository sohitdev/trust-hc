export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          mrp: number
          batch_number: string
          expiry_date: string
          stock_quantity: number
          low_stock_threshold: number
          requires_prescription: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          mrp: number
          batch_number: string
          expiry_date: string
          stock_quantity?: number
          low_stock_threshold?: number
          requires_prescription?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          mrp?: number
          batch_number?: string
          expiry_date?: string
          stock_quantity?: number
          low_stock_threshold?: number
          requires_prescription?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_phone: string | null
          fulfillment_type: 'delivery' | 'pickup' | 'in_store'
          payment_method: 'upi' | 'cod' | 'cash' | 'card'
          status: 'pending_review' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'ready_for_pickup' | 'picked_up' | 'cancelled'
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_phone?: string | null
          fulfillment_type: 'delivery' | 'pickup' | 'in_store'
          payment_method: 'upi' | 'cod' | 'cash' | 'card'
          status?: 'pending_review' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'ready_for_pickup' | 'picked_up' | 'cancelled'
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_phone?: string | null
          fulfillment_type?: 'delivery' | 'pickup' | 'in_store'
          payment_method?: 'upi' | 'cod' | 'cash' | 'card'
          status?: 'pending_review' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'ready_for_pickup' | 'picked_up' | 'cancelled'
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
    }
  }
}
