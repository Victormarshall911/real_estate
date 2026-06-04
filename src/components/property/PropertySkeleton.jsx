export default function PropertySkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border-light overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 skeleton w-3/4" />
        <div className="h-4 skeleton w-1/2" />
        <div className="flex items-center justify-between pt-3 border-t border-border-light">
          <div className="h-4 skeleton w-24" />
          <div className="h-4 skeleton w-16" />
        </div>
      </div>
    </div>
  )
}
