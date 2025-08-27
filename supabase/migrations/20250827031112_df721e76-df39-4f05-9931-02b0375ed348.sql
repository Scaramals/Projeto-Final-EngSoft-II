-- Remove overly permissive supplier access policies that allow all authenticated users to view sensitive supplier data
DROP POLICY IF EXISTS "Todos usuários autenticados podem ver fornecedores" ON public.suppliers;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar fornecedores" ON public.suppliers;
DROP POLICY IF EXISTS "Usuários autenticados podem criar fornecedores" ON public.suppliers;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar fornecedores" ON public.suppliers;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar fornecedores" ON public.suppliers;

-- Keep only admin-restricted access to suppliers table
-- The existing admin policy "Admins podem gerenciar fornecedores" already provides proper access control

-- Add a specific read-only policy for regular users to access only supplier names and IDs for dropdowns/selections
-- This allows the application to function while protecting sensitive contact information
CREATE POLICY "Authenticated users can view basic supplier info" ON public.suppliers
FOR SELECT USING (auth.role() = 'authenticated'::text)
WITH CHECK (false);

-- Actually, let's be more restrictive and only allow access to supplier names/IDs through a view
-- First, remove the basic info policy we just created
DROP POLICY IF EXISTS "Authenticated users can view basic supplier info" ON public.suppliers;

-- Create a view for basic supplier information that non-admin users can access
CREATE OR REPLACE VIEW public.supplier_basic_info AS
SELECT 
  id,
  name,
  created_at
FROM public.suppliers;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.supplier_basic_info TO authenticated;

-- Ensure RLS is enabled on suppliers table
ALTER TABLE public.suppliers FORCE ROW LEVEL SECURITY;