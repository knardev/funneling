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
      feedback: {
        Row: {
          created_at: string
          feedback: string | null
          id: number
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: number
        }
        Relationships: []
      }
      images: {
        Row: {
          id: number
          image_id: number | null
          image_url: string | null
          post_generations_id: string
          prompt: string | null
        }
        Insert: {
          id?: number
          image_id?: number | null
          image_url?: string | null
          post_generations_id: string
          prompt?: string | null
        }
        Update: {
          id?: number
          image_id?: number | null
          image_url?: string | null
          post_generations_id?: string
          prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_post_generation"
            columns: ["post_generations_id"]
            isOneToOne: false
            referencedRelation: "post_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_node_runs: {
        Row: {
          created_at: string
          id: string
          input: string | null
          llm_node_version_id: string | null
          metadata: string | null
          output: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          input?: string | null
          llm_node_version_id?: string | null
          metadata?: string | null
          output?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          input?: string | null
          llm_node_version_id?: string | null
          metadata?: string | null
          output?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_node_runs_llm_node_version_id_fkey"
            columns: ["llm_node_version_id"]
            isOneToOne: false
            referencedRelation: "llm_node_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_node_versions: {
        Row: {
          created_at: string
          id: string
          llm_node_id: string | null
          prompt_variable: string | null
          system_prompt: string | null
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          llm_node_id?: string | null
          prompt_variable?: string | null
          system_prompt?: string | null
          version: number
        }
        Update: {
          created_at?: string
          id?: string
          llm_node_id?: string | null
          prompt_variable?: string | null
          system_prompt?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "llm_node_versions_llm_node_id_fkey"
            columns: ["llm_node_id"]
            isOneToOne: false
            referencedRelation: "llm_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_nodes: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      post_generations: {
        Row: {
          advantage_analysis: string | null
          body: string | null
          conclusion: string | null
          created_at: string
          id: string
          industry_analysis: string | null
          intro: string | null
          keyword: string | null
          owner_profile_id: string | null
          service_advantage: string | null
          service_industry: string | null
          service_name: string | null
          sub_keywrod: string | null
          target_needs: string | null
          title: string | null
          toc: string | null
          updated_content: string | null
        }
        Insert: {
          advantage_analysis?: string | null
          body?: string | null
          conclusion?: string | null
          created_at?: string
          id?: string
          industry_analysis?: string | null
          intro?: string | null
          keyword?: string | null
          owner_profile_id?: string | null
          service_advantage?: string | null
          service_industry?: string | null
          service_name?: string | null
          sub_keywrod?: string | null
          target_needs?: string | null
          title?: string | null
          toc?: string | null
          updated_content?: string | null
        }
        Update: {
          advantage_analysis?: string | null
          body?: string | null
          conclusion?: string | null
          created_at?: string
          id?: string
          industry_analysis?: string | null
          intro?: string | null
          keyword?: string | null
          owner_profile_id?: string | null
          service_advantage?: string | null
          service_industry?: string | null
          service_name?: string | null
          sub_keywrod?: string | null
          target_needs?: string | null
          title?: string | null
          toc?: string | null
          updated_content?: string | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          created_at: string
          id: string
          profile_image_url: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_image_url?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_image_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      titles: {
        Row: {
          created_at: string
          creative_structure: string | null
          id: number
          keyword: string | null
          strict_structure: string | null
          style_patterns: string | null
        }
        Insert: {
          created_at?: string
          creative_structure?: string | null
          id?: number
          keyword?: string | null
          strict_structure?: string | null
          style_patterns?: string | null
        }
        Update: {
          created_at?: string
          creative_structure?: string | null
          id?: number
          keyword?: string | null
          strict_structure?: string | null
          style_patterns?: string | null
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

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
