import React from 'react'

export const Background: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Ambient background blur fields - Apple visionOS style */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top Right Cyan/Blue glow */}
        <div className="absolute -top-[20%] -right-[10%] w-[650px] h-[650px] rounded-full bg-cyan-500/8 dark:bg-cyan-500/6 blur-[140px]" />
        
        {/* Top Left Indigo glow */}
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/8 dark:bg-indigo-600/6 blur-[150px]" />
        
        {/* Bottom Center Sky blue glow */}
        <div className="absolute -bottom-[20%] left-1/3 w-[700px] h-[700px] rounded-full bg-sky-500/6 dark:bg-sky-500/5 blur-[160px]" />

        {/* Subtle grid pattern overlay with substantially reduced opacity */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
