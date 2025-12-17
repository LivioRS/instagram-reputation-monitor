import { Suspense } from 'react'
import AlertasContent from '@/components/alertas/alertas-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function AlertasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Alertas</h1>
        <p className="text-slate-600 mt-2">Posts que geraram alertas de risco ou sentimento negativo</p>
      </div>
      
      <Suspense fallback={<AlertasSkeleton />}>
        <AlertasContent />
      </Suspense>
    </div>
  )
}

function AlertasSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  )
}
