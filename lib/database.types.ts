export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      attendee_forms: {
        Row: {
          id: number
          created_at: string
          user_id: string
          attendee_name: string
          school: string
          grade_level: string
          programming_experience: string
          preferred_languages: string[] 
          tshirt_size: string
          emergency_contact_name: string
          emergency_contact_phone: string
          how_did_you_hear: string
          what_to_learn: string
          team_preference: string
          dietary_restrictions: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          attendee_name: string
          school: string
          grade_level: string
          programming_experience: string
          preferred_languages: string[] 
          tshirt_size: string
          emergency_contact_name: string
          emergency_contact_phone: string
          how_did_you_hear: string
          what_to_learn: string
          team_preference: string
          dietary_restrictions?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          attendee_name?: string
          school?: string
          grade_level?: string
          programming_experience?: string
          preferred_languages?: string[]
          tshirt_size?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          how_did_you_hear?: string
          what_to_learn?: string
          team_preference?: string
          dietary_restrictions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendee_forms_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_forms: {
        Row: {
          id: number
          created_at: string
          user_id: string
          parent_name: string
          contact_number: string
          emergency_contact: string
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          parent_name: string
          contact_number: string
          emergency_contact: string
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          parent_name?: string
          contact_number?: string
          emergency_contact?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_forms_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
  Row: {
    id: string
    created_at: string
    name: string
    first_name: string | null
    email: string
  }
  Insert: {
    id: string
    created_at?: string
    name: string
    first_name?: string | null
    email: string
  }
  Update: {
    id?: string
    created_at?: string
    name?: string
    first_name?: string | null
    email?: string
  }
  Relationships: [
    {
      foreignKeyName: "profiles_id_fkey"
      columns: ["id"]
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
  ]
}

      waiver_forms: {
        Row: {
          id: number
          created_at: string
          user_id: string
          waiver_agreement: boolean
          signature: string
        }
        Insert: {
          id?: number
          created_at?: string
          user_id: string
          waiver_agreement: boolean
          signature: string
        }
        Update: {
          id?: number
          created_at?: string
          user_id?: string
          waiver_agreement?: boolean
          signature?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiver_forms_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
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
