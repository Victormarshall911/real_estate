import React from 'react'
import { Scale, X, ArrowRight, Trash2, ShieldCheck } from 'lucide-react'
import { useCompare } from '../../context/CompareContext'
import { getMediaUrl } from '../../utils/media'

export default function PropertyCompareTray() {
  const { 
    selectedProperties, 
    compareCount, 
    removeCompare, 
    clearCompare, 
    openCompareModal 
  } = useCompare()

  if (compareCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-700/80 shadow-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Info & Chips */}
        <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-2 bg-primary/20 text-emerald-400 px-3 py-1.5 rounded-xl border border-primary/30 shrink-0">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Compare ({compareCount}/4)
            </span>
          </div>

          {/* Property Chips */}
          <div className="flex items-center gap-2 shrink-0">
            {selectedProperties.map((prop) => (
              <div
                key={prop.id}
                className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 py-1 pl-1 pr-2 rounded-xl text-xs shrink-0 group relative"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-700 shrink-0">
                  {prop.primary_image_url ? (
                    <img
                      src={getMediaUrl(prop.primary_image_url)}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                      🏠
                    </div>
                  )}
                </div>
                <span className="max-w-[90px] sm:max-w-[120px] truncate font-medium text-slate-200">
                  {prop.title}
                </span>
                <button
                  onClick={() => removeCompare(prop.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Remove from comparison"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={clearCompare}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 font-semibold"
            title="Clear all selected"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={openCompareModal}
            disabled={compareCount < 2}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-lg shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-[0.98]"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
