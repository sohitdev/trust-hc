-- Phase 1: Products Table

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    mrp NUMERIC(10, 2) NOT NULL,
    batch_number TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    requires_prescription BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Simple updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS Policies (For now, admin operations will use service role, 
-- but later we can add proper authenticated RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow read access to active products for everyone (for the future storefront)
CREATE POLICY "Active products are viewable by everyone" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Allow all operations for authenticated admin users (simplified for Phase 1)
CREATE POLICY "Admins have full access to products" 
ON public.products FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
