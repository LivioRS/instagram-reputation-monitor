'use client'

import { Badge } from '@/components/ui/badge'
import { ExternalLink, Eye } from 'lucide-react'
import Image from 'next/image'

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

interface PostsTableProps {
  posts: Post[]
  onPostClick: (post: Post) => void
}

export default function PostsTable({ posts, onPostClick }: PostsTableProps) {
  if (!posts?.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-slate-500">Nenhum post encontrado</p>
      </div>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'alto': return 'destructive'
      case 'medio': return 'warning'
      default: return 'success'
    }
  }

  const getSentimentBadge = (post: Post) => {
    const max = Math.max(
      post?.sentimentoPositivo ?? 0,
      post?.sentimentoNeutro ?? 0,
      post?.sentimentoNegativo ?? 0
    )
    if ((post?.sentimentoPositivo ?? 0) === max) return { label: 'Positivo', variant: 'success' as const }
    if ((post?.sentimentoNegativo ?? 0) === max) return { label: 'Negativo', variant: 'destructive' as const }
    return { label: 'Neutro', variant: 'secondary' as const }
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Post
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Legenda
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Curtidas
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Comentários
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Risco
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Sentimento
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {posts.map((post) => {
              const sentiment = getSentimentBadge(post)
              return (
                <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-200">
                      {post?.thumbnailUrl ? (
                        <Image
                          src={post.thumbnailUrl}
                          alt="Post thumbnail"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {new Date(post.dataPublicacao).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 max-w-xs">
                    <p className="line-clamp-2">{post?.legenda || 'Sem legenda'}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-slate-600">
                    {post?.curtidas ?? 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-slate-600">
                    {post?.comentarios ?? 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <span className="font-semibold text-slate-900">
                      {(post?.scoreReputacao ?? 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant={getRiskColor(post?.nivelRisco ?? 'baixo')}>
                      {(post?.nivelRisco ?? 'baixo').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant={sentiment.variant}>{sentiment.label}</Badge>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onPostClick(post)}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Abrir no Instagram"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-600" />
                      </a>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
