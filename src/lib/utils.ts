import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
}

export function formatCurrency(
  value: number | null | undefined,
  currency?: { code?: string; symbol?: string } | null
): string {
  if (value === null || value === undefined) return 'N/A'

  const code = currency?.code || 'UNKNOWN'

  if (code === 'UNKNOWN') {
    const symbol = currency?.symbol || '$'
    return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      currencyDisplay: 'symbol',
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    const symbol = currency?.symbol || '$'
    return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }
}

