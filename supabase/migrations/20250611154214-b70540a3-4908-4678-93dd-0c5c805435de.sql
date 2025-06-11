
-- Verificar se há múltiplos triggers ativos
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'stock_movements'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- Remover TODOS os triggers existentes para evitar duplicação
DROP TRIGGER IF EXISTS handle_stock_movement_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_product_quantity_final_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_product_quantity_v2_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_product_quantity_trigger ON public.stock_movements;

-- Criar função de trigger ÚNICA e SIMPLES
CREATE OR REPLACE FUNCTION public.process_stock_movement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
BEGIN
  RAISE NOTICE '🔧 TRIGGER: Processando movimentação ID % - %', NEW.id, NEW.type;
  
  -- Buscar produto
  SELECT quantity, name INTO current_stock, product_name
  FROM public.products 
  WHERE id = NEW.product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado: %', NEW.product_id;
  END IF;
  
  RAISE NOTICE '🔧 TRIGGER: Produto "%" - Estoque atual: %', product_name, current_stock;
  
  -- Aplicar movimentação
  IF NEW.type = 'in' THEN
    UPDATE public.products
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RAISE NOTICE '🔧 TRIGGER: ENTRADA processada: % + % = %', 
      current_stock, NEW.quantity, (current_stock + NEW.quantity);
    
  ELSIF NEW.type = 'out' THEN
    IF current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente para "%". Disponível: %, Solicitado: %', 
        product_name, current_stock, NEW.quantity;
    END IF;
    
    UPDATE public.products
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RAISE NOTICE '🔧 TRIGGER: SAÍDA processada: % - % = %', 
      current_stock, NEW.quantity, (current_stock - NEW.quantity);
  ELSE
    RAISE EXCEPTION 'Tipo inválido: %', NEW.type;
  END IF;
  
  -- Campos padrão
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

-- Criar APENAS UM trigger BEFORE INSERT
CREATE TRIGGER process_stock_movement_trigger
  BEFORE INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.process_stock_movement();

-- Verificar que só há um trigger ativo
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'stock_movements'
AND n.nspname = 'public'
AND NOT t.tgisinternal;
