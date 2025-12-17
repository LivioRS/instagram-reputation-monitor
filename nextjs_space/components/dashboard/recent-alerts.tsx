'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Alert {
  id: string
  postUrl: string
  dataPublicacao: string
  scoreReputacao: number
  nivelRisco: string
  resumo: string | null
}

interface RecentAlertsProps {
  period: string
}

export default function RecentAlerts({ period }: RecentAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [period])

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`/api/dashboard/recent-alerts?period=${period}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data)
      }
    } catch (error) {
      console.error('Erro ao buscar alertas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-4">Carregando...</div>
  if (!alerts?.length) return <div className="py-8 text-center text-slate-500">Nenhum alerta recente</div>

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'alto': return 'destructive'
      case 'medio': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="p-2 rounded-lg bg-red-50">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getRiskColor(alert.nivelRisco)}>
                {alert.nivelRisco.toUpperCase()}
              </Badge>
              <span className="text-sm text-slate-500">
                {new Date(alert.dataPublicacao).toLocaleDateString('pt-BR')}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                Score: {alert.scoreReputacao.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-slate-700 line-clamp-2">
              {alert.resumo || 'Sem resumo disponível'}
            </p>
          </div>
          <a
            href={alert.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-600" />
          </a>
        </div>
      ))}
      <div className="pt-2">
        <Link
          href="/alertas"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver todos os alertas →
        </Link>
      </div>
    </div>
  )
}
