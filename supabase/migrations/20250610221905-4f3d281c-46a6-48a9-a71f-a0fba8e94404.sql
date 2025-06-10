
-- Remover trigger que pode estar causando duplicação
DROP TRIGGER IF EXISTS update_product_quantity_trigger ON public.stock_movements;

-- Recriar a função de atualização de estoque com melhor controle
CREATE OR REPLACE FUNCTION public.update_product_quantity_v2()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
BEGIN
  -- Buscar informações do produto
  SELECT quantity, name INTO current_stock, product_name
  FROM public.products 
  WHERE id = NEW.product_id;
  
  -- Verificar se o produto existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado: %', NEW.product_id;
  END IF;
  
  -- Validações para saída
  IF NEW.type = 'out' THEN
    IF current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente para "%". Disponível: %, Solicitado: %', 
        product_name, current_stock, NEW.quantity;
    END IF;
    
    -- Atualizar estoque (subtrair)
    UPDATE public.products
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
  ELSIF NEW.type = 'in' THEN
    -- Atualizar estoque (adicionar)
    UPDATE public.products
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
  ELSE
    RAISE EXCEPTION 'Tipo de movimentação inválido: %', NEW.type;
  END IF;
  
  -- Definir campos padrão se não fornecidos
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

-- Criar novo trigger com nome único
CREATE TRIGGER update_product_quantity_v2_trigger
  BEFORE INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_quantity_v2();

-- Função para obter estoque atual de forma consistente
CREATE OR REPLACE FUNCTION public.get_current_stock(product_id_param uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT COALESCE(quantity, 0) FROM public.products WHERE id = product_id_param;
$function$;

-- Função para validar movimentação antes da inserção
CREATE OR REPLACE FUNCTION public.validate_stock_movement(
  product_id_param uuid,
  quantity_param integer,
  type_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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

-- Atualizar função de produtos com estoque baixo
CREATE OR REPLACE FUNCTION public.get_low_stock_products_v2()
RETURNS TABLE(
  id uuid,
  name text,
  quantity integer,
  minimum_stock integer,
  category text,
  price numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    p.id,
    p.name,
    p.quantity,
    p.minimum_stock,
    p.category,
    p.price
  FROM public.products p
  WHERE p.quantity <= COALESCE(p.minimum_stock, 5)
  ORDER BY p.quantity ASC, p.name ASC;
$function$;

-- Função para obter movimentações com joins otimizados
CREATE OR REPLACE FUNCTION public.get_movements_with_details(limit_param integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  product_id uuid,
  product_name text,
  quantity integer,
  type text,
  date timestamp with time zone,
  notes text,
  supplier_id uuid,
  supplier_name text,
  created_by uuid,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    sm.id,
    sm.product_id,
    p.name as product_name,
    sm.quantity,
    sm.type,
    sm.date,
    sm.notes,
    sm.supplier_id,
    s.name as supplier_name,
    sm.created_by,
    sm.updated_at
  FROM public.stock_movements sm
  LEFT JOIN public.products p ON sm.product_id = p.id
  LEFT JOIN public.suppliers s ON sm.supplier_id = s.id
  ORDER BY sm.date DESC
  LIMIT limit_param;
$function$;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_date ON public.stock_movements(product_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type_date ON public.stock_movements(type, date DESC);
CREATE INDEX IF NOT EXISTS idx_products_quantity_minimum ON public.products(quantity, minimum_stock);

-- Habilitar realtime para atualizações em tempo real
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.stock_movements REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
