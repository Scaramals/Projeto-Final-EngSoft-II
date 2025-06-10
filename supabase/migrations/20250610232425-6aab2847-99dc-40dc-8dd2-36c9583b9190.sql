
-- Verificar se existe trigger duplicado
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

-- Se existir trigger duplicado, remover triggers antigos antes de criar o correto
DROP TRIGGER IF EXISTS update_product_quantity_trigger ON public.stock_movements;
DROP TRIGGER IF EXISTS stock_movement_trigger ON public.stock_movements;

-- Criar o trigger correto (apenas um)
CREATE TRIGGER update_product_quantity_trigger
  BEFORE INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_quantity_v2();
