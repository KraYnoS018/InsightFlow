import Papa from 'papaparse'
import type { CsvValidationResult } from '../types'

export async function parseAndValidateCsv(file: File): Promise<CsvValidationResult> {
  return new Promise((resolve) => {
    // 1. Basic file check
    if (!file) {
      return resolve({
        isValid: false,
        rowCount: 0,
        columnCount: 0,
        columns: [],
        previewRows: [],
        error: 'No file provided.',
      })
    }

    if (file.size === 0) {
      return resolve({
        isValid: false,
        rowCount: 0,
        columnCount: 0,
        columns: [],
        previewRows: [],
        error: 'The CSV file is empty (0 bytes).',
      })
    }

    // Maximum size safety check (e.g. 50MB)
    const maxSizeBytes = 50 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return resolve({
        isValid: false,
        rowCount: 0,
        columnCount: 0,
        columns: [],
        previewRows: [],
        error: 'File size exceeds 50MB limit.',
      })
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (results) => {
        const warnings: string[] = []
        const data = results.data as Record<string, any>[]
        const fields = results.meta.fields || []

        // 2. Check for empty CSV or missing headers
        if (fields.length === 0 && data.length === 0) {
          return resolve({
            isValid: false,
            rowCount: 0,
            columnCount: 0,
            columns: [],
            previewRows: [],
            error: 'Unable to detect columns or rows in CSV file.',
          })
        }

        // Clean column headers
        const cleanColumns = fields.map((col) => col.trim()).filter(Boolean)

        if (cleanColumns.length === 0) {
          return resolve({
            isValid: false,
            rowCount: 0,
            columnCount: 0,
            columns: [],
            previewRows: [],
            error: 'CSV header is empty or invalid.',
          })
        }

        // 3. Detect duplicate columns
        const seenCols = new Set<string>()
        const duplicateCols = new Set<string>()
        cleanColumns.forEach((col) => {
          if (seenCols.has(col.toLowerCase())) {
            duplicateCols.add(col)
          }
          seenCols.add(col.toLowerCase())
        })

        if (duplicateCols.size > 0) {
          warnings.push(`Duplicate column headers detected: ${Array.from(duplicateCols).join(', ')}`)
        }

        // 4. Validate row count
        if (data.length === 0) {
          return resolve({
            isValid: false,
            rowCount: 0,
            columnCount: cleanColumns.length,
            columns: cleanColumns,
            previewRows: [],
            error: 'CSV file contains headers but no data rows.',
          })
        }

        // 5. Get preview (first 5 rows)
        const previewRows = data.slice(0, 5)

        resolve({
          isValid: true,
          rowCount: data.length,
          columnCount: cleanColumns.length,
          columns: cleanColumns,
          previewRows,
          warnings: warnings.length > 0 ? warnings : undefined,
        })
      },
      error: (error) => {
        resolve({
          isValid: false,
          rowCount: 0,
          columnCount: 0,
          columns: [],
          previewRows: [],
          error: `CSV Parsing Error: ${error.message}`,
        })
      },
    })
  })
}
