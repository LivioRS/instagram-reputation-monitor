import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PerfilContent from './perfil-content'

export const metadata = {
  title: 'Gestão de Perfis | Instagram Monitor',
  description: 'Gerencie múltiplos perfis do Instagram'
}

export default function PerfisPage() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gestão de Perfis</h1>
        <p className="text-slate-600 mt-1">Gerencie até 30 perfis diferentes do Instagram</p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <PerfilContent />
      </Suspense>
    </div>
  )
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
