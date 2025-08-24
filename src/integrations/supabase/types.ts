export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_suppliers: {
        Row: {
          created_at: string
          id: string
          product_id: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          last_modified_by: string | null
          minimum_stock: number | null
          name: string
          price: number
          quantity: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          last_modified_by?: string | null
          minimum_stock?: number | null
          name: string
          price: number
          quantity?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          last_modified_by?: string | null
          minimum_stock?: number | null
          name?: string
          price?: number
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_master: boolean | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_master?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_master?: boolean | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_by: string | null
          date: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          supplier_id: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          supplier_id?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          supplier_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          cnpj: string | null
          contact_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          last_modified_by: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          last_modified_by?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          last_modified_by?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_category_analysis: {
        Args: Record<PropertyKey, never>
        Returns: {
          category_name: string
          product_count: number
          total_quantity: number
          total_value: number
        }[]
      }
      get_current_stock: {
        Args: { product_id_param: string }
        Returns: number
      }
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_low_stock_products: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          last_modified_by: string | null
          minimum_stock: number | null
          name: string
          price: number
          quantity: number
          updated_at: string
        }[]
      }
      get_low_stock_products_v2: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          id: string
          minimum_stock: number
          name: string
          price: number
          quantity: number
        }[]
      }
      get_movements_report: {
        Args: {
          end_date?: string
          start_date?: string
          supplier_filter?: string
        }
        Returns: {
          created_by_id: string
          movement_date: string
          movement_id: string
          movement_type: string
          notes: string
          product_name: string
          quantity: number
          supplier_cnpj: string
          supplier_name: string
        }[]
      }
      get_movements_summary: {
        Args: { days_back?: number }
        Returns: {
          movement_date: string
          net_movement: number
          total_in: number
          total_out: number
        }[]
      }
      get_movements_with_details: {
        Args: { limit_param?: number }
        Returns: {
          created_by: string
          date: string
          id: string
          notes: string
          product_id: string
          product_name: string
          quantity: number
          supplier_id: string
          supplier_name: string
          type: string
          updated_at: string
        }[]
      }
      get_product_movement_history: {
        Args: { product_id_param: string }
        Returns: {
          created_by: string | null
          date: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          supplier_id: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_products_by_category: {
        Args: { category_filter: string }
        Returns: {
          category: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          last_modified_by: string | null
          minimum_stock: number | null
          name: string
          price: number
          quantity: number
          updated_at: string
        }[]
      }
      get_products_with_suppliers: {
        Args: Record<PropertyKey, never>
        Returns: {
          product_category: string
          product_created_at: string
          product_description: string
          product_id: string
          product_minimum_stock: number
          product_name: string
          product_price: number
          product_quantity: number
          product_updated_at: string
          suppliers: Json
        }[]
      }
      get_recent_movements: {
        Args: { days?: number }
        Returns: {
          created_by: string | null
          date: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          supplier_id: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_top_selling_products: {
        Args: { limit_count?: number }
        Returns: {
          category: string
          id: string
          name: string
          quantity_sold: number
        }[]
      }
      get_total_stock_value: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin_or_master: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_permanent_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      validate_stock_movement: {
        Args: {
          product_id_param: string
          quantity_param: number
          type_param: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
