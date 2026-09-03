import React, { useState, useRef } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  ImageIcon, 
  PlayCircle, 
  Compass, 
  Maximize2, 
  FileText, 
  Layers,
  RotateCw,
  Eye,
  X,
  Sparkles
} from 'lucide-react'
import { getMediaUrl } from '../../utils/media'

export default function ImageGallery({ images = [], video = null, propertyTitle = 'Property' }) {
  const [activeTab, setActiveTab] = useState('photos') // 'photos' | 'video' | '360' | 'floorplan'
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 360 viewer state
  const [panX, setPanX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)

  // Normalize image objects
  const photoList = images.map((img, idx) => ({
    id: img?.id || idx,
    url: getMediaUrl(img?.image_url || img?.image || img),
    caption: img?.caption || `${propertyTitle} - View ${idx + 1}`,
  }))

  const hasPhotos = photoList.length > 0
  const hasVideo = Boolean(video)
  const mainImage = photoList[currentPhoto] || { url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=800&fit=crop' }

  // 360 drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    startXRef.current = e.clientX - panX
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const newX = e.clientX - startXRef.current
    setPanX(newX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const prevPhoto = () => setCurrentPhoto((c) => (c === 0 ? photoList.length - 1 : c - 1))
  const nextPhoto = () => setCurrentPhoto((c) => (c === photoList.length - 1 ? 0 : c + 1))

  return (
    <div className="space-y-4">
      {/* Media Type Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-border-light pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'photos'
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'bg-surface-dim hover:bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos ({photoList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'bg-surface-dim hover:bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Video Walkthrough</span>
          </button>

          <button
            onClick={() => setActiveTab('360')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === '360'
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'bg-surface-dim hover:bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>360° Virtual Tour</span>
          </button>

          <button
            onClick={() => setActiveTab('floorplan')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'floorplan'
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'bg-surface-dim hover:bg-surface-muted text-text-secondary hover:text-text-primary'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Floor Plan & Survey</span>
          </button>
        </div>

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-dim transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold"
          title="View Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Expand</span>
        </button>
      </div>

      {/* Media Display Area */}
      <div className="relative aspect-[16/10] rounded-3xl overflow-hidden bg-slate-950 shadow-card flex items-center justify-center group select-none">
        {/* 1. Photos Tab */}
        {activeTab === 'photos' && (
          <>
            <img
              src={mainImage.url}
              alt={mainImage.caption}
              className="w-full h-full object-cover transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            {photoList.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary shadow-lg z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-primary shadow-lg z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-[11px] font-bold text-white tracking-wider">
                    {currentPhoto + 1} / {photoList.length}
                  </span>
                </div>
              </>
            )}
          </>
        )}

        {/* 2. Video Walkthrough Tab */}
        {activeTab === 'video' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black">
            {video ? (
              <video
                src={getMediaUrl(video)}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-8 max-w-sm">
                <div className="w-16 h-16 rounded-3xl bg-primary/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Promotional Video Tour</h4>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  HD drone recording and ground walkthrough uploaded by the verified realtor.
                </p>
                <button
                  onClick={() => alert("Video tour playback enabled in live production media.")}
                  className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-all"
                >
                  Play HD Walkthrough
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. 360° Interactive Panorama Tab */}
        {activeTab === '360' && (
          <div
            className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden bg-slate-900 flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={(e) => {
              setIsDragging(true)
              startXRef.current = e.touches[0].clientX - panX
            }}
            onTouchMove={(e) => {
              if (!isDragging) return
              const newX = e.touches[0].clientX - startXRef.current
              setPanX(newX)
            }}
            onTouchEnd={() => setIsDragging(false)}
          >
            {/* 360 Panorama Canvas Simulation */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-75"
              style={{
                backgroundImage: `url(${mainImage.url})`,
                transform: `scale(1.2) translateX(${panX * 0.5}px)`,
                filter: 'brightness(1.05)',
              }}
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 pointer-events-none">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Drag or swipe horizontally to look around (360°)</span>
            </div>
          </div>
        )}

        {/* 4. Floor Plan & Survey Tab */}
        {activeTab === 'floorplan' && (
          <div className="w-full h-full bg-slate-900 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Architectural Floor Plan & Survey Layout</h4>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
              Official registered beacon coordinates and dimensional floor plan schematics for this property.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => alert("Opening high-resolution schematic viewer...")}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-all"
              >
                Inspect High-Res Blueprint
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo Thumbnails Strip */}
      {activeTab === 'photos' && photoList.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {photoList.map((item, i) => (
            <button
              key={item.id || i}
              onClick={() => setCurrentPhoto(i)}
              className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all bg-slate-900 ${
                i === currentPhoto 
                  ? 'border-primary ring-2 ring-primary/30 scale-[1.02]' 
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={item.url}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-8 animate-fade-in">
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
            <h4 className="font-bold text-sm sm:text-base">{propertyTitle} (Fullscreen Media)</h4>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative py-4">
            <img
              src={mainImage.url}
              alt="Fullscreen"
              className="max-h-[78vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-white/10">
            Photo {currentPhoto + 1} of {photoList.length}
          </div>
        </div>
      )}
    </div>
  )
}
