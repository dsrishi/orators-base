export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      speeches: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          main_type: string
          duration: number
          target_audience: string | null
          language: string | null
          objective: string | null
          primary_purpose: string | null
          tone: string | null
          medium: string | null
          occasion: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          main_type: string
          duration: number
          target_audience?: string | null
          language?: string | null
          objective?: string | null
          primary_purpose?: string | null
          tone?: string | null
          medium?: string | null
          occasion?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          main_type?: string
          duration?: number
          target_audience?: string | null
          language?: string | null
          objective?: string | null
          primary_purpose?: string | null
          tone?: string | null
          medium?: string | null
          occasion?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
      }
    }
  }
} 