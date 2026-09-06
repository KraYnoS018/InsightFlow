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
      datasets: {
        Row: {
          id: string
          user_id: string
          file_name: string
          storage_path: string
          file_size: number
          row_count: number
          column_count: number
          columns: string[]
          status: 'uploaded' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          storage_path: string
          file_size: number
          row_count: number
          column_count: number
          columns: string[]
          status?: 'uploaded' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          storage_path?: string
          file_size?: number
          row_count?: number
          column_count?: number
          columns?: string[]
          status?: 'uploaded' | 'failed'
          created_at?: string
        }
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
  }
}

export type Dataset = Database['public']['Tables']['datasets']['Row']

export interface CsvValidationResult {
  isValid: boolean
  rowCount: number
  columnCount: number
  columns: string[]
  previewRows: Record<string, any>[]
  error?: string
  warnings?: string[]
}
