
-- Create function to get distinct product categories
CREATE OR REPLACE FUNCTION public.get_distinct_categories()
RETURNS TABLE(category text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT category 
  FROM public.products 
  WHERE category IS NOT NULL
  ORDER BY category;
$$;
