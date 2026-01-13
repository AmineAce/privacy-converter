import { useState } from 'react'
import { useFileStore } from '@/core/store/useFileStore'

export function ConversionNav() {
  const [activeLabel, setActiveLabel] = useState('JPG to PNG')
  const setOutputFormat = useFileStore((state) => state.setOutputFormat)

  const CONVERSION_MODES = [
    { label: 'JPG to PNG', format: 'image/png' as const },
    { label: 'PNG to JPG', format: 'image/jpeg' as const },
    { label: 'WebP to JPG', format: 'image/jpeg' as const },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-2 p-1">
      {CONVERSION_MODES.map((mode) => {
        const isActive = activeLabel === mode.label
        return (
          <button
            key={mode.label}
            onClick={() => {
              setActiveLabel(mode.label)
              setOutputFormat(mode.format)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}
