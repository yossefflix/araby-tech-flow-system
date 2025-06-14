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
      approved_users: {
        Row: {
          approved_at: string
          created_at: string
          id: string
          name: string
          password: string
          phone: string
          role: string
        }
        Insert: {
          approved_at?: string
          created_at?: string
          id?: string
          name: string
          password: string
          phone: string
          role: string
        }
        Update: {
          approved_at?: string
          created_at?: string
          id?: string
          name?: string
          password?: string
          phone?: string
          role?: string
        }
        Relationships: []
      }
      registration_requests: {
        Row: {
          created_at: string
          id: string
          name: string
          password: string
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password?: string
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          status?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          ac_type: string | null
          address: string
          assigned_technician: string | null
          booking_date: string | null
          call_center_notes: string | null
          created_at: string
          created_by: string | null
          customer_complaint: string | null
          customer_name: string
          id: string
          phone: string | null
          property_number: string | null
          sap_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ac_type?: string | null
          address: string
          assigned_technician?: string | null
          booking_date?: string | null
          call_center_notes?: string | null
          created_at?: string
          created_by?: string | null
          customer_complaint?: string | null
          customer_name: string
          id?: string
          phone?: string | null
          property_number?: string | null
          sap_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ac_type?: string | null
          address?: string
          assigned_technician?: string | null
          booking_date?: string | null
          call_center_notes?: string | null
          created_at?: string
          created_by?: string | null
          customer_complaint?: string | null
          customer_name?: string
          id?: string
          phone?: string | null
          property_number?: string | null
          sap_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_reports: {
        Row: {
          ac_type: string | null
          customer_signature: string | null
          equipment_model1: string | null
          equipment_model2: string | null
          equipment_serial1: string | null
          equipment_serial2: string | null
          id: string
          order_id: string
          parts_used: string | null
          photos: Json | null
          recommendations: string | null
          submitted_at: string
          technician_name: string
          videos: Json | null
          warranty_status: string | null
          work_description: string
        }
        Insert: {
          ac_type?: string | null
          customer_signature?: string | null
          equipment_model1?: string | null
          equipment_model2?: string | null
          equipment_serial1?: string | null
          equipment_serial2?: string | null
          id?: string
          order_id: string
          parts_used?: string | null
          photos?: Json | null
          recommendations?: string | null
          submitted_at?: string
          technician_name: string
          videos?: Json | null
          warranty_status?: string | null
          work_description: string
        }
        Update: {
          ac_type?: string | null
          customer_signature?: string | null
          equipment_model1?: string | null
          equipment_model2?: string | null
          equipment_serial1?: string | null
          equipment_serial2?: string | null
          id?: string
          order_id?: string
          parts_used?: string | null
          photos?: Json | null
          recommendations?: string | null
          submitted_at?: string
          technician_name?: string
          videos?: Json | null
          warranty_status?: string | null
          work_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_reports_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
