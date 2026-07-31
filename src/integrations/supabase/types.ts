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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      approved_operators: {
        Row: {
          active: boolean
          created_at: string
          id: string
          mobile: string
          name: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          mobile: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          mobile?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blocked_customers: {
        Row: {
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          assigned_at: string | null
          category: string
          created_at: string
          customer_mobile: string | null
          customer_name: string | null
          description: string | null
          expected_arrival: string | null
          feedback: string | null
          id: string
          issue_type: string | null
          media_url: string | null
          preferred_time: string | null
          rating: number | null
          resolved_at: string | null
          status: string
          stb_id: string | null
          technician_mobile: string | null
          technician_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          category: string
          created_at?: string
          customer_mobile?: string | null
          customer_name?: string | null
          description?: string | null
          expected_arrival?: string | null
          feedback?: string | null
          id: string
          issue_type?: string | null
          media_url?: string | null
          preferred_time?: string | null
          rating?: number | null
          resolved_at?: string | null
          status?: string
          stb_id?: string | null
          technician_mobile?: string | null
          technician_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          category?: string
          created_at?: string
          customer_mobile?: string | null
          customer_name?: string | null
          description?: string | null
          expected_arrival?: string | null
          feedback?: string | null
          id?: string
          issue_type?: string | null
          media_url?: string | null
          preferred_time?: string | null
          rating?: number | null
          resolved_at?: string | null
          status?: string
          stb_id?: string | null
          technician_mobile?: string | null
          technician_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          category: string
          channels: number | null
          created_at: string
          features: string[]
          id: string
          name: string
          popular: boolean
          price: number
          updated_at: string
          validity_days: number
        }
        Insert: {
          active?: boolean
          category: string
          channels?: number | null
          created_at?: string
          features?: string[]
          id: string
          name: string
          popular?: boolean
          price: number
          updated_at?: string
          validity_days?: number
        }
        Update: {
          active?: boolean
          category?: string
          channels?: number | null
          created_at?: string
          features?: string[]
          id?: string
          name?: string
          popular?: boolean
          price?: number
          updated_at?: string
          validity_days?: number
        }
        Relationships: []
      }
      product_requests: {
        Row: {
          category: string
          created_at: string
          customer_mobile: string | null
          customer_name: string | null
          description: string | null
          id: string
          image_url: string | null
          operator_note: string | null
          product_id: string | null
          product_name: string
          quantity: number
          scheduled_date: string | null
          status: string
          stb_id: string | null
          technician_mobile: string | null
          technician_name: string | null
          total_amount: number
          unit_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          customer_mobile?: string | null
          customer_name?: string | null
          description?: string | null
          id: string
          image_url?: string | null
          operator_note?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          scheduled_date?: string | null
          status?: string
          stb_id?: string | null
          technician_mobile?: string | null
          technician_name?: string | null
          total_amount?: number
          unit_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          customer_mobile?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          operator_note?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          scheduled_date?: string | null
          status?: string
          stb_id?: string | null
          technician_mobile?: string | null
          technician_name?: string | null
          total_amount?: number
          unit_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          available_stock: number
          category: string
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          name: string
          price: number
          sold_quantity: number
          updated_at: string
        }
        Insert: {
          available_stock?: number
          category: string
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id: string
          name: string
          price?: number
          sold_quantity?: number
          updated_at?: string
        }
        Update: {
          available_stock?: number
          category?: string
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          name?: string
          price?: number
          sold_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          mobile: string | null
          name: string | null
          operator_number: string | null
          stb_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          mobile?: string | null
          name?: string | null
          operator_number?: string | null
          stb_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          mobile?: string | null
          name?: string | null
          operator_number?: string | null
          stb_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stb_accounts: {
        Row: {
          active: boolean
          created_at: string
          current_plan: string | null
          customer_mobile: string | null
          customer_name: string
          expiry: string | null
          id: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          current_plan?: string | null
          customer_mobile?: string | null
          customer_name?: string
          expiry?: string | null
          id: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          current_plan?: string | null
          customer_mobile?: string | null
          customer_name?: string
          expiry?: string | null
          id?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          approved_at: string | null
          coupon: string | null
          created_at: string
          customer_mobile: string | null
          customer_name: string | null
          id: string
          plan_id: string | null
          plan_name: string
          started_at: string
          status: Database["public"]["Enums"]["txn_status"]
          stb_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          coupon?: string | null
          created_at?: string
          customer_mobile?: string | null
          customer_name?: string | null
          id: string
          plan_id?: string | null
          plan_name: string
          started_at?: string
          status?: Database["public"]["Enums"]["txn_status"]
          stb_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          coupon?: string | null
          created_at?: string
          customer_mobile?: string | null
          customer_name?: string | null
          id?: string
          plan_id?: string | null
          plan_name?: string
          started_at?: string
          status?: Database["public"]["Enums"]["txn_status"]
          stb_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_role: {
        Args: { _mobile: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked: { Args: { _identifier: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "operator" | "customer"
      txn_status: "pending" | "success" | "failed"
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
    Enums: {
      app_role: ["admin", "operator", "customer"],
      txn_status: ["pending", "success", "failed"],
    },
  },
} as const
