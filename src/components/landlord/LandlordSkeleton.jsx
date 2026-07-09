export default function LandlordSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border p-5 shadow-card flex flex-col justify-between h-full space-y-4">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 rounded-2xl skeleton shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 skeleton w-3/4 rounded-md" />
          <div className="h-4 skeleton w-1/2 rounded-md" />
        </div>
      </div>
      
      <div className="space-y-2 pt-2 border-t border-border/60">
        <div className="h-3.5 skeleton w-full rounded-md" />
        <div className="h-3.5 skeleton w-2/3 rounded-md" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <div className="h-4 skeleton w-20 rounded-md" />
        <div className="h-9 skeleton w-24 rounded-xl" />
      </div>
    </div>
  )
}
