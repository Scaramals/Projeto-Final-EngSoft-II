-- Phase 1: Critical Security Fixes

-- 1. Remove dangerous public access policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

-- 2. Fix RLS for product_suppliers table (missing policies)
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view product suppliers"
ON public.product_suppliers
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage product suppliers"
ON public.product_suppliers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Restrict profile visibility - remove overly permissive policy
DROP POLICY IF EXISTS "Usuários podem visualizar todos os perfis" ON public.profiles;

-- Add proper profile visibility policy
CREATE POLICY "Users can view own profile and admins can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  is_admin_or_master(auth.uid())
);

-- 4. Fix database functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalProducts', (SELECT COUNT(*) FROM public.products),
    'lowStockProducts', (SELECT COUNT(*) FROM public.products WHERE quantity <= COALESCE(minimum_stock, 5)),
    'totalValue', (SELECT COALESCE(SUM(quantity * price), 0) FROM public.products),
    'recentMovementsCount', (SELECT COUNT(*) FROM public.stock_movements WHERE date >= NOW() - INTERVAL '30 days')
  ) INTO result;
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_stock_movement(product_id_param uuid, quantity_param integer, type_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
  result JSON;
BEGIN
  -- Buscar produto
  SELECT quantity, name INTO current_stock, product_name
  FROM public.products 
  WHERE id = product_id_param;
  
  IF NOT FOUND THEN
    SELECT json_build_object(
      'isValid', false,
      'currentStock', 0,
      'message', 'Produto não encontrado'
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Validar saída
  IF type_param = 'out' THEN
    IF current_stock = 0 THEN
      SELECT json_build_object(
        'isValid', false,
        'currentStock', current_stock,
        'message', format('Produto "%s" sem estoque disponível', product_name)
      ) INTO result;
      RETURN result;
    END IF;
    
    IF current_stock < quantity_param THEN
      SELECT json_build_object(
        'isValid', false,
        'currentStock', current_stock,
        'message', format('Estoque insuficiente para "%s". Disponível: %s, Solicitado: %s', 
          product_name, current_stock, quantity_param)
      ) INTO result;
      RETURN result;
    END IF;
  END IF;
  
  -- Validação passou
  SELECT json_build_object(
    'isValid', true,
    'currentStock', current_stock,
    'productName', product_name
  ) INTO result;
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_stock_movement_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
BEGIN
  -- Buscar produto
  SELECT quantity, name INTO current_stock, product_name
  FROM public.products 
  WHERE id = NEW.product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado: %', NEW.product_id;
  END IF;
  
  -- Aplicar movimentação
  IF NEW.type = 'in' THEN
    UPDATE public.products
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
  ELSIF NEW.type = 'out' THEN
    IF current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente para "%". Disponível: %, Solicitado: %', 
        product_name, current_stock, NEW.quantity;
    END IF;
    
    UPDATE public.products
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  ELSE
    RAISE EXCEPTION 'Tipo inválido: %', NEW.type;
  END IF;
  
  -- Campos obrigatórios
  IF NEW.date IS NULL THEN
    NEW.date = NOW();
  END IF;
  
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$function$;