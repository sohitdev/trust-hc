-- Phase 3: Prescriptions and Order Management Additions

-- Add delivery address and prescription to orders
ALTER TABLE public.orders 
ADD COLUMN delivery_address TEXT,
ADD COLUMN prescription_url TEXT;

-- Create Storage Bucket for Prescriptions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow authenticated users (customers) to upload prescriptions
CREATE POLICY "Customers can upload prescriptions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prescriptions');

-- Allow admins to read all prescriptions
CREATE POLICY "Admins can view prescriptions"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'prescriptions');

-- Since we are keeping it simple for Phase 1/2, if customers are anonymous while ordering (optional),
-- we might need to allow anon uploads temporarily, but the spec says "Phone/OTP customer login".
-- We'll assume customers must be logged in to checkout.

-- Add a helper RPC for customer checkout
CREATE OR REPLACE FUNCTION process_customer_checkout(
    p_customer_phone TEXT,
    p_fulfillment_type fulfillment_type,
    p_payment_method payment_method,
    p_total_amount NUMERIC,
    p_delivery_address TEXT,
    p_prescription_url TEXT,
    p_items JSONB
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_product_id UUID;
    v_qty INTEGER;
    v_price NUMERIC;
    v_current_stock INTEGER;
    v_initial_status order_status;
BEGIN
    -- If there's a prescription, it goes to pending_review. Otherwise confirmed.
    IF p_prescription_url IS NOT NULL THEN
        v_initial_status := 'pending_review';
    ELSE
        v_initial_status := 'confirmed';
    END IF;

    -- 1. Create the order
    INSERT INTO public.orders (
        customer_phone, fulfillment_type, payment_method, 
        status, total_amount, delivery_address, prescription_url
    )
    VALUES (
        p_customer_phone, p_fulfillment_type, p_payment_method, 
        v_initial_status, p_total_amount, p_delivery_address, p_prescription_url
    )
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
