import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UploadCloud, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react'
import { GlassCard } from '../components/ui/GlassCard'
import { GlassButton } from '../components/ui/GlassButton'
import { GlassDropzone } from '../components/upload/GlassDropzone'
import { CsvPreview } from '../components/upload/CsvPreview'
import { parseAndValidateCsv } from '../lib/csv'
import { supabase, STORAGE_BUCKET } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { CsvValidationResult } from '../types'

export const Upload: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null)
  const [parsing, setParsing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setUploadError(null)
    setUploadSuccess(false)

    // Check extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Invalid file format. Please select a .csv file.')
      setValidationResult(null)
      return
    }

    setParsing(true)
    try {
      const result = await parseAndValidateCsv(file)
      setValidationResult(result)
      if (!result.isValid) {
        setUploadError(result.error || 'Failed to parse CSV file.')
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error parsing CSV file.')
      setValidationResult(null)
    } finally {
      setParsing(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setValidationResult(null)
    setUploadError(null)
    setUploadSuccess(false)
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile || !validationResult || !validationResult.isValid || !user) {
      return
    }

    setUploading(true)
    setUploadError(null)

    let storagePath: string | null = null

    try {
      // 1. Generate unique file path in storage: {user_id}/{timestamp}_{filename}
      const fileExt = selectedFile.name.split('.').pop()
      const sanitizedBase = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
      const uniqueFileName = `${Date.now()}_${sanitizedBase}.${fileExt}`
      storagePath = `${user.id}/${uniqueFileName}`

      // 2. Upload file to private Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`)
      }

      // 3. Insert metadata into datasets PostgreSQL table
      const { error: dbError } = await (supabase as any).from('datasets').insert({
        user_id: user.id,
        file_name: selectedFile.name,
        storage_path: storagePath,
        file_size: selectedFile.size,
        row_count: validationResult.rowCount,
        column_count: validationResult.columnCount,
        columns: validationResult.columns,
        status: 'uploaded',
      })

      if (dbError) {
        // Rollback: delete storage object if metadata insertion fails
        if (storagePath) {
          await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
        }
        throw new Error(`Database record creation failed: ${dbError.message}`)
      }

      setUploadSuccess(true)
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during upload.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 py-2 max-w-4xl mx-auto">
      {/* Header Info Banner */}
      <GlassCard className="p-5 md:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Upload Sales Dataset
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload your retail sales CSV file. InsightFlow will validate structure and store it securely in private cloud storage.
          </p>
        </div>
      </GlassCard>

      {uploadSuccess ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassCard className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dataset Uploaded Successfully!</h3>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
              Your CSV file <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedFile?.name}</span> ({validationResult?.rowCount.toLocaleString()} rows) has been securely stored and indexed.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-3 w-full sm:w-auto">
              <GlassButton variant="secondary" onClick={handleRemoveFile}>
                <RefreshCw className="w-4 h-4" />
                <span>Upload Another File</span>
              </GlassButton>

              <GlassButton variant="primary" onClick={() => navigate('/history')}>
                <span>View Upload History</span>
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Dropzone Component */}
          <GlassCard className="p-5 md:p-6">
            <GlassDropzone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onRemoveFile={handleRemoveFile}
              error={uploadError}
              disabled={parsing || uploading}
            />
          </GlassCard>

          {/* Validation & Preview Section */}
          {parsing && (
            <div className="flex items-center justify-center p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold text-xs">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Parsing and validating CSV structure...</span>
              </div>
            </div>
          )}

          {validationResult && validationResult.isValid && selectedFile && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <CsvPreview validationResult={validationResult} fileName={selectedFile.name} />

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <GlassButton variant="outline" onClick={handleRemoveFile} disabled={uploading}>
                  Cancel
                </GlassButton>

                <GlassButton variant="primary" size="md" onClick={handleConfirmUpload} isLoading={uploading}>
                  <UploadCloud className="w-4 h-4" />
                  <span>Confirm & Upload to Cloud</span>
                </GlassButton>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

