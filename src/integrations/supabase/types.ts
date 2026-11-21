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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      booking_id_documents: {
        Row: {
          booking_id: string
          content_type: string
          id: string
          kind: string
          name: string
          path: string
          size_bytes: number
          uploaded_at: string
        }
        Insert: {
          booking_id: string
          content_type?: string
          id?: string
          kind: string
          name?: string
          path: string
          size_bytes?: number
          uploaded_at?: string
        }
        Update: {
          booking_id?: string
          content_type?: string
          id?: string
          kind?: string
          name?: string
          path?: string
          size_bytes?: number
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_id_documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          car_id: string
          created_at: string
          currency: string | null
          days: number
          deposit: number
          doc_number: number
          email: string
          extras: Json | null
          full_name: string
          id: string
          id_number: string
          licence_number: string
          location_details: string | null
          notes: string
          pdf_generated_at: string | null
          pdf_path: string | null
          extra_charge: number
          extra_charge_label: string | null
          return_location: string | null
          return_location_details: string | null
          phone: string
          pickup_at: string
          pickup_location: string | null
          price_per_day: number
          rejection_reason: string | null
          return_at: string
          source: string
          status: string
          terms_html: string | null
          total_price: number
          updated_at: string
        }
        Insert: {
          car_id: string
          created_at?: string
          currency?: string | null
          days?: number
          deposit?: number
          doc_number?: number
          email?: string
          extras?: Json | null
          full_name: string
          id?: string
          id_number?: string
          licence_number?: string
          location_details?: string | null
          notes?: string
          pdf_generated_at?: string | null
          pdf_path?: string | null
          extra_charge?: number
          extra_charge_label?: string | null
          return_location?: string | null
          return_location_details?: string | null
          phone: string
          pickup_at: string
          pickup_location?: string | null
          price_per_day?: number
          rejection_reason?: string | null
          return_at: string
          source?: string
          status?: string
          terms_html?: string | null
          total_price?: number
          updated_at?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          currency?: string | null
          days?: number
          deposit?: number
          doc_number?: number
          email?: string
          extras?: Json | null
          full_name?: string
          id?: string
          id_number?: string
          licence_number?: string
          location_details?: string | null
          notes?: string
          pdf_generated_at?: string | null
          pdf_path?: string | null
          extra_charge?: number
          extra_charge_label?: string | null
          return_location?: string | null
          return_location_details?: string | null
          phone?: string
          pickup_at?: string
          pickup_location?: string | null
          price_per_day?: number
          rejection_reason?: string | null
          return_at?: string
          source?: string
          status?: string
          terms_html?: string | null
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_date_blocks: {
        Row: {
          car_id: string
          created_at: string
          end_at: string
          id: string
          reason: string
          start_at: string
        }
        Insert: {
          car_id: string
          created_at?: string
          end_at: string
          id?: string
          reason?: string
          start_at: string
        }
        Update: {
          car_id?: string
          created_at?: string
          end_at?: string
          id?: string
          reason?: string
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "car_date_blocks_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          daily_price: number
          fitness_expiry: string | null
          fleet_notes: string | null
          id: string
          insurance_expiry: string | null
          mileage: number | null
          name: string
          photo_url: string | null
          photos: Json
          plate: string
          price_1_day: number | null
          price_16_plus_days: number | null
          price_2_3_days: number | null
          price_4_15_days: number | null
          price_ranges: Json
          road_tax_expiry: string | null
          seats: number
          service_due_date: string | null
          service_due_km: number | null
          transmission: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          daily_price?: number
          fitness_expiry?: string | null
          fleet_notes?: string | null
          id?: string
          insurance_expiry?: string | null
          mileage?: number | null
          name: string
          photo_url?: string | null
          photos?: Json
          plate?: string
          price_1_day?: number | null
          price_16_plus_days?: number | null
          price_2_3_days?: number | null
          price_4_15_days?: number | null
          price_ranges?: Json
          road_tax_expiry?: string | null
          seats?: number
          service_due_date?: string | null
          service_due_km?: number | null
          transmission?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          daily_price?: number
          fitness_expiry?: string | null
          fleet_notes?: string | null
          id?: string
          insurance_expiry?: string | null
          mileage?: number | null
          name?: string
          photo_url?: string | null
          photos?: Json
          plate?: string
          price_1_day?: number | null
          price_16_plus_days?: number | null
          price_2_3_days?: number | null
          price_4_15_days?: number | null
          price_ranges?: Json
          road_tax_expiry?: string | null
          seats?: number
          service_due_date?: string | null
          service_due_km?: number | null
          transmission?: string
        }
        Relationships: []
      }
      pending_signup_deletions: {
        Row: {
          created_at: string
          requested_by: string
          user_id: string
        }
        Insert: {
          created_at?: string
          requested_by: string
          user_id: string
        }
        Update: {
          created_at?: string
          requested_by?: string
          user_id?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          car_choice: string | null
          created_at: string
          dropoff_location: string
          flight_number: string
          hours: number | null
          id: string
          luggage: number | null
          name: string
          notes: string
          passengers: number | null
          phone: string
          pickup_location: string
          request_date: string
          request_time: string
          service: string
          status: string
        }
        Insert: {
          car_choice?: string | null
          created_at?: string
          dropoff_location: string
          flight_number?: string
          hours?: number | null
          id?: string
          luggage?: number | null
          name: string
          notes?: string
          passengers?: number | null
          phone: string
          pickup_location: string
          request_date: string
          request_time: string
          service: string
          status?: string
        }
        Update: {
          car_choice?: string | null
          created_at?: string
          dropoff_location?: string
          flight_number?: string
          hours?: number | null
          id?: string
          luggage?: number | null
          name?: string
          notes?: string
          passengers?: number | null
          phone?: string
          pickup_location?: string
          request_date?: string
          request_time?: string
          service?: string
          status?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          address: string
          company_email: string
          company_name: string
          currency: string
          id: number
          logo_url: string | null
          owner_email: string
          phone: string
          terms_html: string
          updated_at: string
          whatsapp_template: string
        }
        Insert: {
          address?: string
          company_email?: string
          company_name?: string
          currency?: string
          id?: number
          logo_url?: string | null
          owner_email?: string
          phone?: string
          terms_html?: string
          updated_at?: string
          whatsapp_template?: string
        }
        Update: {
          address?: string
          company_email?: string
          company_name?: string
          currency?: string
          id?: number
          logo_url?: string | null
          owner_email?: string
          phone?: string
          terms_html?: string
          updated_at?: string
          whatsapp_template?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wedding_media: {
        Row: {
          image_url: string
          placeholder: boolean
          slot: string
          thumb_url: string | null
        }
        Insert: {
          image_url: string
          placeholder?: boolean
          slot: string
          thumb_url?: string | null
        }
        Update: {
          image_url?: string
          placeholder?: boolean
          slot?: string
          thumb_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      available_car_ids: {
        Args: { requested_from: string; requested_to: string }
        Returns: {
          car_id: string
        }[]
      }
      cancel_pending_signup_deletion: {
        Args: { target: string }
        Returns: undefined
      }
      car_range_price: {
        Args: { _days: number; _ranges: Json }
        Returns: number
      }
      car_unavailable: {
        Args: { _car_id: string }
        Returns: {
          pickup_at: string
          return_at: string
        }[]
      }
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owner_fleet_cars: {
        Args: never
        Returns: {
          active: boolean
          created_at: string
          currency: string
          daily_price: number
          fitness_expiry: string | null
          fleet_notes: string | null
          id: string
          insurance_expiry: string | null
          mileage: number | null
          name: string
          photo_url: string | null
          photos: Json
          plate: string
          price_1_day: number | null
          price_16_plus_days: number | null
          price_2_3_days: number | null
          price_4_15_days: number | null
          price_ranges: Json
          road_tax_expiry: string | null
          seats: number
          service_due_date: string | null
          service_due_km: number | null
          transmission: string
        }[]
        SetofOptions: {
          from: "*"
          to: "cars"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      owners_add: { Args: { owner_email: string }; Returns: undefined }
      owners_approve: { Args: { target: string }; Returns: undefined }
      owners_list: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
      owners_remove: { Args: { owner_id: string }; Returns: undefined }
      owners_revoke: { Args: { target: string }; Returns: undefined }
      prepare_pending_signup_deletion: {
        Args: { target: string }
        Returns: undefined
      }
      public_settings: {
        Args: never
        Returns: {
          address: string
          company_email: string
          company_name: string
          currency: string
          logo_url: string
          phone: string
          terms_html: string
        }[]
      }
      team_list: {
        Args: never
        Returns: {
          created_at: string
          email: string
          is_owner: boolean
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin"
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
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
