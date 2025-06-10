
-- Verificar triggers existentes na tabela stock_movements
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

-- Verificar triggers existentes na tabela products  
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'products'
AND n.nspname = 'public'
AND NOT t.tgisinternal;

-- Verificar detalhes da função update_product_quantity
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'update_product_quantity';

-- Verificar se há múltiplos triggers apontando para a mesma função
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name,
    t.tgenabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relname IN ('stock_movements', 'products')
AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;
