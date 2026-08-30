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
      badges: {
        Row: {
          code: string
          description: string
          icon: string
          name: string
        }
        Insert: {
          code: string
          description: string
          icon?: string
          name: string
        }
        Update: {
          code?: string
          description?: string
          icon?: string
          name?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          published: boolean
          slug: string
          subject_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          published?: boolean
          slug: string
          subject_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          published?: boolean
          slug?: string
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_events: {
        Row: {
          created_at: string
          delta: number
          id: string
          reason: string
          ref_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          reason: string
          ref_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          reason?: string
          ref_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lesson_bookmarks: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          note: string | null
          resource: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          note?: string | null
          resource?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          note?: string | null
          resource?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_bookmarks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_unlocks: {
        Row: {
          cost: number
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_unlocks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          audio_url: string | null
          chapter_id: string
          created_at: string
          duration_minutes: number
          id: string
          kind: string
          order_index: number
          pdf_url: string | null
          published: boolean
          summary: string | null
          title: string
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          chapter_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          kind?: string
          order_index?: number
          pdf_url?: string | null
          published?: boolean
          summary?: string | null
          title: string
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          chapter_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          kind?: string
          order_index?: number
          pdf_url?: string | null
          published?: boolean
          summary?: string | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          board: string | null
          city: string | null
          class_level: number
          created_at: string
          credits: number
          date_of_birth: string | null
          full_name: string
          gender: string | null
          goal: string | null
          guardian_phone: string | null
          id: string
          onboarding_completed: boolean
          phone: string | null
          preferred_language: string | null
          referral_code: string | null
          referred_by: string | null
          school_name: string | null
          state: string | null
          total_xp: number
        }
        Insert: {
          board?: string | null
          city?: string | null
          class_level?: number
          created_at?: string
          credits?: number
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          goal?: string | null
          guardian_phone?: string | null
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          preferred_language?: string | null
          referral_code?: string | null
          referred_by?: string | null
          school_name?: string | null
          state?: string | null
          total_xp?: number
        }
        Update: {
          board?: string | null
          city?: string | null
          class_level?: number
          created_at?: string
          credits?: number
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          goal?: string | null
          guardian_phone?: string | null
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          preferred_language?: string | null
          referral_code?: string | null
          referred_by?: string | null
          school_name?: string | null
          state?: string | null
          total_xp?: number
        }
        Relationships: []
      }
      question_saves: {
        Row: {
          created_at: string
          id: string
          question_id: string
          resolved_at: string | null
          selected_index: number | null
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          resolved_at?: string | null
          selected_index?: number | null
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          resolved_at?: string | null
          selected_index?: number | null
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_saves_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_index: number
          created_at: string
          difficulty: string
          explanation: string | null
          id: string
          options: Json
          order_index: number
          prompt: string
          test_id: string
          topic: string | null
        }
        Insert: {
          correct_index: number
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          options: Json
          order_index?: number
          prompt: string
          test_id: string
          topic?: string | null
        }
        Update: {
          correct_index?: number
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number
          prompt?: string
          test_id?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          credits_awarded: number
          id: string
          qualified_at: string | null
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          credits_awarded?: number
          id?: string
          qualified_at?: string | null
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          credits_awarded?: number
          id?: string
          qualified_at?: string | null
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      streaks: {
        Row: {
          current_streak: number
          daily_goal_minutes: number
          last_active_date: string | null
          longest_streak: number
          minutes_today: number
          user_id: string
        }
        Insert: {
          current_streak?: number
          daily_goal_minutes?: number
          last_active_date?: string | null
          longest_streak?: number
          minutes_today?: number
          user_id: string
        }
        Update: {
          current_streak?: number
          daily_goal_minutes?: number
          last_active_date?: string | null
          longest_streak?: number
          minutes_today?: number
          user_id?: string
        }
        Relationships: []
      }
      study_time: {
        Row: {
          credited_blocks: number
          day: string
          id: string
          lesson_id: string | null
          seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          credited_blocks?: number
          day?: string
          id?: string
          lesson_id?: string | null
          seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          credited_blocks?: number
          day?: string
          id?: string
          lesson_id?: string | null
          seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_time_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          accent: string
          class_level: number
          created_at: string
          description: string | null
          id: string
          name: string
          order_index: number
          published: boolean
          slug: string
        }
        Insert: {
          accent?: string
          class_level?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_index?: number
          published?: boolean
          slug: string
        }
        Update: {
          accent?: string
          class_level?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          published?: boolean
          slug?: string
        }
        Relationships: []
      }
      test_attempts: {
        Row: {
          created_at: string
          details: Json
          id: string
          score: number
          test_id: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          id?: string
          score: number
          test_id: string
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          score?: number
          test_id?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          chapter_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          published: boolean
          title: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          published?: boolean
          title: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          published?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_code: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_code: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_code?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_code_fkey"
            columns: ["badge_code"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["code"]
          },
        ]
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
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_credits: {
        Args: {
          _delta: number
          _reason: string
          _ref_id?: string
          _user_id: string
        }
        Returns: number
      }
      award_credits_once: {
        Args: {
          _delta: number
          _reason: string
          _ref_id?: string
          _user_id: string
        }
        Returns: Json
      }
      ensure_profile: {
        Args: { _class_level?: number; _full_name?: string; _user_id: string }
        Returns: Json
      }
      gen_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
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
