'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AlertCard from './alert-card'

interface Alert {
  id: string
  postUrl: string
  postId: string
  dataPublicacao: string
  legenda: string | null
  thumbnailUrl: string | null
  scoreReputacao: number
  nivelRisco: string
  sentimentoPositivo: number
  sentimentoNeutro: number
  sentimentoNegativo: number
  resumo: string | null
  alertas: string | null
  recomendacoes: string[]
  statusAlerta: string
}

export default function AlertasContent() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAlerts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [alerts, statusFilter])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/alertas')
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

  const applyFilters = () => {
    let filtered = [...alerts]

    if (statusFilter !== 'all') {
      filtered = filtered.filter((alert) => alert?.statusAlerta === statusFilter)
    }

    setFilteredAlerts(filtered)
  }

  const handleStatusChange = async (alertId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/alertas/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusAlerta: newStatus }),
      })

      if (res.ok) {
        await fetchAlerts()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Carregando alertas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="em_analise">Em Análise</SelectItem>
            <SelectItem value="resolvido">Resolvidos</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-slate-600">
          {filteredAlerts?.length ?? 0} alerta(s) encontrado(s)
        </div>
      </div>

      {/* Alerts List */}
      {(filteredAlerts?.length ?? 0) === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-slate-500">Nenhum alerta encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
