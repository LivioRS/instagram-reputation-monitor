/**
 * Adapter do Instagram usando Apify
 * Converte dados do Apify para o formato padrão do sistema
 */

import { SocialPlatformAdapter, RawSocialPost, RawSocialComment, SocialPlatform, ContentType } from '@/lib/types/social'
import prisma from '@/lib/db'

export class InstagramAdapter implements SocialPlatformAdapter {
  platform: SocialPlatform = SocialPlatform.INSTAGRAM

  constructor(private apiToken: string) {}

  /**
   * Coleta posts do Instagram via Apify
   */
  async collectPosts(
    profileUsername: string,
    options?: {
      limit?: number
      since?: Date
      postUrl?: string
    }
  ): Promise<RawSocialPost[]> {
    if (options?.postUrl) {
      return this.collectSinglePost(options.postUrl)
    }

    return this.collectProfilePosts(profileUsername, options?.limit || 30)
  }

  /**
   * Coleta um post específico
   */
  private async collectSinglePost(postUrl: string): Promise<RawSocialPost[]> {
    // Iniciar o actor do Instagram Scraper para um post específico
    const runResponse = await fetch('https://api.apify.com/v2/acts/apify~instagram-scraper/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify({
        directUrls: [postUrl],
        resultsType: 'posts',
        resultsLimit: 1,
      }),
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      throw new Error(`Falha ao iniciar Apify Actor: ${runResponse.status} - ${errorText}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data.id

    // Aguardar finalização do actor (polling)
    let status = 'RUNNING'
    let attempts = 0
    const maxAttempts = 60

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000))

      const statusResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Erro ao verificar status do Apify: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()
      status = statusData.data.status
      attempts++
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Apify Actor não finalizou com sucesso. Status: ${status}`)
    }

    // Buscar resultados
    const datasetId = runData.data.defaultDatasetId
    const resultsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    })

    if (!resultsResponse.ok) {
      throw new Error(`Erro ao buscar resultados do Apify: ${resultsResponse.status}`)
    }

    const results = await resultsResponse.json()

    if (!results || results.length === 0) {
      throw new Error('Nenhum resultado retornado pelo Apify. Verifique se o link está correto.')
    }

    return [this.mapApifyToRawPost(results[0], postUrl)]
  }

  /**
   * Coleta posts de um perfil
   */
  private async collectProfilePosts(username: string, limit: number): Promise<RawSocialPost[]> {
    // Iniciar o actor do Instagram Scraper
    const runResponse = await fetch('https://api.apify.com/v2/acts/apify~instagram-scraper/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify({
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: 'posts',
        resultsLimit: limit,
        searchType: 'user',
        searchLimit: 1,
      }),
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      throw new Error(`Falha ao iniciar Apify Actor: ${runResponse.status} - ${errorText}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data.id

    // Aguardar finalização do actor (polling)
    let status = 'RUNNING'
    let attempts = 0
    const maxAttempts = 60

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000))

      const statusResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Erro ao verificar status do Apify: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()
      status = statusData.data.status
      attempts++
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Apify Actor não finalizou com sucesso. Status: ${status}`)
    }

    // Buscar resultados
    const datasetId = runData.data.defaultDatasetId
    const resultsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    })

    if (!resultsResponse.ok) {
      throw new Error(`Erro ao buscar resultados do Apify: ${resultsResponse.status}`)
    }

    const results = await resultsResponse.json()

    return results.map((item: any) => this.mapApifyToRawPost(item))
  }

  /**
   * Converte dados do Apify para formato RawSocialPost
   */
  private mapApifyToRawPost(item: any, fallbackUrl?: string): RawSocialPost {
    // Mapear tipo de conteúdo
    let contentType: ContentType = 'image'
    if (item.type === 'Video') {
      contentType = 'video'
    } else if (item.type === 'Sidecar') {
      contentType = 'carousel'
    } else if (item.type === 'Reel') {
      contentType = 'reel'
    }

    return {
      externalId: item.id || item.shortCode || `ig_${Date.now()}`,
      postUrl: item.url || fallbackUrl || `https://www.instagram.com/p/${item.shortCode}/`,
      publishedAt: new Date(item.timestamp || item.timestampParsed || Date.now()),
      contentText: item.caption || '',
      contentType,
      likes: item.likesCount || 0,
      commentsCount: item.commentsCount || 0,
      shares: 0, // Instagram não expõe shares via API pública
      saves: 0, // Pode estar disponível em alguns casos
      views: item.videoViewCount || null,
      thumbnailUrl: item.displayUrl || item.thumbnailUrl || null,
      mediaUrls: item.images ? item.images.map((img: any) => img.url) : [],
      metadata: {
        shortCode: item.shortCode,
        ownerUsername: item.ownerUsername,
        ownerId: item.ownerId,
        locationName: item.locationName,
        hashtags: item.hashtags || [],
        mentions: item.mentions || [],
      },
    }
  }

  /**
   * Coleta comentários de um post (se disponível via Apify)
   */
  async collectComments(postExternalId: string): Promise<RawSocialComment[]> {
    // Nota: Apify pode não retornar comentários em todos os planos
    // Esta é uma implementação básica que pode precisar ser expandida
    // dependendo dos dados retornados pelo Apify
    
    // Por enquanto, retorna array vazio
    // Pode ser implementado se o Apify retornar comentários
    return []
  }

  /**
   * Testa a conexão com Apify
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.apify.com/v2/user', {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }
}

