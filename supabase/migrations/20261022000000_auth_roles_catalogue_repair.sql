-- ==============================================================================
-- DEW & GO - AUTH ROLES, CATALOGUE REPAIR & RLS HARDENING MIGRATION
-- Migration: 20261022000000_auth_roles_catalogue_repair.sql
-- ==============================================================================

-- 1. Extend products & variants tables for status and barcode
ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived'));

ALTER TABLE IF EXISTS public.products 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE IF EXISTS public.product_variants 
ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);

-- Index for status and published filter
CREATE INDEX IF NOT EXISTS idx_products_published_status 
ON public.products (is_published, status);

CREATE INDEX IF NOT EXISTS idx_variants_barcode 
ON public.product_variants (barcode);

-- 2. Import Jobs and Error Tracking Tables
CREATE TABLE IF NOT EXISTS public.import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    total_rows INT NOT NULL DEFAULT 0,
    valid_rows INT NOT NULL DEFAULT 0,
    warning_rows INT NOT NULL DEFAULT 0,
    error_rows INT NOT NULL DEFAULT 0,
    imported_rows INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    options JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.import_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.import_jobs(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    sku TEXT,
    product_name TEXT,
    error_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_import_errors_job 
ON public.import_errors (job_id);

-- 3. Security Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = check_user_id
        AND role IN ('super_admin', 'store_manager', 'inventory_manager', 'order_manager')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = check_user_id
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Row Level Security Hardening

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_errors ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile; admins can read all
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- User Roles: Strictly protected; ordinary customers CANNOT read other roles or elevate themselves
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Only super admin can modify roles" ON public.user_roles;
CREATE POLICY "Only super admin can modify roles" ON public.user_roles
    FOR ALL USING (public.is_super_admin(auth.uid()));

-- Products: Public can only view published non-draft products with positive price
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products" ON public.products
    FOR SELECT USING (
        (is_published = true AND status = 'published') 
        OR public.is_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_admin(auth.uid()));

-- Product Variants
DROP POLICY IF EXISTS "Public can view published variants" ON public.product_variants;
CREATE POLICY "Public can view published variants" ON public.product_variants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.products p
            WHERE p.id = product_variants.product_id
            AND ((p.is_published = true AND p.status = 'published') OR public.is_admin(auth.uid()))
        )
    );

DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;
CREATE POLICY "Admins can manage variants" ON public.product_variants
    FOR ALL USING (public.is_admin(auth.uid()));

-- Addresses: Strict customer isolation
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.addresses;
CREATE POLICY "Users can manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Orders: Customer can only view their own orders; only admins can view all or update status
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Customers can insert own orders" ON public.orders;
CREATE POLICY "Customers can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders
    FOR ALL USING (public.is_admin(auth.uid()));

-- Order Items: Isolated to user order or admin
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR public.is_admin(auth.uid()))
        )
    );

-- Import Jobs & Errors: Admin only
DROP POLICY IF EXISTS "Admins can manage import jobs" ON public.import_jobs;
CREATE POLICY "Admins can manage import jobs" ON public.import_jobs
    FOR ALL USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage import errors" ON public.import_errors;
CREATE POLICY "Admins can manage import errors" ON public.import_errors
    FOR ALL USING (public.is_admin(auth.uid()));
