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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      availability_slots: {
        Row: {
          created_at: string | null
          end_time: string
          hold_expires_at: string | null
          id: string
          photographer_id: string
          school_slug: string
          slot_date: string
          start_time: string
          status: Database["public"]["Enums"]["slot_status"]
        }
        Insert: {
          created_at?: string | null
          end_time: string
          hold_expires_at?: string | null
          id?: string
          photographer_id: string
          school_slug?: string
          slot_date: string
          start_time: string
          status?: Database["public"]["Enums"]["slot_status"]
        }
        Update: {
          created_at?: string | null
          end_time?: string
          hold_expires_at?: string | null
          id?: string
          photographer_id?: string
          school_slug?: string
          slot_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["slot_status"]
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_ledger: {
        Row: {
          created_at: string | null
          id: string
          ledger_status: Database["public"]["Enums"]["ledger_status"]
          note: string | null
          order_id: string
          photographer_id: string
          platform_fee_pence: number
          settled_at: string | null
          settled_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ledger_status?: Database["public"]["Enums"]["ledger_status"]
          note?: string | null
          order_id: string
          photographer_id: string
          platform_fee_pence: number
          settled_at?: string | null
          settled_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ledger_status?: Database["public"]["Enums"]["ledger_status"]
          note?: string | null
          order_id?: string
          photographer_id?: string
          platform_fee_pence?: number
          settled_at?: string | null
          settled_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_ledger_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_settled_by_fkey"
            columns: ["settled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_logs: {
        Row: {
          actor_id: string
          created_at: string | null
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          note: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          actor_id: string
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          actor_id?: string
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          commission_rate_pct: number
          confirmed_at: string | null
          created_at: string | null
          id: string
          order_no: string
          payment_proof_url: string | null
          payment_ref: string
          photographer_id: string
          platform_fee_pence: number
          proof_submitted_at: string | null
          slot_id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount_pence: number
          user_id: string
        }
        Insert: {
          commission_rate_pct?: number
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          order_no: string
          payment_proof_url?: string | null
          payment_ref: string
          photographer_id: string
          platform_fee_pence: number
          proof_submitted_at?: string | null
          slot_id: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount_pence: number
          user_id: string
        }
        Update: {
          commission_rate_pct?: number
          confirmed_at?: string | null
          created_at?: string | null
          id?: string
          order_no?: string
          payment_proof_url?: string | null
          payment_ref?: string
          photographer_id?: string
          platform_fee_pence?: number
          proof_submitted_at?: string | null
          slot_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount_pence?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_photographer_id_fkey"
            columns: ["photographer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"] | null
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          bio: string | null
          commission_owed_pence: number | null
          full_name: string
          gowns_json: Json | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          slug: string | null
          uk_phone: string | null
          updated_at: string | null
          wechat_id: string
          wechat_qr_url: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          bio?: string | null
          commission_owed_pence?: number | null
          full_name: string
          gowns_json?: Json | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          slug?: string | null
          uk_phone?: string | null
          updated_at?: string | null
          wechat_id: string
          wechat_qr_url?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"] | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          bio?: string | null
          commission_owed_pence?: number | null
          full_name?: string
          gowns_json?: Json | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          slug?: string | null
          uk_phone?: string | null
          updated_at?: string | null
          wechat_id?: string
          wechat_qr_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_confirm_order: {
        Args: { admin_id: string; target_order_id: string }
        Returns: undefined
      }
      admin_reject_order: {
        Args: { admin_id: string; reason?: string; target_order_id: string }
        Returns: undefined
      }
      increment_commission_owed: {
        Args: { amount_pence: number; target_photographer_id: string }
        Returns: undefined
      }
      release_expired_holds: { Args: never; Returns: undefined }
    }
    Enums: {
      account_status: "ACTIVE" | "SUSPENDED"
      approval_status: "PENDING" | "APPROVED" | "REJECTED"
      ledger_status: "PENDING" | "SETTLED" | "WAIVED"
      order_status:
        | "PENDING_PAYMENT"
        | "PROOF_SUBMITTED"
        | "CONFIRMED"
        | "VERIFICATION_OVERDUE"
        | "COMPLETED"
        | "CANCELLED"
      slot_status: "AVAILABLE" | "HELD" | "BOOKED" | "BLOCKED" | "RESCHEDULED"
      user_role: "STUDENT" | "PHOTOGRAPHER" | "ADMIN"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["ACTIVE", "SUSPENDED"],
      approval_status: ["PENDING", "APPROVED", "REJECTED"],
      ledger_status: ["PENDING", "SETTLED", "WAIVED"],
      order_status: [
        "PENDING_PAYMENT",
        "PROOF_SUBMITTED",
        "CONFIRMED",
        "VERIFICATION_OVERDUE",
        "COMPLETED",
        "CANCELLED",
      ],
      slot_status: ["AVAILABLE", "HELD", "BOOKED", "BLOCKED", "RESCHEDULED"],
      user_role: ["STUDENT", "PHOTOGRAPHER", "ADMIN"],
    },
  },
} as const
