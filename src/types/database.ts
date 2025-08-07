export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          currency: string
          payment_terms: number
          credit_limit: number | null
        }
        Insert: {
          address: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          currency?: string
          payment_terms?: number
          credit_limit?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          currency?: string
          payment_terms?: number
          credit_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_number: string
          items: Json
          notes: string | null
          quote_id: string | null
          status: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
          client_details: Json
          totals: Json
          currency: string
          recurring_invoice_id: string | null
          exchange_rate: number
          paid_date: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          items: Json
          notes?: string | null
          quote_id?: string | null
          status?: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at?: string
          client_details: Json
          totals: Json
          currency?: string
          recurring_invoice_id?: string | null
          exchange_rate?: number
          paid_date?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          items?: Json
          notes?: string | null
          quote_id?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          client_details?: Json
          totals?: Json
          currency?: string
          recurring_invoice_id?: string | null
          exchange_rate?: number
          paid_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "invoices_recurring_invoice_id_fkey"
            columns: ["recurring_invoice_id"]
            isOneToOne: false
            referencedRelation: "recurring_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          id: string
          items: Json
          quote_number: string
          status: string | null
          updated_at: string
          client_details: Json
          totals: Json
          currency: string
          exchange_rate: number
        }
        Insert: {
          created_at?: string
          id?: string
          items: Json
          quote_number: string
          status?: string | null
          updated_at?: string
          client_details: Json
          totals: Json
          currency?: string
          exchange_rate?: number
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          quote_number?: string
          status?: string | null
          updated_at?: string
          client_details?: Json
          totals?: Json
          currency?: string
          exchange_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          name: string
          symbol: string
          exchange_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          code: string
          name: string
          symbol: string
          exchange_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          code?: string
          name?: string
          symbol?: string
          exchange_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_by: string
          created_at: string
          name: string | null
          description: string | null
          permissions: Json
          is_active: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: string
          created_by?: string
          created_at?: string
          name?: string | null
          description?: string | null
          permissions?: Json
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_by?: string
          created_at?: string
          name?: string | null
          description?: string | null
          permissions?: Json
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      recurring_invoices: {
        Row: {
          id: string
          customer_id: string
          template_data: Json
          frequency: string
          start_date: string
          end_date: string | null
          next_invoice_date: string
          is_active: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          template_data: Json
          frequency: string
          start_date: string
          end_date?: string | null
          next_invoice_date: string
          is_active?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          template_data?: Json
          frequency?: string
          start_date?: string
          end_date?: string | null
          next_invoice_date?: string
          is_active?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          invoice_id: string
          payment_reference: string
          amount: number
          currency: string
          status: string
          gateway: string
          gateway_response: Json | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          payment_reference: string
          amount: number
          currency?: string
          status?: string
          gateway?: string
          gateway_response?: Json | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          payment_reference?: string
          amount?: number
          currency?: string
          status?: string
          gateway?: string
          gateway_response?: Json | null
          paid_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_currency_fkey"
            columns: ["currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      company_settings: {
        Row: {
          id: string
          user_id: string
          company_name: string
          primary_currency: string
          payment_gateway_config: Json
          email_templates: Json
          pdf_templates: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          primary_currency?: string
          payment_gateway_config?: Json
          email_templates?: Json
          pdf_templates?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          primary_currency?: string
          payment_gateway_config?: Json
          email_templates?: Json
          pdf_templates?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_primary_currency_fkey"
            columns: ["primary_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_first_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_exchange_rates: {
        Args: {
          rates: Json
        }
        Returns: undefined
      }
      generate_recurring_invoice: {
        Args: {
          recurring_id: string
        }
        Returns: string
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

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Additional type exports for the new features
export type Currency = Tables<'currencies'>
export type UserRole = Tables<'user_roles'>
export type RecurringInvoice = Tables<'recurring_invoices'>
export type Payment = Tables<'payments'>
export type CompanySettings = Tables<'company_settings'>

// Enhanced existing types
export type Customer = Tables<'customers'>
export type Invoice = Tables<'invoices'>
export type Quote = Tables<'quotes'>

// Enums for better type safety
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'cancelled'
export type UserRoleType = 'admin' | 'user' | 'viewer'
export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
export type QuoteStatus = 'draft' | 'pending' | 'accepted' | 'rejected' | 'expired'