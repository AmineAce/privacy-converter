import { useFileStore } from '@/core/store/useFileStore'

export function ConversionNav() {
  const activeMode = useFileStore((state) => state.activeMode)
  const suggestedModes = useFileStore((state) => state.suggestedModes)
  const setActiveMode = useFileStore((state) => state.setActiveMode)
  const setSuggestedModes = useFileStore((state) => state.setSuggestedModes)
  const setOutputFormat = useFileStore((state) => state.setOutputFormat)
  const resetFileStatuses = useFileStore((state) => state.resetFileStatuses)

  const CONVERSION_MODES = [
    { label: 'JPG to PNG', format: 'image/png' as const },
    { label: 'PNG to JPG', format: 'image/jpeg' as const },
    { label: 'WebP to JPG', format: 'image/jpeg' as const },
    { label: 'JPG to WebP', format: 'image/webp' as const },
    { label: 'PNG to WebP', format: 'image/webp' as const },
    { label: 'SVG to PNG', format: 'image/png' as const },
    { label: 'SVG to JPG', format: 'image/jpeg' as const },
    { label: 'HEIC to JPG', format: 'image/jpeg' as const },
    { label: 'HEIC to PNG', format: 'image/png' as const },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-2 p-1">
      {CONVERSION_MODES.map((mode) => {
        const isActive = activeMode === mode.label
        const isSuggested = suggestedModes.includes(mode.label) && activeMode === null
        return (
          <button
            key={mode.label}
            onClick={() => {
              if (activeMode !== mode.label) {
                resetFileStatuses()
              }
              setActiveMode(mode.label)
              setSuggestedModes([])
              setOutputFormat(mode.format)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : isSuggested
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-500 hover:bg-emerald-100 animate-pulse'
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
