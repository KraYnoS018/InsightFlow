import type { AnalyticsResponse } from '../types'

/**
 * API client helper to request analytics for a user's dataset from the FastAPI backend.
 *
 * @param datasetId - ID of the dataset owned by the user
 * @param accessToken - Supabase Bearer JWT session token
 * @returns Promise<AnalyticsResponse>
 */
export async function fetchDatasetAnalytics(
  datasetId: string,
  accessToken: string
): Promise<AnalyticsResponse> {
  if (!datasetId) {
    throw new Error('Dataset ID is required.')
  }
  if (!accessToken) {
    throw new Error('Authentication token is required.')
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  const response = await fetch(`${API_BASE_URL}/api/analytics/${datasetId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    let errorDetail = `API Error (${response.status})`
    try {
      const errorJson = await response.json()
      if (errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail)
      }
    } catch {
      // Ignore JSON parse errors for non-JSON error pages
    }
    throw new Error(errorDetail)
  }

  const data: AnalyticsResponse = await response.json()
  return data
}
