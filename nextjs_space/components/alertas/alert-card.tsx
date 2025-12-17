'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, ExternalLink, Heart, MessageCircle } from 'lucide-react'
import Image from 'next/image'

interface Alert {
  id: string
  postUrl: string
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

interface AlertCardProps {
  alert: Alert
  onStatusChange: (alertId: string, newStatus: string) => void
}

export default function AlertCard({ alert, onStatusChange }: AlertCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'alto': return 'destructive'
      case 'medio': return 'warning'
      default: return 'secondary'
    }
  }

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'alto': return 'bg-red-50 border-red-200'
      case 'medio': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-slate-50 border-slate-200'
    }
  }

  return (
    <Card className={`p-6 ${getRiskBgColor(alert?.nivelRisco ?? 'baixo')}`}>
      <div className="flex gap-6">
        {/* Thumbnail */}
        {alert?.thumbnailUrl && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
            <Image
              src={alert.thumbnailUrl}
              alt="Post"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${
                  alert?.nivelRisco === 'alto' ? 'text-red-600' :
                  alert?.nivelRisco === 'medio' ? 'text-yellow-600' :
                  'text-slate-600'
                }`} />
                <Badge variant={getRiskColor(alert?.nivelRisco ?? 'baixo')}>
                  RISCO {(alert?.nivelRisco ?? 'baixo').toUpperCase()}
                </Badge>
                <span className="text-sm text-slate-600">
                  {new Date(alert?.dataPublicacao ?? new Date()).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">Score:</span> {(alert?.scoreReputacao ?? 0).toFixed(1)}/10
                </div>
                <div>
                  <span className="font-semibold">Sentimento Negativo:</span> {(alert?.sentimentoNegativo ?? 0).toFixed(0)}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={alert?.statusAlerta ?? 'pendente'}
                onValueChange={(value) => onStatusChange(alert.id, value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>

              <Button asChild variant="outline" size="icon">
                <a href={alert?.postUrl ?? '#'} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Caption */}
          {alert?.legenda && (
            <div>
              <p className="text-sm text-slate-700 line-clamp-2">{alert.legenda}</p>
            </div>
          )}

          {/* Summary */}
          {alert?.resumo && (
            <div className="bg-white/50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Resumo</h4>
              <p className="text-sm text-slate-700">{alert.resumo}</p>
            </div>
          )}

          {/* Alerts */}
          {alert?.alertas && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-red-900 mb-1">Alertas</h4>
              <p className="text-sm text-red-800">{alert.alertas}</p>
            </div>
          )}

          {/* Recommendations */}
          {(alert?.recomendacoes?.length ?? 0) > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Recomendações</h4>
              <ul className="list-disc list-inside space-y-1">
                {alert.recomendacoes.map((rec, idx) => (
                  <li key={idx} className="text-sm text-blue-800">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
