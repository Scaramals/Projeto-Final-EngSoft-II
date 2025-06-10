
-- Corrigir o trigger que atualiza a quantidade do produto
CREATE OR REPLACE FUNCTION public.update_product_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Primeiro, vamos verificar se é uma saída e se há estoque suficiente
  IF NEW.type = 'out' THEN
    -- Verificar estoque atual
    DECLARE
      current_stock INTEGER;
    BEGIN
      SELECT quantity INTO current_stock 
      FROM public.products 
      WHERE id = NEW.product_id;
      
      -- Se não há estoque suficiente, cancelar a operação
      IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', current_stock, NEW.quantity;
      END IF;
      
      -- Subtrair a quantidade (saída)
      UPDATE public.products
      SET quantity = quantity - NEW.quantity
      WHERE id = NEW.product_id;
    END;
  ELSIF NEW.type = 'in' THEN
    -- Adicionar a quantidade (entrada)
    UPDATE public.products
    SET quantity = quantity + NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$function$;
