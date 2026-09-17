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
    }
  }
}
