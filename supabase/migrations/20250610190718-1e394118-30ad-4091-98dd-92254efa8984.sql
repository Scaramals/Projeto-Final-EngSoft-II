
-- Atualizar a função get_category_analysis para fazer JOIN com a tabela categories
CREATE OR REPLACE FUNCTION public.get_category_analysis()
 RETURNS TABLE(category_name text, product_count bigint, total_quantity bigint, total_value numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.name, 'Sem categoria') as category_name,
    COUNT(p.id) as product_count,
    COALESCE(SUM(p.quantity), 0) as total_quantity,
    COALESCE(SUM(p.quantity * p.price), 0) as total_value
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  GROUP BY c.id, c.name
  ORDER BY total_value DESC;
END;
$function$
