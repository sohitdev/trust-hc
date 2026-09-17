-- Phase 1: Orders and Order Items Tables

-- Enum for Order Status
CREATE TYPE order_status AS ENUM ('pending_review', 'confirmed', 'out_for_delivery', 'delivered', 'ready_for_pickup', 'picked_up', 'cancelled');

-- Enum for Fulfillment Type
CREATE TYPE fulfillment_type AS ENUM ('delivery', 'pickup', 'in_store');

-- Enum for Payment Method
CREATE TYPE payment_method AS ENUM ('upi', 'cod', 'cash', 'card');

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_phone TEXT, -- Optional for in-store walk-ins
    fulfillment_type fulfillment_type NOT NULL,
    payment_method payment_method NOT NULL,
    status order_status NOT NULL DEFAULT 'confirmed',
    total_amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for orders updated_at
CREATE TRIGGER set_orders_timestamp
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to orders" 
ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins have full access to order_items" 
ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Checkout RPC function to handle stock deduction atomically
CREATE OR REPLACE FUNCTION process_in_store_checkout(
    p_payment_method payment_method,
    p_total_amount NUMERIC,
    p_items JSONB
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_product_id UUID;
    v_qty INTEGER;
    v_price NUMERIC;
    v_current_stock INTEGER;
BEGIN
    -- 1. Create the order
    INSERT INTO public.orders (fulfillment_type, payment_method, status, total_amount)
    VALUES ('in_store', p_payment_method, 'confirmed', p_total_amount)
    RETURNING id INTO v_order_id;

    -- 2. Process items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_qty := (v_item->>'quantity')::INTEGER;
        v_price := (v_item->>'unit_price')::NUMERIC;

        -- Verify stock and lock row
        SELECT stock_quantity INTO v_current_stock 
        FROM public.products 
        WHERE id = v_product_id FOR UPDATE;

        IF v_current_stock < v_qty THEN
            RAISE EXCEPTION 'Insufficient stock for product %', v_product_id;
        END IF;

        -- Deduct stock
        UPDATE public.products 
        SET stock_quantity = stock_quantity - v_qty 
        WHERE id = v_product_id;

        -- Insert order item
        INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, total_price)
        VALUES (v_order_id, v_product_id, v_qty, v_price, v_qty * v_price);
    END LOOP;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
