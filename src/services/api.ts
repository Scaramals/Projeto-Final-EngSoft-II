
import { CategoriesService } from "./categories.service";
import { ProductsService } from "./products.service";
import { SuppliersService } from "./suppliersService";
import { StockMovementsService } from "./stockMovementsService";
import { cacheService } from "./cacheService";

/**
 * Serviço principal da API que agrega todos os outros serviços
 * Mantido para compatibilidade com o código existente
 */
export const ApiService = {
  // Categorias
  getDistinctCategories: async () => {
    const categories = await CategoriesService.getAllCategories();
    return categories.map(cat => ({ id: cat.id, name: cat.name }));
  },
  getCategoryNameById: CategoriesService.getCategoryById,

  // Produtos
  getAllProducts: ProductsService.getAllProducts,
  getProducts: ProductsService.getAllProducts,
  getLowStockProducts: async (filters?: any) => {
    const products = await ProductsService.getAllProducts(filters);
    return products.filter(product => 
      product.quantity <= (product.minimumStock || 0)
    );
  },
  getCurrentStock: async () => {
    const products = await ProductsService.getAllProducts();
    return products.reduce((total, product) => total + product.quantity, 0);
  },

  // Fornecedores
  getAllSuppliers: SuppliersService.getAllSuppliers,

  // Movimentações de estoque
  getAllStockMovements: StockMovementsService.getAllStockMovements,
  validateMovement: StockMovementsService.validateMovement,

  /**
   * Limpar cache
   */
  clearCache(): void {
    console.log('Clearing API cache');
    cacheService.clear();
  }
};

// Exportar serviços individuais para uso direto
export { CategoriesService, ProductsService, SuppliersService, StockMovementsService };
