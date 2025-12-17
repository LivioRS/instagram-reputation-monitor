'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, RefreshCw, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

interface Post {
  id: string
  postUrl: string
  postId: string
  dataPublicacao: string
  legenda: string | null
  tipoConteudo: string
  curtidas: number
  comentarios: number
  compartilhamentos: number
  saves: number
  scoreReputacao: number
  nivelRisco: string
  sentimentoPositivo: number
  sentimentoNeutro: number
  sentimentoNegativo: number
  temasPrincipais: string[]
  resumo: string | null
  alertas: string | null
  recomendacoes: string[]
  thumbnailUrl: string | null
}

interface PostModalProps {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export default function PostModal({ post, open, onOpenChange, onUpdate }: PostModalProps) {
  const [reprocessing, setReprocessing] = useState(false)

  const handleReprocess = async () => {
    try {
      setReprocessing(true)
      const res = await fetch(`/api/posts/${post.id}/reprocess`, {
        method: 'POST',
      })
      
      if (res.ok) {
        toast.success('Post reprocessado com sucesso!')
        onUpdate()
        onOpenChange(false)
      } else {
        toast.error('Erro ao reprocessar post')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao reprocessar post')
    } finally {
      setReprocessing(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'alto': return 'destructive'
      case 'medio': return 'warning'
      default: return 'success'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thumbnail */}
          {post?.thumbnailUrl && (
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-slate-200">
              <Image
                src={post.thumbnailUrl}
                alt="Post"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={getRiskColor(post?.nivelRisco ?? 'baixo')}>
                {(post?.nivelRisco ?? 'baixo').toUpperCase()}
              </Badge>
              <span className="text-sm text-slate-600">
                {new Date(post?.dataPublicacao ?? new Date()).toLocaleDateString('pt-BR')}
              </span>
              <span className="text-sm font-semibold text-slate-700">
                Score: {(post?.scoreReputacao ?? 0).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Caption */}
          {post?.legenda && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Legenda</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.legenda}</p>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-slate-600">Curtidas</p>
                <p className="font-semibold text-slate-900">{post?.curtidas ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-slate-600">Comentários</p>
                <p className="font-semibold text-slate-900">{post?.comentarios ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <Share2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-slate-600">Compartilh.</p>
                <p className="font-semibold text-slate-900">{post?.compartilhamentos ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <Bookmark className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-xs text-slate-600">Salvos</p>
                <p className="font-semibold text-slate-900">{post?.saves ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Sentiment */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Análise de Sentimento</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-700">Positivo</span>
                  <span className="font-semibold">{(post?.sentimentoPositivo ?? 0).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${post?.sentimentoPositivo ?? 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">Neutro</span>
                  <span className="font-semibold">{(post?.sentimentoNeutro ?? 0).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-slate-400 h-2 rounded-full"
                    style={{ width: `${post?.sentimentoNeutro ?? 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-700">Negativo</span>
                  <span className="font-semibold">{(post?.sentimentoNegativo ?? 0).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${post?.sentimentoNegativo ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {post?.resumo && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Resumo da Análise</h3>
              <p className="text-sm text-slate-700">{post.resumo}</p>
            </div>
          )}

          {(post?.temasPrincipais?.length ?? 0) > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Temas Principais</h3>
              <div className="flex flex-wrap gap-2">
                {post.temasPrincipais.map((tema, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tema}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {post?.alertas && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">Alertas</h3>
              <p className="text-sm text-red-700">{post.alertas}</p>
            </div>
          )}

          {(post?.recomendacoes?.length ?? 0) > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Recomendações</h3>
              <ul className="list-disc list-inside space-y-1">
                {post.recomendacoes.map((rec, idx) => (
                  <li key={idx} className="text-sm text-blue-700">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleReprocess}
              disabled={reprocessing}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${reprocessing ? 'animate-spin' : ''}`} />
              {reprocessing ? 'Reprocessando...' : 'Reprocessar Análise'}
            </Button>
            <Button asChild variant="default">
              <a href={post?.postUrl ?? '#'} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir no Instagram
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
