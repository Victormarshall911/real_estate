import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon, PlayCircle } from 'lucide-react'

export default function ImageGallery({ images = [], video = null }) {
  const [current, setCurrent] = useState(0)

  // Construct media array with video at the front if it exists
  const media = []
  if (video) {
    media.push({ type: 'video', url: video })
  }
  images.forEach(img => {
    media.push({ type: 'image', url: img?.image_url || img?.image || img, caption: img?.caption })
  })

  if (media.length === 0) {
    return (
      <div className="aspect-[16/10] rounded-2xl bg-surface-muted flex items-center justify-center">
        <ImageIcon className="w-16 h-16 text-text-muted" />
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c === 0 ? media.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === media.length - 1 ? 0 : c + 1))

  const currentMedia = media[current]

  return (
    <div className="space-y-3">
      {/* Main Media */}
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black group flex items-center justify-center">
        {currentMedia.type === 'video' ? (
          <video
            src={currentMedia.url}
            controls
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={currentMedia.caption || `Property image ${current + 1}`}
            className="w-full h-full object-cover transition-transform duration-500"
          />
        )}

        {media.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
              aria-label="Previous media"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
              aria-label="Next media"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {media.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to media ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all bg-black flex items-center justify-center ${
                i === current ? 'border-primary ring-1 ring-primary/30' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <>
                  <video src={item.url} className="w-full h-full object-cover opacity-50" />
                  <PlayCircle className="absolute w-6 h-6 text-white" />
                </>
              ) : (
                <img
                  src={item.url}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
