import React, { useRef, useState } from 'react'
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatFileSize, cn } from '../../lib/utils'

interface GlassDropzoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onRemoveFile: () => void
  error?: string | null
  disabled?: boolean
}

export const GlassDropzone: React.FC<GlassDropzoneProps> = ({
  onFileSelect,
  selectedFile,
  onRemoveFile,
  error,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndProcessFile(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0])
    }
  }

  const validateAndProcessFile = (file: File) => {
    onFileSelect(file)
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {!selectedFile ? (
        <motion.div
          whileHover={{ scale: disabled ? 1 : 1.005 }}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer text-center',
            'bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl',
            isDragOver
              ? 'border-sky-500 bg-sky-500/10 dark:bg-sky-500/10 shadow-2xl shadow-sky-500/20'
              : 'border-slate-300 dark:border-white/15 hover:border-sky-500 dark:hover:border-sky-400 hover:bg-white/60 dark:hover:bg-slate-900/60 shadow-xl shadow-slate-900/5',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-500/30">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            Drag & drop your sales CSV file here
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
            Supported format: <span className="font-semibold text-slate-700 dark:text-slate-300">.csv</span> up to 50MB
          </p>

          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-500/10 rounded-xl border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
          >
            Browse files
          </button>
        </motion.div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{selectedFile.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(selectedFile.size)}</span>
            </div>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={onRemoveFile}
              className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
              title="Remove selected file"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
