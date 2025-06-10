
import { CategoriesService } from "./categoriesService";
import { ProductsService } from "./productsService";
import { SuppliersService } from "./suppliersService";
import { StockMovementsService } from "./stockMovementsService";
import { cacheService } from "./cacheService";

/**
 * Serviço principal da API que agrega todos os outros serviços
 * Mantido para compatibilidade com o código existente
 */
export const ApiService = {
  // Categorias
  getDistinctCategories: CategoriesService.getDistinctCategories,
  getCategoryNameById: CategoriesService.getCategoryNameById,

  // Produtos
  getAllProducts: ProductsService.getAllProducts,
  getProducts: ProductsService.getProducts,
  getLowStockProducts: ProductsService.getLowStockProducts,
  getCurrentStock: ProductsService.getCurrentStock,

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
