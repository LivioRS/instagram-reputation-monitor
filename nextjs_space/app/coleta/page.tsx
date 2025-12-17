import { Suspense } from 'react'
import ColetaContent from '@/components/coleta/coleta-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function ColetaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Coleta Manual</h1>
        <p className="text-slate-600 mt-2">Execute a coleta de posts do Instagram manualmente</p>
      </div>
      
      <Suspense fallback={<ColetaSkeleton />}>
        <ColetaContent />
      </Suspense>
    </div>
  )
}

function ColetaSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32" />
      <Skeleton className="h-96" />
    </div>
  )
}
