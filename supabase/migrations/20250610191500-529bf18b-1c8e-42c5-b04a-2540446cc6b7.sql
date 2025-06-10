
-- Corrigir definitivamente a função get_category_analysis
DROP FUNCTION IF EXISTS public.get_category_analysis();

CREATE OR REPLACE FUNCTION public.get_category_analysis()
 RETURNS TABLE(category_name text, product_count bigint, total_quantity bigint, total_value numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN c.name IS NOT NULL THEN c.name
      ELSE 'Sem categoria'
    END as category_name,
    COUNT(p.id)::bigint as product_count,
    COALESCE(SUM(p.quantity), 0)::bigint as total_quantity,
    COALESCE(SUM(p.quantity * p.price), 0)::numeric as total_value
  FROM public.products p
  LEFT JOIN public.categories c ON p.category_id = c.id
  GROUP BY c.name
  ORDER BY total_value DESC;
END;
$function$;
