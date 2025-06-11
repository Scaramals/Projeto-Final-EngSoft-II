
-- DIAGNÓSTICO COMPLETO: Verificar TODOS os triggers da tabela
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'stock_movements'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- REMOÇÃO TOTAL: Dropar TODOS os triggers possíveis
DROP TRIGGER IF EXISTS process_stock_movement_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS handle_stock_movement_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_product_quantity_final_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_product_quantity_v2_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_product_quantity_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS stock_movement_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_stock_trigger ON public.stock_movements;

-- DROPAR TODAS as funções relacionadas para evitar conflitos
DROP FUNCTION IF EXISTS public.process_stock_movement() CASCADE;
DROP FUNCTION IF EXISTS public.handle_stock_movement() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_quantity() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_quantity_v2() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_quantity_final() CASCADE;

-- CRIAR função SIMPLES com logs VISÍVEIS
CREATE OR REPLACE FUNCTION public.handle_stock_movement_simple()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
BEGIN
  -- LOGS OBRIGATÓRIOS para debugging
  RAISE NOTICE '🔥 TRIGGER ATIVO: ID % | Tipo: % | Quantidade: %', NEW.id, NEW.type, NEW.quantity;
  
  -- Buscar produto
  SELECT quantity, name INTO current_stock, product_name
  FROM public.products 
  WHERE id = NEW.product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado: %', NEW.product_id;
  END IF;
  
  RAISE NOTICE '🔥 PRODUTO: "%" | Estoque ANTES: %', product_name, current_stock;
  
  -- Aplicar movimentação
  IF NEW.type = 'in' THEN
    UPDATE public.products
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RAISE NOTICE '🔥 ENTRADA: % + % = %', current_stock, NEW.quantity, (current_stock + NEW.quantity);
    
  ELSIF NEW.type = 'out' THEN
    IF current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente para "%". Disponível: %, Solicitado: %', 
        product_name, current_stock, NEW.quantity;
    END IF;
    
    UPDATE public.products
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RAISE NOTICE '🔥 SAÍDA: % - % = %', current_stock, NEW.quantity, (current_stock - NEW.quantity);
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
  
  RAISE NOTICE '🔥 TRIGGER FINALIZADO COM SUCESSO';
  RETURN NEW;
END;
$function$;

-- CRIAR trigger ÚNICO
CREATE TRIGGER handle_stock_movement_simple_trigger
  BEFORE INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_stock_movement_simple();

-- VERIFICAÇÃO FINAL: Confirmar que só há UM trigger
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled,
    CASE 
      WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
      WHEN t.tgtype & 4 = 4 THEN 'AFTER'
      ELSE 'OTHER'
    END as trigger_timing
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'stock_movements'
AND n.nspname = 'public'
AND NOT t.tgisinternal;
