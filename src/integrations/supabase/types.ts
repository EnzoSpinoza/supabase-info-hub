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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          client_name: string
          created_at: string
          date: string
          id: string
          package_id: string | null
          package_paid: boolean
          phone: string
          service_id: string | null
          status: string
          time: string
        }
        Insert: {
          client_name: string
          created_at?: string
          date: string
          id?: string
          package_id?: string | null
          package_paid?: boolean
          phone: string
          service_id?: string | null
          status?: string
          time: string
        }
        Update: {
          client_name?: string
          created_at?: string
          date?: string
          id?: string
          package_id?: string | null
          package_paid?: boolean
          phone?: string
          service_id?: string | null
          status?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "membership_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          active: boolean
          close_time: string
          id: string
          open_time: string
          weekday: number
        }
        Insert: {
          active?: boolean
          close_time: string
          id?: string
          open_time: string
          weekday: number
        }
        Update: {
          active?: boolean
          close_time?: string
          id?: string
          open_time?: string
          weekday?: number
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          id: boolean
          pix_city: string | null
          pix_key: string | null
          pix_receiver_name: string | null
          updated_at: string
        }
        Insert: {
          id?: boolean
          pix_city?: string | null
          pix_key?: string | null
          pix_receiver_name?: string | null
          updated_at?: string
        }
        Update: {
          id?: boolean
          pix_city?: string | null
          pix_key?: string | null
          pix_receiver_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          transaction_date: string
          type: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          type: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_packages: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          period: string
          price: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          period?: string
          price?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          period?: string
          price?: number
        }
        Relationships: []
      }
      package_subscriptions: {
        Row: {
          cancel_requested: boolean
          client_name: string
          created_at: string
          id: string
          package_id: string
          paid: boolean
          period_month: string
          phone: string
          status: string
        }
        Insert: {
          cancel_requested?: boolean
          client_name: string
          created_at?: string
          id?: string
          package_id: string
          paid?: boolean
          period_month?: string
          phone: string
          status?: string
        }
        Update: {
          cancel_requested?: boolean
          client_name?: string
          created_at?: string
          id?: string
          package_id?: string
          paid?: boolean
          period_month?: string
          phone?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "membership_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          active: boolean
          caption: string | null
          created_at: string
          id: string
          url: string
        }
        Insert: {
          active?: boolean
          caption?: string | null
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          active?: boolean
          caption?: string | null
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
        }
        Relationships: []
      }
    }
    Views: {
      public_appointment_slots: {
        Row: {
          date: string | null
          time: string | null
        }
        Insert: {
          date?: string | null
          time?: string | null
        }
        Update: {
          date?: string | null
          time?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cancel_package_subscription: {
        Args: { p_package_id: string; p_phone: string }
        Returns: Json
      }
      subscribe_to_package: {
        Args: { p_client_name: string; p_package_id: string; p_phone: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
