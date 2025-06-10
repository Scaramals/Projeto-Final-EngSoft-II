
-- Primeiro, vamos verificar o estado atual dos triggers
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

-- Remover todos os triggers existentes na tabela stock_movements para evitar duplicação
DROP TRIGGER IF EXISTS update_product_quantity_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS update_product_quantity_v2_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS stock_movement_trigger ON public.stock_movements;

-- Recriar a função de trigger com controle mais rigoroso
CREATE OR REPLACE FUNCTION public.update_product_quantity_final()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
  movement_exists BOOLEAN;
BEGIN
  -- Log para debugging
  RAISE NOTICE 'TRIGGER EXECUTADO: Produto %, Quantidade %, Tipo %', NEW.product_id, NEW.quantity, NEW.type;
  
  -- Verificar se esta movimentação já foi processada (evitar duplicação)
  SELECT EXISTS(
    SELECT 1 FROM public.stock_movements 
    WHERE id = NEW.id
  ) INTO movement_exists;
  
  -- Se a movimentação já existe (UPDATE), não processar novamente
  IF movement_exists AND TG_OP = 'UPDATE' THEN
    RAISE NOTICE 'TRIGGER: Movimentação já existe, pulando processamento';
    RETURN NEW;
  END IF;
  
  -- Buscar informações do produto
  SELECT quantity, name INTO current_stock, product_name
  FROM public.products 
  WHERE id = NEW.product_id;
  
  -- Verificar se o produto existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado: %', NEW.product_id;
  END IF;
  
  RAISE NOTICE 'TRIGGER: Estoque atual do produto "%": %', product_name, current_stock;
  
  -- Processar movimentação
  IF NEW.type = 'out' THEN
    -- Validar estoque suficiente
    IF current_stock < NEW.quantity THEN
      RAISE EXCEPTION 'Estoque insuficiente para "%". Disponível: %, Solicitado: %', 
        product_name, current_stock, NEW.quantity;
    END IF;
    
    -- Subtrair do estoque
    UPDATE public.products
    SET quantity = quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RAISE NOTICE 'TRIGGER: Subtraído % unidades. Novo estoque: %', NEW.quantity, (current_stock - NEW.quantity);
    
  ELSIF NEW.type = 'in' THEN
    -- Adicionar ao estoque
    UPDATE public.products
    SET quantity = quantity + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RAISE NOTICE 'TRIGGER: Adicionado % unidades. Novo estoque: %', NEW.quantity, (current_stock + NEW.quantity);
    
  ELSE
    RAISE EXCEPTION 'Tipo de movimentação inválido: %', NEW.type;
  END IF;
  
  -- Definir campos padrão
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

-- Criar apenas UM trigger para INSERT
CREATE TRIGGER update_product_quantity_final_trigger
  BEFORE INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_quantity_final();

-- Verificar se não há triggers duplicados
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
