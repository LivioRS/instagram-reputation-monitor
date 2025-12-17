'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import PostsTable from './posts-table'
import PostModal from './post-modal'

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

export default function PostsContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [periodFilter, setPeriodFilter] = useState('30')
  const [riskFilter, setRiskFilter] = useState('all')
  const [sentimentFilter, setSentimentFilter] = useState('all')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [periodFilter])

  useEffect(() => {
    applyFilters()
  }, [posts, searchTerm, riskFilter, sentimentFilter])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/posts?period=${periodFilter}`)
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...posts]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((post) =>
        post?.legenda?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      )
    }

    // Risk filter
    if (riskFilter !== 'all') {
      filtered = filtered.filter((post) => post?.nivelRisco === riskFilter)
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter((post) => {
        const maxSentiment = Math.max(
          post?.sentimentoPositivo ?? 0,
          post?.sentimentoNeutro ?? 0,
          post?.sentimentoNegativo ?? 0
        )
        if (sentimentFilter === 'positivo') return (post?.sentimentoPositivo ?? 0) === maxSentiment
        if (sentimentFilter === 'neutro') return (post?.sentimentoNeutro ?? 0) === maxSentiment
        if (sentimentFilter === 'negativo') return (post?.sentimentoNegativo ?? 0) === maxSentiment
        return true
      })
    }

    setFilteredPosts(filtered)
  }

  const handlePostClick = (post: Post) => {
    setSelectedPost(post)
    setModalOpen(true)
  }

  if (loading) {
    return <div className="py-8 text-center">Carregando posts...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar na legenda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value ?? '')}
            className="pl-10"
          />
        </div>
        
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 dias</SelectItem>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Nível de Risco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os riscos</SelectItem>
            <SelectItem value="baixo">Baixo</SelectItem>
            <SelectItem value="medio">Médio</SelectItem>
            <SelectItem value="alto">Alto</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sentimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="positivo">Positivo</SelectItem>
            <SelectItem value="neutro">Neutro</SelectItem>
            <SelectItem value="negativo">Negativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-600">
        Mostrando {filteredPosts?.length ?? 0} de {posts?.length ?? 0} posts
      </div>

      {/* Posts Table */}
      <PostsTable posts={filteredPosts} onPostClick={handlePostClick} />

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onUpdate={fetchPosts}
        />
      )}
    </div>
  )
}
