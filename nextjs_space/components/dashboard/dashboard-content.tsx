'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'
import MetricCard from './metric-card'
import SentimentChart from './sentiment-chart'
import ReputationChart from './reputation-chart'
import RiskChart from './risk-chart'
import EngagementChart from './engagement-chart'
import RecentAlerts from './recent-alerts'

interface DashboardStats {
  totalPosts: number
  avgScore: number
  highRiskPosts: number
  avgSentiment: {
    positivo: number
    neutro: number
    negativo: number
  }
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/dashboard?period=${period}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Período Filter */}
      <div className="flex gap-2">
        {[
          { label: '7 dias', value: '7' },
          { label: '30 dias', value: '30' },
          { label: '90 dias', value: '90' },
          { label: 'Todos', value: 'all' },
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Posts"
          value={stats.totalPosts}
          icon={FileText}
          color="blue"
        />
        <MetricCard
          title="Score Médio"
          value={stats.avgScore.toFixed(1)}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Posts com Alerta"
          value={stats.highRiskPosts}
          icon={AlertTriangle}
          color="red"
        />
        <MetricCard
          title="Sentimento Positivo"
          value={`${stats.avgSentiment.positivo.toFixed(0)}%`}
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Sentimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <SentimentChart period={period} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts por Nível de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskChart period={period} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do Score de Reputação</CardTitle>
        </CardHeader>
        <CardContent>
          <ReputationChart period={period} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolução de Curtidas e Comentários</CardTitle>
        </CardHeader>
        <CardContent>
          <EngagementChart period={period} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentAlerts period={period} />
        </CardContent>
      </Card>
    </div>
  )
}
