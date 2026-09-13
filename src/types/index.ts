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

export interface SummaryMetrics {
  total_revenue: number
  total_orders: number
  total_units: number
  average_order_value: number | null
  average_unit_price: number | null
  unique_customers: number | null
}

export interface GrowthMetrics {
  revenue: number | null
  orders: number | null
  units: number | null
}

export interface TimeSeriesPoint {
  period: string
  revenue: number
  orders: number
  units: number
}

export interface TopProduct {
  stock_code: string | null
  description: string | null
  revenue: number
  units: number
}

export interface CategoryMetric {
  category: string
  revenue: number
  orders: number
  units: number
  revenue_share: number
}

export interface LocationMetric {
  store_location: string
  revenue: number
  orders: number
  units: number
}

export interface CountryMetric {
  country: string
  revenue: number
  orders: number
  units: number
}

export interface CustomerMetric {
  customer_id: string
  revenue: number
  orders: number
  units: number
}

export interface AnomalyItem {
  period: string
  metric: string
  value: number
  expected: number
  severity: 'low' | 'medium' | 'high'
  reason: string
}

export interface DataQualityMetrics {
  total_rows: number
  valid_rows: number
  removed_rows: number
  duplicate_rows_removed: number
  invalid_date_rows: number
  invalid_numeric_rows: number
  negative_quantity_rows: number
  negative_revenue_rows: number
}

export interface AnalyticsResponse {
  dataset_id: string
  summary: SummaryMetrics
  growth: GrowthMetrics
  time_series: TimeSeriesPoint[]
  top_products: TopProduct[]
  categories: CategoryMetric[]
  locations: LocationMetric[]
  countries: CountryMetric[]
  customers?: CustomerMetric[]
  anomalies: AnomalyItem[]
  data_quality: DataQualityMetrics
}
