import { Suspense } from 'react'
import ConfiguracoesContent from '@/components/configuracoes/configuracoes-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-600 mt-2">Configure credenciais e parâmetros do sistema</p>
      </div>
      
      <Suspense fallback={<ConfiguracoesSkeleton />}>
        <ConfiguracoesContent />
      </Suspense>
    </div>
  )
}

function ConfiguracoesSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  )
}
