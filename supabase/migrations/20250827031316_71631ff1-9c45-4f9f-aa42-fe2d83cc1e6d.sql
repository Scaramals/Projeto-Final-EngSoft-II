-- Fix critical security vulnerability: Remove overly permissive RLS policies
-- All authenticated users should only have READ access, not WRITE access to critical business data

-- PRODUCTS TABLE: Remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar produtos" ON public.products;
DROP POLICY IF EXISTS "Usuários autenticados podem criar produtos" ON public.products;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar produtos" ON public.products;

-- CATEGORIES TABLE: Remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar categorias" ON public.categories;
DROP POLICY IF EXISTS "Usuários autenticados podem criar categorias" ON public.categories;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar categorias" ON public.categories;

-- STOCK MOVEMENTS TABLE: Remove overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can create stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar movimentações" ON public.stock_movements;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar movimentações" ON public.stock_movements;
DROP POLICY IF EXISTS "Usuários autenticados podem criar movimentações" ON public.stock_movements;

-- Ensure READ-ONLY access for all authenticated users (employees need to view data)
-- Products: Keep existing "Employees can view all products" and "Usuários autenticados podem visualizar produtos"
-- Categories: Keep existing "Employees can view all categories" and "Todos usuários autenticados podem ver categorias"  
-- Stock movements: Keep existing "Employees can view all stock movements" and "Usuários autenticados podem visualizar movimentações"

-- Create admin-only policies for stock movements (these seem to be missing)
CREATE POLICY "Admins can manage stock movements" ON public.stock_movements
FOR ALL USING (
  auth.uid() IN (
    SELECT profiles.id FROM profiles 
    WHERE profiles.role = ANY(ARRAY['admin'::text, 'developer'::text])
    UNION 
    SELECT users.id FROM auth.users 
    WHERE users.id = ANY(ARRAY['7d2afaa5-2e77-43cd-b7fb-d5111ea59dc4'::uuid, 'a679c5aa-e45b-44e4-b4f2-c5e4ba5333aa'::uuid])
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT profiles.id FROM profiles 
    WHERE profiles.role = ANY(ARRAY['admin'::text, 'developer'::text])
    UNION 
    SELECT users.id FROM auth.users 
    WHERE users.id = ANY(ARRAY['7d2afaa5-2e77-43cd-b7fb-d5111ea59dc4'::uuid, 'a679c5aa-e45b-44e4-b4f2-c5e4ba5333aa'::uuid])
  )
);

-- Ensure all tables have RLS enabled
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements FORCE ROW LEVEL SECURITY;