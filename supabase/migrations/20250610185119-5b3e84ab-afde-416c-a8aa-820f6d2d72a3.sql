
-- Primeiro, vamos adicionar a nova coluna category_id na tabela products
ALTER TABLE public.products ADD COLUMN category_id uuid REFERENCES public.categories(id);

-- Migrar dados existentes: criar categorias para os nomes que já existem
INSERT INTO public.categories (name, description)
SELECT DISTINCT 
  products.category as name,
  'Categoria migrada automaticamente' as description
FROM public.products 
WHERE products.category IS NOT NULL 
  AND products.category != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.categories 
    WHERE categories.name = products.category
  );

-- Atualizar os products para usar category_id baseado no nome da categoria
UPDATE public.products 
SET category_id = categories.id
FROM public.categories
WHERE products.category = categories.name
  AND products.category IS NOT NULL 
  AND products.category != '';
