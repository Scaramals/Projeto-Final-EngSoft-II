
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/integrations/supabase/client";
import { DashboardStats, Product, StockMovement } from "@/types";

export function useDashboard() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        // Fetch total products count
        const { count: totalProducts, error: productsError } = await supabaseClient
          .from("products")
          .select("*", { count: "exact", head: true });

        if (productsError) throw productsError;

        // Fetch low stock products count
        const { count: lowStockProducts, error: lowStockError } = await supabaseClient
          .from("products")
          .select("*", { count: "exact", head: true })
          .lt("quantity", 10);

        if (lowStockError) throw lowStockError;

        // Calculate total stock value
        const { data: products, error: valueError } = await supabaseClient
          .from("products")
          .select("quantity, price");

        if (valueError) throw valueError;

        const totalValue = products.reduce(
          (sum, product) => sum + product.quantity * product.price,
          0
        );

        // Fetch recent movements count
        const { count: recentMovementsCount, error: movementsError } = await supabaseClient
          .from("stock_movements")
          .select("*", { count: "exact", head: true })
          .order("created_at", { ascending: false })
          .limit(10);

        if (movementsError) throw movementsError;

        return {
          totalProducts: totalProducts || 0,
          lowStockProducts: lowStockProducts || 0,
          totalValue,
          recentMovementsCount: recentMovementsCount || 0,
        } as DashboardStats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }
    },
  });

  // Fetch low stock products
  const { data: lowStockProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ["low-stock-products"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .lt("quantity", 10)
        .order("quantity")
        .limit(5);

      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch recent stock movements
  const { data: recentMovements, isLoading: isMovementsLoading } = useQuery({
    queryKey: ["recent-movements"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("stock_movements")
        .select(`
          id,
          product_id,
          quantity,
          type,
          created_at,
          notes,
          user_id,
          products(name)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return data.map(movement => ({
        id: movement.id,
        productId: movement.product_id,
        productName: movement.products?.name || 'Produto desconhecido',
        quantity: movement.quantity,
        type: movement.type,
        date: movement.created_at,
        notes: movement.notes,
        userId: movement.user_id,
      })) as StockMovement[];
    },
  });

  return {
    stats,
    lowStockProducts,
    recentMovements,
    isLoading: isStatsLoading || isProductsLoading || isMovementsLoading,
  };
}
