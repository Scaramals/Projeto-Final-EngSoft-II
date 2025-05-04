
# API Services Documentation

This document describes all backend services and API endpoints used in the application.

## ApiService

The ApiService provides a clean interface to interact with our Supabase backend, abstracting away the
complexity of direct database operations from UI components.

### Methods

#### getDashboardStats()
- **Description:** Retrieves dashboard statistics including product counts and total value
- **Returns:** Promise<DashboardStats>
- **Used by:** useDashboard hook

#### getLowStockProducts(limit = 5)
- **Description:** Gets products with quantity below minimum stock level
- **Parameters:** 
  - `limit`: Maximum number of products to return
- **Returns:** Promise<Product[]>
- **Used by:** useDashboard hook, LowStockAlert component

#### getRecentMovements(limit = 10)
- **Description:** Gets recent stock movement records
- **Parameters:**
  - `limit`: Maximum number of records to return
- **Returns:** Promise<StockMovement[]>
- **Used by:** useDashboard hook, RecentMovements component

#### getProducts(filters)
- **Description:** Gets products with filtering and sorting
- **Parameters:**
  - `filters`: FilterParams object with search, category, and sorting options
- **Returns:** Promise<Product[]>
- **Used by:** useProducts hook, ProductsPage

#### getCategories()
- **Description:** Gets distinct product categories
- **Returns:** Promise<string[]>
- **Used by:** ReportFilters component, Product forms
