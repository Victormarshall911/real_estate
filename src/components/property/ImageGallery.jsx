import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'

export default function ImageGallery({ images = [] }) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/10] rounded-2xl bg-surface-muted flex items-center justify-center">
        <ImageIcon className="w-16 h-16 text-text-muted" />
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-surface-muted group">
        <img
          src={images[current]?.image_url || images[current]?.image || images[current]}
          alt={images[current]?.caption || `Property image ${current + 1}`}
          className="w-full h-full object-cover transition-transform duration-500"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === current ? 'border-primary ring-1 ring-primary/30' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img?.image_url || img?.image || img}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
