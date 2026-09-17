import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import { fetchDatasetAnalytics } from '../lib/api'
import type { Dataset, AnalyticsResponse } from '../types'

interface AnalyticsContextType {
  datasets: Dataset[]
  datasetsLoading: boolean
  datasetsError: string | null
  selectedDatasetId: string | null
  setSelectedDatasetId: (id: string | null) => void
  analytics: AnalyticsResponse | null
  analyticsLoading: boolean
  analyticsError: string | null
  loadDatasets: () => Promise<void>
  loadAnalytics: (datasetId: string) => Promise<void>
  searchTerm: string
  setSearchTerm: (term: string) => void
  activeDataset: Dataset | undefined
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth()
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [datasetsLoading, setDatasetsLoading] = useState<boolean>(true)
  const [datasetsError, setDatasetsError] = useState<string | null>(null)

  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState<string>('')

  const loadDatasets = useCallback(async () => {
    if (!user) {
      setDatasets([])
      setDatasetsLoading(false)
      return
    }
    setDatasetsLoading(true)
    setDatasetsError(null)

    try {
      const { data, error } = await (supabase as any)
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const list: Dataset[] = data || []
      setDatasets(list)

      setSelectedDatasetId((prev) => {
        if (prev && list.some((d) => d.id === prev)) return prev
        return list.length > 0 ? list[0].id : null
      })
    } catch (err: any) {
      setDatasetsError(err.message || 'Failed to fetch uploaded datasets.')
    } finally {
      setDatasetsLoading(false)
    }
  }, [user])

  const loadAnalytics = useCallback(
    async (datasetId: string) => {
      if (!session?.access_token) {
        setAnalyticsError('No active user session. Please sign in again.')
        return
      }

      setAnalyticsLoading(true)
      setAnalyticsError(null)

      try {
        const result = await fetchDatasetAnalytics(datasetId, session.access_token)
        setAnalytics(result)
      } catch (err: any) {
        setAnalyticsError(err.message || 'Failed to compute dataset analytics.')
        setAnalytics(null)
      } finally {
        setAnalyticsLoading(false)
      }
    },
    [session]
  )

  useEffect(() => {
    let isMounted = true
    void (async () => {
      if (isMounted) await loadDatasets()
    })()
    return () => {
      isMounted = false
    }
  }, [loadDatasets])

  useEffect(() => {
    let isMounted = true
    if (selectedDatasetId) {
      void (async () => {
        if (isMounted) await loadAnalytics(selectedDatasetId)
      })()
    }
    return () => {
      isMounted = false
    }
  }, [selectedDatasetId, loadAnalytics])

  const activeDataset = useMemo(() => {
    return datasets.find((d) => d.id === selectedDatasetId)
  }, [datasets, selectedDatasetId])

  return (
    <AnalyticsContext.Provider
      value={{
        datasets,
        datasetsLoading,
        datasetsError,
        selectedDatasetId,
        setSelectedDatasetId,
        analytics,
        analyticsLoading,
        analyticsError,
        loadDatasets,
        loadAnalytics,
        searchTerm,
        setSearchTerm,
        activeDataset,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}
