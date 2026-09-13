from typing import Optional, List
from pydantic import BaseModel


class SummaryMetrics(BaseModel):
    total_revenue: float
    total_orders: int
    total_units: float
    average_order_value: Optional[float] = None
    average_unit_price: Optional[float] = None
    unique_customers: Optional[int] = None


class GrowthMetrics(BaseModel):
    revenue: Optional[float] = None
    orders: Optional[float] = None
    units: Optional[float] = None


class TimeSeriesPoint(BaseModel):
    period: str
    revenue: float
    orders: int
    units: float


class TopProduct(BaseModel):
    stock_code: Optional[str] = None
    description: Optional[str] = None
    revenue: float
    units: float


class CategoryMetric(BaseModel):
    category: str
    revenue: float
    orders: int
    units: float
    revenue_share: float


class LocationMetric(BaseModel):
    store_location: str
    revenue: float
    orders: int
    units: float


class CountryMetric(BaseModel):
    country: str
    revenue: float
    orders: int
    units: float


class CustomerMetric(BaseModel):
    customer_id: str
    revenue: float
    orders: int
    units: float


class AnomalyItem(BaseModel):
    period: str
    metric: str
    value: float
    expected: float
    severity: str  # "low", "medium", "high"
    reason: str


class DataQualityMetrics(BaseModel):
    total_rows: int
    valid_rows: int
    removed_rows: int
    duplicate_rows_removed: int
    invalid_date_rows: int
    invalid_numeric_rows: int
    negative_quantity_rows: int
    negative_revenue_rows: int


class AnalyticsResponse(BaseModel):
    dataset_id: str
    summary: SummaryMetrics
    growth: GrowthMetrics
    time_series: List[TimeSeriesPoint]
    top_products: List[TopProduct]
    categories: List[CategoryMetric]
    locations: List[LocationMetric]
    countries: List[CountryMetric]
    customers: List[CustomerMetric] = []
    anomalies: List[AnomalyItem]
    data_quality: DataQualityMetrics
