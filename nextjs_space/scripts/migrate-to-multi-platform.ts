/**
 * Script de Migração: InstagramPost → SocialPost
 * Migra dados do modelo antigo para o novo modelo multi-plataforma
 */

import { PrismaClient, SocialPlatform } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Iniciando migração para modelo multi-plataforma...\n')

  try {
    // 1. Criar marca padrão (PHX Instrumentos)
    console.log('📦 Criando marca padrão...')
    const brand = await prisma.brand.upsert({
      where: { slug: 'phx-instrumentos' },
      update: {},
      create: {
        name: 'PHX Instrumentos',
        slug: 'phx-instrumentos',
        description: 'PHX Instrumentos',
      },
    })
    console.log(`✅ Marca criada: ${brand.name} (${brand.id})\n`)

    // 2. Buscar configuração de username do Instagram
    const usernameConfig = await prisma.configuracao.findUnique({
      where: { chave: 'instagramUsername' },
    })
    const instagramUsername = usernameConfig?.valor || 'phxinstrumentos'
    console.log(`📌 Username do Instagram: @${instagramUsername}\n`)

    // 3. Criar perfil social do Instagram
    console.log('👤 Criando perfil social do Instagram...')
    const socialProfile = await prisma.socialProfile.upsert({
      where: {
        platform_username: {
          platform: SocialPlatform.instagram,
          username: instagramUsername,
        },
      },
      update: {
        brandId: brand.id,
        isActive: true,
      },
      create: {
        brandId: brand.id,
        platform: SocialPlatform.instagram,
        username: instagramUsername,
        displayName: `@${instagramUsername}`,
        url: `https://www.instagram.com/${instagramUsername}/`,
        isActive: true,
        isCompetitor: false,
      },
    })
    console.log(`✅ Perfil criado: @${socialProfile.username} (${socialProfile.id})\n`)

    // 4. Contar posts antigos
    const oldPostsCount = await prisma.instagramPost.count()
    console.log(`📊 Posts antigos encontrados: ${oldPostsCount}\n`)

    if (oldPostsCount === 0) {
      console.log('✅ Nenhum post para migrar. Migração concluída!\n')
      return
    }

    // 5. Migrar posts
    console.log('📝 Migrando posts...')
    let migrated = 0
    let skipped = 0

    const oldPosts = await prisma.instagramPost.findMany({
      orderBy: { dataPublicacao: 'desc' },
    })

    for (const oldPost of oldPosts) {
      try {
        // Verificar se já existe
        const existing = await prisma.socialPost.findFirst({
          where: {
            platform: SocialPlatform.instagram,
            externalId: oldPost.postId,
          },
        })

        if (existing) {
          skipped++
          continue
        }

        // Mapear risk level
        const riskLevelMap: Record<string, string> = {
          baixo: 'low',
          medio: 'medium',
          alto: 'high',
        }
        const riskLevel = riskLevelMap[oldPost.nivelRisco.toLowerCase()] || 'low'

        // Criar novo post
        await prisma.socialPost.create({
          data: {
            profileId: socialProfile.id,
            platform: SocialPlatform.instagram,
            externalId: oldPost.postId,
            postUrl: oldPost.postUrl,
            publishedAt: oldPost.dataPublicacao,
            contentText: oldPost.legenda,
            contentType: oldPost.tipoConteudo === 'video' ? 'video' : oldPost.tipoConteudo === 'carousel' ? 'carousel' : 'image',
            likes: oldPost.curtidas,
            commentsCount: oldPost.comentarios,
            shares: oldPost.compartilhamentos || 0,
            saves: oldPost.saves || 0,
            sentimentPositive: oldPost.sentimentoPositivo,
            sentimentNeutro: oldPost.sentimentoNeutro,
            sentimentNegative: oldPost.sentimentoNegativo,
            reputationScore: oldPost.scoreReputacao,
            riskLevel: riskLevel as any,
            mainTopics: oldPost.temasPrincipais || [],
            summary: oldPost.resumo,
            alerts: oldPost.alertas,
            recommendations: oldPost.recomendacoes || [],
            thumbnailUrl: oldPost.thumbnailUrl,
            alertResolved: oldPost.alertaResolvido,
            alertStatus: oldPost.statusAlerta === 'resolvido' ? 'resolved' : oldPost.statusAlerta === 'em_analise' ? 'reviewing' : 'pending',
            notifiedN8n: oldPost.notificadoN8n,
            collectedAt: oldPost.coletadoEm,
          },
        })

        migrated++
        if (migrated % 10 === 0) {
          console.log(`   Migrados: ${migrated}/${oldPostsCount}...`)
        }
      } catch (error) {
        console.error(`   ❌ Erro ao migrar post ${oldPost.id}:`, error instanceof Error ? error.message : 'Erro desconhecido')
        skipped++
      }
    }

    console.log(`\n✅ Migração concluída!`)
    console.log(`   • Migrados: ${migrated}`)
    console.log(`   • Pulados: ${skipped}`)
    console.log(`   • Total: ${oldPostsCount}\n`)

    // 6. Atualizar contador de posts no perfil
    const newPostsCount = await prisma.socialPost.count({
      where: { profileId: socialProfile.id },
    })

    await prisma.socialProfile.update({
      where: { id: socialProfile.id },
      data: { postsCount: newPostsCount },
    })

    console.log(`📊 Perfil atualizado: ${newPostsCount} posts\n`)

    // 7. Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n📦 Marca: ${brand.name}`)
    console.log(`👤 Perfil: @${socialProfile.username}`)
    console.log(`📝 Posts migrados: ${migrated}`)
    console.log(`\n✅ Sistema agora usa o modelo multi-plataforma!`)
    console.log(`\n💡 Nota: A tabela 'instagram_posts' antiga ainda existe.`)
    console.log(`   Você pode deletá-la depois de verificar que tudo está funcionando.\n`)

  } catch (error) {
    console.error('\n❌ Erro na migração:', error)
    throw error
  }
}

main()
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

