
-- Verificar todas as triggers na tabela stock_movements
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled as enabled,
    t.tgtype,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'stock_movements'
AND n.nspname = 'public'
AND NOT t.tgisinternal
ORDER BY t.tgname;

-- Verificar se há múltiplas triggers fazendo UPDATE na tabela products
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    t.tgenabled as enabled,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'products'
AND n.nspname = 'public'
AND NOT t.tgisinternal
ORDER BY t.tgname;

-- Verificar se a função update_product_quantity está sendo chamada múltiplas vezes
SELECT 
    p.proname,
    COUNT(*) as trigger_count
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'update_product_quantity'
GROUP BY p.proname;
