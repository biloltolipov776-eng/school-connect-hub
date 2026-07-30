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
      classes: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          absent: boolean
          created_at: string
          date: string
          grade: number | null
          id: string
          student_id: string
          subject: string
          teacher_id: string | null
        }
        Insert: {
          absent?: boolean
          created_at?: string
          date?: string
          grade?: number | null
          id?: string
          student_id: string
          subject: string
          teacher_id?: string | null
        }
        Update: {
          absent?: boolean
          created_at?: string
          date?: string
          grade?: number | null
          id?: string
          student_id?: string
          subject?: string
          teacher_id?: string | null
        }
        Relationships: []
      }
      homework: {
        Row: {
          class_id: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          subject: string
          teacher_id: string | null
        }
        Insert: {
          class_id: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          subject: string
          teacher_id?: string | null
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          subject?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homework_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          course_id: string
          created_at: string
          id: string
          last_code: string | null
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          course_id: string
          created_at?: string
          id?: string
          last_code?: string | null
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          course_id?: string
          created_at?: string
          id?: string
          last_code?: string | null
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lobbies: {
        Row: {
          code: string
          created_at: string
          id: string
          language: string
          status: string
          teacher_id: string
          title: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          language?: string
          status?: string
          teacher_id: string
          title: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          language?: string
          status?: string
          teacher_id?: string
          title?: string
        }
        Relationships: []
      }
      lobby_grades: {
        Row: {
          comment: string | null
          created_at: string
          grade: number | null
          id: string
          lobby_id: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          grade?: number | null
          id?: string
          lobby_id: string
          student_id: string
          teacher_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          grade?: number | null
          id?: string
          lobby_id?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_grades_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      lobby_participants: {
        Row: {
          id: string
          is_online: boolean
          joined_at: string
          lobby_id: string
          nickname: string
          student_code: string | null
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean
          joined_at?: string
          lobby_id: string
          nickname: string
          student_code?: string | null
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean
          joined_at?: string
          lobby_id?: string
          nickname?: string
          student_code?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_participants_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          class_id: string
          content: string | null
          created_at: string
          id: string
          kind: string
          media_url: string | null
          sender_id: string
        }
        Insert: {
          class_id: string
          content?: string | null
          created_at?: string
          id?: string
          kind: string
          media_url?: string | null
          sender_id: string
        }
        Update: {
          class_id?: string
          content?: string | null
          created_at?: string
          id?: string
          kind?: string
          media_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class_id: string | null
          created_at: string
          display_name: string | null
          full_name: string
          hobbies: string | null
          id: string
          password_plain: string
          role: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string
          display_name?: string | null
          full_name: string
          hobbies?: string | null
          id: string
          password_plain: string
          role?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          class_id?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string
          hobbies?: string | null
          id?: string
          password_plain?: string
          role?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule: {
        Row: {
          class_id: string
          day_of_week: number
          id: string
          is_break: boolean
          position: number
          subject: string
          time_end: string
          time_start: string
        }
        Insert: {
          class_id: string
          day_of_week: number
          id?: string
          is_break?: boolean
          position: number
          subject: string
          time_end: string
          time_start: string
        }
        Update: {
          class_id?: string
          day_of_week?: number
          id?: string
          is_break?: boolean
          position?: number
          subject?: string
          time_end?: string
          time_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          created_at: string
          css_code: string | null
          description: string | null
          full_html: string | null
          html_code: string | null
          id: string
          js_code: string | null
          keywords: string | null
          og_image: string | null
          published: boolean
          subdomain: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          css_code?: string | null
          description?: string | null
          full_html?: string | null
          html_code?: string | null
          id?: string
          js_code?: string | null
          keywords?: string | null
          og_image?: string | null
          published?: boolean
          subdomain: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          css_code?: string | null
          description?: string | null
          full_html?: string | null
          html_code?: string | null
          id?: string
          js_code?: string | null
          keywords?: string | null
          og_image?: string | null
          published?: boolean
          subdomain?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      teacher_subjects: {
        Row: {
          id: string
          subject: string
          teacher_id: string
        }
        Insert: {
          id?: string
          subject: string
          teacher_id: string
        }
        Update: {
          id?: string
          subject?: string
          teacher_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          author_name: string | null
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          preview_url: string | null
          status: string
          thumbnail_url: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          preview_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          preview_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          type?: string
          user_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_users: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          email: string
          id: string
          last_sign_in_at: string
          role: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      my_class_id: { Args: never; Returns: string }
      update_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
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
      app_role: ["admin", "teacher", "student"],
    },
  },
} as const
