-- ==============================================================================
-- DEW & GO - REAL-TIME LIVE DELIVERY TRACKING & TELEMETRY MIGRATION
-- Supports Swiggy/Zomato-style Hyperlocal Live Delivery
-- Version: 2026.1
-- ==============================================================================

-- 1. Ensure user_role_type has delivery_person and delivery_manager
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE user_role_type AS ENUM (
            'customer', 'super_admin', 'store_manager', 'inventory_manager',
            'order_manager', 'delivery_manager', 'delivery_person', 'support_agent'
        );
    END IF;
END$$;

-- 2. Delivery Partners Registry
CREATE TABLE IF NOT EXISTS public.delivery_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    vehicle_type TEXT DEFAULT 'electric_scooter', -- 'electric_scooter', 'bike', 'bicycle', 'van'
    vehicle_number TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 4.90,
    total_deliveries INT DEFAULT 0,
    is_online BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true NOT NULL, -- Active / Inactive / Suspended account status
    current_status TEXT DEFAULT 'available', -- 'available', 'busy', 'offline'
    max_active_orders INT DEFAULT 2 NOT NULL, -- Capacity limit for concurrent assignments
    last_latitude NUMERIC(10, 8),
    last_longitude NUMERIC(11, 8),
    last_accuracy NUMERIC(6, 2),
    last_heading NUMERIC(5, 2),
    last_speed NUMERIC(6, 2),
    last_location_updated_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Delivery Assignments Table & Audit History
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.delivery_partners(id) ON DELETE RESTRICT,
    status TEXT DEFAULT 'assigned', -- 'assigned', 'acknowledged', 'picked_up', 'out_for_delivery', 'delivered', 'failed', 'reassigned', 'cancelled'
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    assigned_by JSONB, -- Administrator or dispatch system actor record
    acknowledged_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    out_for_delivery_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    reassigned_at TIMESTAMPTZ,
    reassigned_to_partner_id UUID REFERENCES public.delivery_partners(id),
    reassigned_by JSONB,
    reassignment_reason TEXT,
    distance_remaining_km NUMERIC(6, 2),
    eta_minutes INT,
    route_geojson JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Alter orders table to guarantee assignment_history JSONB array exists
ALTER TABLE IF EXISTS public.orders 
ADD COLUMN IF NOT EXISTS assignment_history JSONB DEFAULT '[]'::jsonb;

-- 4. Ephemeral Live GPS Ping Telemetry
CREATE TABLE IF NOT EXISTS public.delivery_live_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.delivery_assignments(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.delivery_partners(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    accuracy NUMERIC(6, 2),
    heading NUMERIC(5, 2),
    speed NUMERIC(6, 2), -- km/h
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for speedy spatial lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_delivery_live_locations_assignment 
ON public.delivery_live_locations(assignment_id, recorded_at DESC);

-- 5. Business Rules & Conflict Prevention Trigger
CREATE OR REPLACE FUNCTION public.validate_delivery_assignment()
RETURNS TRIGGER AS $$
DECLARE
    v_partner_active BOOLEAN;
    v_partner_status TEXT;
    v_active_count INT;
    v_max_orders INT;
BEGIN
    -- Check partner account status
    SELECT is_active, current_status, max_active_orders
    INTO v_partner_active, v_partner_status, v_max_orders
    FROM public.delivery_partners
    WHERE id = NEW.partner_id;

    IF v_partner_active IS NOT TRUE THEN
        RAISE EXCEPTION 'Cannot assign order to inactive or suspended delivery partner %', NEW.partner_id;
    END IF;

    IF v_partner_status = 'offline' THEN
        RAISE EXCEPTION 'Cannot assign order to offline delivery partner %', NEW.partner_id;
    END IF;

    -- Check concurrency capacity
    SELECT COUNT(*)
    INTO v_active_count
    FROM public.delivery_assignments
    WHERE partner_id = NEW.partner_id
    AND status IN ('assigned', 'acknowledged', 'picked_up', 'out_for_delivery')
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF v_active_count >= COALESCE(v_max_orders, 2) THEN
        RAISE EXCEPTION 'Partner % has reached maximum concurrent active deliveries (%)', NEW.partner_id, v_max_orders;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_delivery_assignment ON public.delivery_assignments;
CREATE TRIGGER trg_validate_delivery_assignment
BEFORE INSERT OR UPDATE ON public.delivery_assignments
FOR EACH ROW
EXECUTE FUNCTION public.validate_delivery_assignment();

-- 6. Operational Retention Policy Function (Purge GPS pings older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_delivery_locations()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.delivery_live_locations
    WHERE recorded_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Row Level Security (RLS)
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_live_locations ENABLE ROW LEVEL SECURITY;

-- Admins & Managers: Full Access
CREATE POLICY "Admins full access to delivery_partners"
ON public.delivery_partners FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('super_admin', 'store_manager', 'delivery_manager')
    )
);

CREATE POLICY "Partners can read and update their own status"
ON public.delivery_partners FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Customers can read assigned partner info"
ON public.delivery_partners FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.delivery_assignments da
        JOIN public.orders o ON o.id = da.order_id
        WHERE da.partner_id = public.delivery_partners.id
        AND o.user_id = auth.uid()
    )
);

-- Assignments RLS
CREATE POLICY "Admins full access to delivery_assignments"
ON public.delivery_assignments FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('super_admin', 'store_manager', 'delivery_manager')
    )
);

CREATE POLICY "Partners can view and update their own assignments"
ON public.delivery_assignments FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.delivery_partners dp
        WHERE dp.id = public.delivery_assignments.partner_id
        AND dp.user_id = auth.uid()
    )
);

CREATE POLICY "Customers can view assignments for their own orders"
ON public.delivery_assignments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = public.delivery_assignments.order_id
        AND o.user_id = auth.uid()
    )
);

-- Live Locations RLS
CREATE POLICY "Partners can insert their live GPS pings"
ON public.delivery_live_locations FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.delivery_partners dp
        WHERE dp.id = public.delivery_live_locations.partner_id
        AND dp.user_id = auth.uid()
    )
);

CREATE POLICY "Customers can view GPS pings for their active delivery"
ON public.delivery_live_locations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.delivery_assignments da
        JOIN public.orders o ON o.id = da.order_id
        WHERE da.id = public.delivery_live_locations.assignment_id
        AND o.user_id = auth.uid()
        AND da.status IN ('picked_up', 'out_for_delivery')
    )
);

-- 7. Supabase Realtime Publication
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_assignments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_live_locations;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END$$;
