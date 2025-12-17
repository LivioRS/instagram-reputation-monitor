/**
 * Tipos para o sistema multi-plataforma de monitoramento social
 */

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  X = 'x',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  YOUTUBE = 'youtube',
}

export type RiskLevel = 'low' | 'medium' | 'high'
export type AlertStatus = 'pending' | 'reviewing' | 'resolved'
export type SentimentLabel = 'positive' | 'neutral' | 'negative'
export type ContentType = 'image' | 'video' | 'carousel' | 'text' | 'reel' | 'story'

/**
 * Dados brutos de um post coletado de uma plataforma
 */
export interface RawSocialPost {
  externalId: string
  postUrl: string
  publishedAt: Date
  contentText?: string
  contentType: ContentType
  
  // Métricas de engajamento
  likes: number
  commentsCount: number
  shares?: number
  saves?: number
  views?: number
  
  // Mídia
  thumbnailUrl?: string
  mediaUrls?: string[]
  
  // Metadados adicionais (específicos da plataforma)
  metadata?: Record<string, any>
}

/**
 * Dados brutos de um comentário coletado
 */
export interface RawSocialComment {
  externalId?: string
  authorUsername?: string
  authorDisplayName?: string
  isFromOwner?: boolean
  contentText: string
  postedAt: Date
  
  // Metadados adicionais
  metadata?: Record<string, any>
}

/**
 * Resultado da análise de sentimento e reputação
 */
export interface SentimentAnalysis {
  sentimentPositive: number // 0-100
  sentimentNeutro: number // 0-100
  sentimentNegative: number // 0-100
  reputationScore: number // 0-10
  riskLevel: RiskLevel
  mainTopics: string[]
  summary?: string
  alerts?: string
  recommendations: string[]
}

/**
 * Interface que todos os adapters devem implementar
 */
export interface SocialPlatformAdapter {
  platform: SocialPlatform
  
  /**
   * Coleta posts de um perfil
   */
  collectPosts(
    profileUsername: string,
    options?: {
      limit?: number
      since?: Date
      postUrl?: string // Para coleta de post específico
    }
  ): Promise<RawSocialPost[]>
  
  /**
   * Coleta comentários de um post
   */
  collectComments?(
    postExternalId: string,
    options?: {
      limit?: number
    }
  ): Promise<RawSocialComment[]>
  
  /**
   * Testa a conexão/configuração da plataforma
   */
  testConnection?(): Promise<boolean>
}

