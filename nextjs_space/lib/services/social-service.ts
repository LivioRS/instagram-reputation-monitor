/**
 * Serviço principal para gerenciar posts e perfis sociais
 * Usa os adapters para coletar dados e salva no banco usando o novo modelo
 */

import prisma from '@/lib/db'
import { SocialPlatformAdapter, RawSocialPost, SentimentAnalysis, SocialPlatform, RiskLevel } from '@/lib/types/social'
import { InstagramAdapter } from './adapters/instagram-adapter'

export class SocialService {
  /**
   * Obtém ou cria uma marca
   */
  async getOrCreateBrand(name: string, slug?: string): Promise<{ id: string }> {
    const brandSlug = slug || name.toLowerCase().replace(/\s+/g, '-')
    
    const brand = await prisma.brand.upsert({
      where: { slug: brandSlug },
      update: { name },
      create: {
        name,
        slug: brandSlug,
      },
    })

    return { id: brand.id }
  }

  /**
   * Obtém ou cria um perfil social
   */
  async getOrCreateSocialProfile(
    brandId: string,
    platform: SocialPlatform,
    username: string,
    options?: {
      displayName?: string
      externalId?: string
      url?: string
      isCompetitor?: boolean
    }
  ): Promise<{ id: string }> {
    // Limpar username (remover @ se tiver)
    const cleanUsername = username.replace('@', '').trim().toLowerCase()

    // Buscar perfil existente
    const existing = await prisma.socialProfile.findFirst({
      where: {
        platform,
        username: cleanUsername,
      },
    })

    if (existing) {
      const updated = await prisma.socialProfile.update({
        where: { id: existing.id },
        data: {
          displayName: options?.displayName || existing.displayName,
          externalId: options?.externalId || existing.externalId,
          url: options?.url || existing.url,
          isCompetitor: options?.isCompetitor ?? existing.isCompetitor,
        },
      })
      return { id: updated.id }
    }

    const profile = await prisma.socialProfile.create({
      data: {
        brandId,
        platform,
        username: cleanUsername,
        displayName: options?.displayName || `@${cleanUsername}`,
        externalId: options?.externalId,
        url: options?.url || this.getDefaultUrl(platform, cleanUsername),
        isCompetitor: options?.isCompetitor || false,
        isActive: true,
      },
    })

    return { id: profile.id }
  }

  /**
   * Salva um post coletado no banco
   */
  async savePost(
    profileId: string,
    platform: SocialPlatform,
    rawPost: RawSocialPost,
    analysis?: SentimentAnalysis
  ): Promise<{ id: string; isNew: boolean }> {
    // Verificar se já existe
    const existing = await prisma.socialPost.findUnique({
      where: {
        platform_externalId: {
          platform,
          externalId: rawPost.externalId,
        },
      },
    })

    if (existing) {
      // Atualizar post existente
      const updated = await prisma.socialPost.update({
        where: { id: existing.id },
        data: {
          contentText: rawPost.contentText,
          likes: rawPost.likes,
          commentsCount: rawPost.commentsCount,
          shares: rawPost.shares || 0,
          saves: rawPost.saves || 0,
          views: rawPost.views,
          thumbnailUrl: rawPost.thumbnailUrl,
          // Atualizar análise se fornecida
          ...(analysis && {
            sentimentPositive: analysis.sentimentPositive,
            sentimentNeutro: analysis.sentimentNeutro,
            sentimentNegative: analysis.sentimentNegative,
            reputationScore: analysis.reputationScore,
            riskLevel: this.mapRiskLevel(analysis.riskLevel),
            mainTopics: analysis.mainTopics,
            summary: analysis.summary,
            alerts: analysis.alerts,
            recommendations: analysis.recommendations,
          }),
        },
      })

      return { id: updated.id, isNew: false }
    }

    // Criar novo post
    const newPost = await prisma.socialPost.create({
      data: {
        profileId,
        platform,
        externalId: rawPost.externalId,
        postUrl: rawPost.postUrl,
        publishedAt: rawPost.publishedAt,
        contentText: rawPost.contentText,
        contentType: rawPost.contentType,
        likes: rawPost.likes,
        commentsCount: rawPost.commentsCount,
        shares: rawPost.shares || 0,
        saves: rawPost.saves || 0,
        views: rawPost.views,
        thumbnailUrl: rawPost.thumbnailUrl,
        // Análise
        sentimentPositive: analysis?.sentimentPositive || 0,
        sentimentNeutro: analysis?.sentimentNeutro || 0,
        sentimentNegative: analysis?.sentimentNegative || 0,
        reputationScore: analysis?.reputationScore || 0,
        riskLevel: analysis ? this.mapRiskLevel(analysis.riskLevel) : 'low',
        mainTopics: analysis?.mainTopics || [],
        summary: analysis?.summary,
        alerts: analysis?.alerts,
        recommendations: analysis?.recommendations || [],
      },
    })

    return { id: newPost.id, isNew: true }
  }

  /**
   * Mapeia risk level do formato antigo para o novo
   */
  private mapRiskLevel(level: string): RiskLevel {
    const mapping: Record<string, RiskLevel> = {
      baixo: 'low',
      medio: 'medium',
      alto: 'high',
      low: 'low',
      medium: 'medium',
      high: 'high',
    }
    return mapping[level.toLowerCase()] || 'low'
  }

  /**
   * Gera URL padrão para uma plataforma
   */
  private getDefaultUrl(platform: SocialPlatform, username: string): string {
    const urls: Record<SocialPlatform, string> = {
      instagram: `https://www.instagram.com/${username}/`,
      x: `https://x.com/${username}`,
      facebook: `https://www.facebook.com/${username}`,
      linkedin: `https://www.linkedin.com/company/${username}/`,
      youtube: `https://www.youtube.com/@${username}`,
    }
    return urls[platform] || ''
  }

  /**
   * Obtém adapter para uma plataforma
   */
  static getAdapter(platform: SocialPlatform, apiToken?: string): SocialPlatformAdapter {
    switch (platform) {
      case SocialPlatform.INSTAGRAM:
        if (!apiToken) {
          throw new Error('API Token do Apify é necessário para Instagram')
        }
        return new InstagramAdapter(apiToken)
      
      // Adapters para outras plataformas podem ser adicionados aqui
      // case SocialPlatform.X:
      //   return new XAdapter(apiToken)
      
      default:
        throw new Error(`Adapter não implementado para plataforma: ${platform}`)
    }
  }
}

