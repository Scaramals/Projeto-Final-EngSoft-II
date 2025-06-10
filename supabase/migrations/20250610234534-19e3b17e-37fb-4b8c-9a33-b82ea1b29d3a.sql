
-- Verificar quantos triggers estão ativos na tabela stock_movements
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled,
    t.tgtype,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'stock_movements'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- Remover TODOS os triggers da tabela para garantir limpeza total
DROP TRIGGER IF EXISTS update_product_quantity_final_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_product_quantity_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_product_quantity_v2_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS stock_movement_trigger ON public.stock_movements;

-- Criar uma função de trigger completamente nova e mais simples
CREATE OR REPLACE FUNCTION public.handle_stock_movement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
BEGIN
  -- Log detalhado para debugging
  RAISE NOTICE '=== INÍCIO TRIGGER STOCK MOVEMENT ===';
  RAISE NOTICE 'Operação: %, ID: %, Produto: %, Quantidade: %, Tipo: %', 
    TG_OP, NEW.id, NEW.product_id, NEW.quantity, NEW.type;
  
  -- Para INSERT apenas - evitar execução em UPDATE
  IF TG_OP != 'INSERT' THEN
    RAISE NOTICE 'Operação não é INSERT, pulando...';
    RETURN NEW;
  END IF;
  
  -- Buscar dados do produto
  SELECT quantity, name INTO current_stock, product_name
  FROM public.products 
  WHERE id = NEW.product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado: %', NEW.product_id;
  END IF;
  
  RAISE NOTICE 'Produto encontrado: "%" com estoque atual: %', product_name, current_stock;
  
  -- Aplicar movimentação baseada no tipo
  IF NEW.type = 'in' THEN
    RAISE NOTICE 'Processando ENTRADA de % unidades', NEW.quantity;
    
    UPDATE public.products
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RAISE NOTICE 'ENTRADA processada: % + % = %', current_stock, NEW.quantity, (current_stock + NEW.quantity);
    
  ELSIF NEW.type = 'out' THEN
    RAISE NOTICE 'Processando SAÍDA de % unidades', NEW.quantity;
    
    -- Verificar estoque suficiente
    IF current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente para "%". Disponível: %, Solicitado: %', 
        product_name, current_stock, NEW.quantity;
    END IF;
    
    UPDATE public.products
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RAISE NOTICE 'SAÍDA processada: % - % = %', current_stock, NEW.quantity, (current_stock - NEW.quantity);
    
  ELSE
    RAISE EXCEPTION 'Tipo de movimentação inválido: "%"', NEW.type;
  END IF;
  
  -- Preencher campos padrão se necessário
  IF NEW.date IS NULL THEN
    NEW.date = NOW();
  END IF;
  
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  
  NEW.updated_at = NOW();
  
  RAISE NOTICE '=== FIM TRIGGER STOCK MOVEMENT ===';
  RETURN NEW;
END;
$function$;

-- Criar apenas UM trigger BEFORE INSERT
CREATE TRIGGER handle_stock_movement_trigger
  BEFORE INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_stock_movement();

-- Verificar que apenas nosso trigger está ativo
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled,
    CASE 
      WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
      WHEN t.tgtype & 4 = 4 THEN 'AFTER'
      ELSE 'OTHER'
    END as trigger_timing,
    CASE 
      WHEN t.tgtype & 4 = 4 THEN 'INSERT'
      WHEN t.tgtype & 8 = 8 THEN 'DELETE'
      WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
      ELSE 'OTHER'
    END as trigger_event
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'stock_movements'
AND n.nspname = 'public'
AND NOT t.tgisinternal;
