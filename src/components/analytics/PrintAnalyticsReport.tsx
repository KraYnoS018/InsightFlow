import React from 'react'
import type { AnalyticsResponse, Dataset } from '../../types'
interface PrintAnalyticsReportProps {
  analytics: AnalyticsResponse
  dataset?: Dataset
}

export const PrintAnalyticsReport: React.FC<PrintAnalyticsReportProps> = ({
  analytics,
  dataset,
}) => {
  const symbol = analytics.currency?.symbol || '$'
  const code = analytics.currency?.code || 'USD'

  const formatMoney = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A'

    return `${symbol}${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const formatNum = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A'
    return val.toLocaleString('en-US')
  }

  return (
    <div className="absolute left-[-10000px] top-0 w-full print:static print:left-0 print:top-0 print:block font-sans text-slate-900 bg-white p-8 max-w-none leading-normal">
      {/* Report Banner */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
            InsightFlow Retail Analytics Report
          </h1>

          <p className="text-xs text-slate-600 mt-1">
            Generated automated performance audit and executive summary
          </p>
        </div>

        <div className="text-right text-xs text-slate-500">
          <p>Date: {new Date().toLocaleDateString()}</p>
          <p>
            Currency: {symbol} ({code})
          </p>
        </div>
      </div>

      {/* 1. Dataset Information */}
      <div className="mb-6 p-4 border border-slate-300 rounded bg-slate-50 break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">
          Dataset Metadata
        </h2>

        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-semibold text-slate-600">File Name: </span>
            <span className="font-bold">
              {dataset?.file_name || analytics.dataset_id}
            </span>
          </div>

          <div>
            <span className="font-semibold text-slate-600">Total Rows: </span>
            <span>
              {dataset?.row_count?.toLocaleString() ||
                analytics.data_quality.total_rows.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="font-semibold text-slate-600">
              Total Columns:{' '}
            </span>
            <span>{dataset?.column_count || 'N/A'}</span>
          </div>

          <div>
            <span className="font-semibold text-slate-600">Status: </span>
            <span className="capitalize">
              {dataset?.status || 'Active'}
            </span>
          </div>

          <div>
            <span className="font-semibold text-slate-600">
              Uploaded Date:{' '}
            </span>
            <span>
              {dataset?.created_at
                ? new Date(dataset.created_at).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>

          <div>
            <span className="font-semibold text-slate-600">
              Currency Source:{' '}
            </span>
            <span className="uppercase">
              {analytics.currency?.source || 'Default'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Indicators */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-300 pb-1 mb-3">
          1. Key Performance Metrics Summary
        </h2>

        <table className="w-full text-xs border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="border border-slate-300 p-2 text-left">
                Metric Name
              </th>
              <th className="border border-slate-300 p-2 text-right">
                Value
              </th>
              <th className="border border-slate-300 p-2 text-left">
                Description
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border border-slate-300 p-2 font-bold">
                Total Revenue
              </td>
              <td className="border border-slate-300 p-2 text-right font-bold text-slate-900">
                {formatMoney(analytics.summary.total_revenue)}
              </td>
              <td className="border border-slate-300 p-2 text-slate-600">
                Gross revenue generated across parsed valid dataset rows
              </td>
            </tr>

            <tr>
              <td className="border border-slate-300 p-2 font-bold">
                Total Orders
              </td>
              <td className="border border-slate-300 p-2 text-right font-bold">
                {formatNum(analytics.summary.total_orders)}
              </td>
              <td className="border border-slate-300 p-2 text-slate-600">
                Total count of distinct order invoices processed
              </td>
            </tr>

            <tr>
              <td className="border border-slate-300 p-2 font-bold">
                Total Units Sold
              </td>
              <td className="border border-slate-300 p-2 text-right font-bold">
                {formatNum(analytics.summary.total_units)}
              </td>
              <td className="border border-slate-300 p-2 text-slate-600">
                Total aggregate unit quantities sold
              </td>
            </tr>

            <tr>
              <td className="border border-slate-300 p-2 font-bold">
                Average Order Value (AOV)
              </td>
              <td className="border border-slate-300 p-2 text-right font-bold">
                {formatMoney(analytics.summary.average_order_value)}
              </td>
              <td className="border border-slate-300 p-2 text-slate-600">
                Average monetary value per completed order
              </td>
            </tr>

            <tr>
              <td className="border border-slate-300 p-2 font-bold">
                Average Unit Price
              </td>
              <td className="border border-slate-300 p-2 text-right font-bold">
                {formatMoney(analytics.summary.average_unit_price)}
              </td>
              <td className="border border-slate-300 p-2 text-slate-600">
                Average revenue yield per unit sold
              </td>
            </tr>

            <tr>
              <td className="border border-slate-300 p-2 font-bold">
                Unique Customers
              </td>
              <td className="border border-slate-300 p-2 text-right font-bold">
                {formatNum(analytics.summary.unique_customers)}
              </td>
              <td className="border border-slate-300 p-2 text-slate-600">
                Distinct customer accounts or IDs recorded
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Sales Trend */}
      {analytics.time_series.length > 0 && (
        <div className="mb-6 break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-300 pb-1 mb-3">
            2. Sales & Revenue Trend
          </h2>

          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-300 p-2 text-left">
                  Period
                </th>
                <th className="border border-slate-300 p-2 text-right">
                  Revenue
                </th>
                <th className="border border-slate-300 p-2 text-right">
                  Orders
                </th>
                <th className="border border-slate-300 p-2 text-right">
                  Units
                </th>
              </tr>
            </thead>

            <tbody>
              {analytics.time_series.slice(0, 12).map((item, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  <td className="border border-slate-300 p-2 font-medium">
                    {item.period}
                  </td>

                  <td className="border border-slate-300 p-2 text-right font-semibold">
                    {formatMoney(item.revenue)}
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatNum(item.orders)}
                  </td>

                  <td className="border border-slate-300 p-2 text-right">
                    {formatNum(item.units)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Category & Product Performance */}
      <div className="mb-6 space-y-6">
        {/* Categories */}
        <div className="break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-300 pb-1 mb-3">
            3. Category Performance
          </h2>

          {analytics.categories.length === 0 ? (
            <p className="text-xs text-slate-500">
              No category breakdown available.
            </p>
          ) : (
            <>

              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 p-2 text-left">
                      Category
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      Revenue
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      Share
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.categories.slice(0, 6).map((cat, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-300 p-2 font-medium">
                        {cat.category}
                      </td>

                      <td className="border border-slate-300 p-2 text-right font-semibold">
                        {formatMoney(cat.revenue)}
                      </td>

                      <td className="border border-slate-300 p-2 text-right">
                        {cat.revenue_share}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Top Products */}
        <div className="break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-300 pb-1 mb-3">
            4. Top Products Performance
          </h2>

          {analytics.top_products.length === 0 ? (
            <p className="text-xs text-slate-500">
              No product data available.
            </p>
          ) : (
            <>

              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 p-2 text-left">
                      Product
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      Revenue
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      Units
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.top_products.slice(0, 6).map((prod, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-300 p-2 font-medium truncate max-w-[140px]">
                        {prod.description || prod.stock_code || 'Product'}
                      </td>

                      <td className="border border-slate-300 p-2 text-right font-semibold">
                        {formatMoney(prod.revenue)}
                      </td>

                      <td className="border border-slate-300 p-2 text-right">
                        {formatNum(prod.units)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* 5. Location & Country Analysis */}
      <div className="mb-6 space-y-6">
        {/* Locations */}
        <div className="break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-300 pb-1 mb-3">
            5. Location Analysis
          </h2>

          {analytics.locations.length === 0 ? (
            <p className="text-xs text-slate-500">
              No store location data available.
            </p>
          ) : (
            <>

              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 p-2 text-left">
                      Location
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      Revenue
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      Orders
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.locations.slice(0, 5).map((loc, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-300 p-2 font-medium">
                        {loc.store_location}
                      </td>

                      <td className="border border-slate-300 p-2 text-right font-semibold">
                        {formatMoney(loc.revenue)}
                      </td>

                      <td className="border border-slate-300 p-2 text-right">
                        {formatNum(loc.orders)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Countries */}
        <div className="break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-300 pb-1 mb-3">
            6. Country Analysis
          </h2>

          {analytics.countries.length === 0 ? (
            <p className="text-xs text-slate-500">
              No country data available.
            </p>
          ) : (
            <>

              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="border border-slate-300 p-2 text-left">
                      Country
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      Revenue
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      Orders
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.countries.slice(0, 5).map((ctry, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-300 p-2 font-medium">
                        {ctry.country}
                      </td>

                      <td className="border border-slate-300 p-2 text-right font-semibold">
                        {formatMoney(ctry.revenue)}
                      </td>

                      <td className="border border-slate-300 p-2 text-right">
                        {formatNum(ctry.orders)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* 6. Anomalies Section */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-300 pb-1 mb-3">
          7. Outlier & Anomaly Analysis
        </h2>

        {analytics.anomalies.length === 0 ? (
          <p className="text-xs text-slate-500">
            No anomalies or statistical outliers detected in dataset.
          </p>
        ) : (
          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-300 p-2 text-left">
                  Period
                </th>
                <th className="border border-slate-300 p-2 text-left">
                  Metric
                </th>
                <th className="border border-slate-300 p-2 text-right">
                  Actual
                </th>
                <th className="border border-slate-300 p-2 text-right">
                  Expected
                </th>
                <th className="border border-slate-300 p-2 text-center">
                  Severity
                </th>
                <th className="border border-slate-300 p-2 text-left">
                  Explanation
                </th>
              </tr>
            </thead>

            <tbody>
              {analytics.anomalies.map((anom, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-300 p-2 font-medium">
                    {anom.period}
                  </td>

                  <td className="border border-slate-300 p-2 uppercase font-semibold">
                    {anom.metric}
                  </td>

                  <td className="border border-slate-300 p-2 text-right font-bold">
                    {formatMoney(anom.value)}
                  </td>

                  <td className="border border-slate-300 p-2 text-right text-slate-600">
                    {formatMoney(anom.expected)}
                  </td>

                  <td className="border border-slate-300 p-2 text-center uppercase font-bold text-[10px]">
                    {anom.severity}
                  </td>

                  <td className="border border-slate-300 p-2 text-slate-600">
                    {anom.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 7. Data Quality Audit Summary */}
      <div className="mb-6 break-inside-avoid">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-300 pb-1 mb-3">
          8. Data Quality & Audit Summary
        </h2>

        <div className="grid grid-cols-4 gap-3 text-xs border border-slate-300 p-4 bg-slate-50 rounded">
          <div>
            <span className="text-slate-600 block">Total Rows:</span>
            <span className="font-bold text-sm">
              {formatNum(analytics.data_quality.total_rows)}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block">Valid Clean Rows:</span>
            <span className="font-bold text-sm text-emerald-700">
              {formatNum(analytics.data_quality.valid_rows)}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block">Excluded Rows:</span>
            <span className="font-bold text-sm text-rose-700">
              {formatNum(analytics.data_quality.removed_rows)}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block">
              Duplicate Rows Removed:
            </span>
            <span className="font-bold text-sm">
              {formatNum(analytics.data_quality.duplicate_rows_removed)}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block">Invalid Dates:</span>
            <span className="font-semibold">
              {formatNum(analytics.data_quality.invalid_date_rows)}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block">Invalid Numerics:</span>
            <span className="font-semibold">
              {formatNum(analytics.data_quality.invalid_numeric_rows)}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block">
              Negative Quantities:
            </span>
            <span className="font-semibold">
              {formatNum(analytics.data_quality.negative_quantity_rows)}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block">
              Negative Revenue Rows:
            </span>
            <span className="font-semibold">
              {formatNum(analytics.data_quality.negative_revenue_rows)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-300 pt-3 text-center text-[10px] text-slate-500">
        <p>
          InsightFlow Automated Analytics System • Confidential Retail
          Performance Report
        </p>
      </div>
    </div>
  )
}