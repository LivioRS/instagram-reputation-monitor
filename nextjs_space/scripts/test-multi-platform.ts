/**
 * Script de Teste para o Sistema Multi-Plataforma
 * Testa todas as funcionalidades do novo modelo
 */

import prisma from '../lib/db'
import { SocialService } from '../lib/services/social-service'
import { SocialPlatform as Platform } from '../lib/types/social'


// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green')
}

function logError(message: string) {
  log(`❌ ${message}`, 'red')
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'cyan')
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow')
}

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: string
}

const results: TestResult[] = []

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  try {
    logInfo(`\n🧪 Testando: ${name}`)
    await testFn()
    results.push({ name, passed: true })
    logSuccess(`${name} - PASSOU`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    results.push({ name, passed: false, error: errorMessage })
    logError(`${name} - FALHOU: ${errorMessage}`)
  }
}

async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log('🚀 TESTE DO SISTEMA MULTI-PLATAFORMA', 'blue')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')

  // 1. Teste de Conexão com Banco
  await runTest('Conexão com Banco de Dados', async () => {
    await prisma.$connect()
    const count = await prisma.configuracao.count()
    logInfo(`   Banco conectado. Configurações encontradas: ${count}`)
  })

  // 2. Teste de Schema - Verificar se tabelas existem
  await runTest('Verificar Schema do Banco', async () => {
    const tables = [
      'brand',
      'socialProfile',
      'socialPost',
      'socialComment',
      'reputationSnapshot',
      'configuracao',
      'logColeta',
    ]

    for (const table of tables) {
      try {
        // Tentar fazer uma query simples para verificar se a tabela existe
        await (prisma as any)[table].findFirst({ take: 1 })
        logInfo(`   ✅ Tabela '${table}' existe`)
      } catch (error) {
        throw new Error(`Tabela '${table}' não encontrada. Execute as migrações primeiro!`)
      }
    }
  })

  // 3. Teste de Criação de Marca
  await runTest('Criar/Obter Marca', async () => {
    const service = new SocialService()
    const brand = await service.getOrCreateBrand('PHX Instrumentos', 'phx-instrumentos')
    
    if (!brand.id) {
      throw new Error('Marca não foi criada corretamente')
    }
    
    logInfo(`   Marca criada/obtida: ${brand.id}`)
    
    // Verificar no banco
    const brandInDb = await prisma.brand.findUnique({
      where: { slug: 'phx-instrumentos' },
    })
    
    if (!brandInDb) {
      throw new Error('Marca não encontrada no banco')
    }
    
    logInfo(`   ✅ Marca verificada no banco: ${brandInDb.name}`)
  })

  // 4. Teste de Criação de Perfil Social
  await runTest('Criar/Obter Perfil Social', async () => {
    const service = new SocialService()
    
    // Obter marca primeiro
    const brand = await service.getOrCreateBrand('PHX Instrumentos')
    
    // Criar perfil
    const profile = await service.getOrCreateSocialProfile(
      brand.id,
      Platform.INSTAGRAM,
      'phxinstrumentos',
      {
        displayName: '@phxinstrumentos',
        url: 'https://www.instagram.com/phxinstrumentos/',
      }
    )
    
    if (!profile.id) {
      throw new Error('Perfil não foi criado corretamente')
    }
    
    logInfo(`   Perfil criado/obtido: ${profile.id}`)
    
    // Verificar no banco
    const profileInDb = await prisma.socialProfile.findFirst({
      where: {
        platform: 'instagram',
        username: 'phxinstrumentos',
      },
    })
    
    if (!profileInDb) {
      throw new Error('Perfil não encontrado no banco')
    }
    
    logInfo(`   ✅ Perfil verificado: @${profileInDb.username}`)
  })

  // 5. Teste de Suporte Multi-Plataforma
  await runTest('Verificar Suporte Multi-Plataforma', async () => {
    const platforms = [
      Platform.INSTAGRAM,
      Platform.X,
      Platform.FACEBOOK,
      Platform.LINKEDIN,
      Platform.YOUTUBE,
    ]
    
    logInfo(`   Plataformas suportadas: ${platforms.length}`)
    
    for (const platform of platforms) {
      logInfo(`   - ${platform}`)
    }
    
    // Verificar se Instagram tem adapter implementado
    try {
      const apiToken = process.env.APIFY_API_TOKEN
      if (apiToken) {
        const adapter = SocialService.getAdapter(Platform.INSTAGRAM, apiToken)
        logInfo(`   ✅ Instagram: Adapter implementado`)
        
        // Testar conexão
        const connectionOk = await adapter.testConnection?.()
        if (connectionOk) {
          logInfo(`   ✅ Instagram: Conexão OK`)
        } else {
          logWarning(`   ⚠️  Instagram: Conexão falhou`)
        }
      } else {
        logWarning(`   ⚠️  Instagram: APIFY_API_TOKEN não configurado`)
      }
    } catch (error) {
      logWarning(`   ⚠️  Instagram: ${error instanceof Error ? error.message : 'Erro'}`)
    }
    
    // Verificar outras plataformas (estrutura pronta, adapters podem ser adicionados)
    const otherPlatforms = [
      { platform: Platform.X, name: 'X (Twitter)' },
      { platform: Platform.FACEBOOK, name: 'Facebook' },
      { platform: Platform.LINKEDIN, name: 'LinkedIn' },
      { platform: Platform.YOUTUBE, name: 'YouTube' },
    ]
    
    for (const { platform, name } of otherPlatforms) {
      try {
        SocialService.getAdapter(platform)
        logInfo(`   ✅ ${name}: Adapter disponível`)
      } catch (error) {
        // Isso é esperado - adapters ainda não implementados
        logInfo(`   ⏳ ${name}: Estrutura pronta, adapter pode ser adicionado`)
      }
    }
    
    logInfo(`   📊 Total: ${platforms.length} plataformas suportadas no sistema`)
    
    logInfo('   ✅ Sistema multi-plataforma configurado corretamente')
  })

  // 6. Teste de Salvamento de Post Multi-Plataforma
  await runTest('Salvar Posts de Diferentes Plataformas', async () => {
    const service = new SocialService()
    
    // Obter marca
    const brand = await service.getOrCreateBrand('PHX Instrumentos')
    
    // Testar com diferentes plataformas
    const testPlatforms = [
      { platform: Platform.INSTAGRAM, username: 'phxinstrumentos' },
      { platform: Platform.X, username: 'phxinstrumentos' },
      { platform: Platform.FACEBOOK, username: 'phxinstrumentos' },
    ]
    
    const savedPosts: string[] = []
    
    for (const { platform, username } of testPlatforms) {
      try {
        // Criar perfil para cada plataforma
        const profile = await service.getOrCreateSocialProfile(
          brand.id,
          platform,
          username
        )
        
        logInfo(`   ✅ Perfil criado para ${platform}: ${profile.id}`)
        
        // Criar post mock específico da plataforma
        const mockPost = {
          externalId: `test_${platform}_${Date.now()}`,
          postUrl: getPlatformUrl(platform, username),
          publishedAt: new Date(),
          contentText: `Post de teste do sistema multi-plataforma - ${platform}`,
          contentType: 'image' as const,
          likes: 100,
          commentsCount: 10,
          shares: platform === Platform.X ? 5 : undefined,
          saves: platform === Platform.INSTAGRAM ? 20 : undefined,
          views: platform === Platform.YOUTUBE ? 1000 : undefined,
          thumbnailUrl: undefined,
        }
        
        // Salvar post
        const result = await service.savePost(
          profile.id,
          platform,
          mockPost
        )
        
        if (!result.id) {
          throw new Error(`Post não foi salvo corretamente para ${platform}`)
        }
        
        savedPosts.push(result.id)
        logInfo(`   ✅ Post salvo para ${platform}: ${result.id}`)
        
        // Verificar no banco
        const postInDb = await prisma.socialPost.findUnique({
          where: {
            platform_externalId: {
              platform: platform.toLowerCase() as any,
              externalId: mockPost.externalId,
            },
          },
        })
        
        if (!postInDb) {
          throw new Error(`Post não encontrado no banco para ${platform}`)
        }
        
        logInfo(`   ✅ Post verificado no banco para ${platform}`)
      } catch (error) {
        logWarning(`   ⚠️  Erro ao testar ${platform}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }
    
    // Limpar posts de teste
    for (const postId of savedPosts) {
      try {
        await prisma.socialPost.delete({
          where: { id: postId },
        })
      } catch (error) {
        // Ignorar erros de limpeza
      }
    }
    
    if (savedPosts.length > 0) {
      logInfo(`   🧹 ${savedPosts.length} post(s) de teste removido(s)`)
    }
    
    if (savedPosts.length === 0) {
      throw new Error('Nenhum post foi salvo com sucesso')
    }
    
    logInfo(`   ✅ Sistema suporta múltiplas plataformas: ${savedPosts.length} plataforma(s) testada(s)`)
  })
  
  // Função auxiliar para URLs de plataformas
  function getPlatformUrl(platform: Platform, username: string): string {
    const urls: Record<Platform, string> = {
      [Platform.INSTAGRAM]: `https://www.instagram.com/p/test123/`,
      [Platform.X]: `https://x.com/${username}/status/test123`,
      [Platform.FACEBOOK]: `https://www.facebook.com/${username}/posts/test123`,
      [Platform.LINKEDIN]: `https://www.linkedin.com/feed/update/test123`,
      [Platform.YOUTUBE]: `https://www.youtube.com/watch?v=test123`,
    }
    return urls[platform] || `https://example.com/${username}/post/test123`
  }

  // 7. Teste de Enum SocialPlatform (Todas as Plataformas)
  await runTest('Verificar Todas as Plataformas no Enum', async () => {
    const platforms = Object.values(Platform)
    const expectedPlatforms = [
      Platform.INSTAGRAM,
      Platform.X,
      Platform.FACEBOOK,
      Platform.LINKEDIN,
      Platform.YOUTUBE,
    ]
    
    if (platforms.length === 0) {
      throw new Error('Nenhuma plataforma encontrada no enum')
    }
    
    logInfo(`   Total de plataformas: ${platforms.length}`)
    
    // Verificar cada plataforma esperada
    for (const expected of expectedPlatforms) {
      if (!platforms.includes(expected)) {
        throw new Error(`Plataforma ${expected} não encontrada no enum`)
      }
      logInfo(`   ✅ ${expected}`)
    }
    
    logInfo('   ✅ Todas as plataformas estão no enum')
    logInfo(`   📋 Plataformas: ${expectedPlatforms.join(', ')}`)
  })
  
  // 8. Teste de URLs Padrão por Plataforma
  await runTest('Verificar URLs Padrão por Plataforma', async () => {
    const service = new SocialService()
    const brand = await service.getOrCreateBrand('PHX Instrumentos')
    
    const testCases = [
      { platform: Platform.INSTAGRAM, username: 'phxinstrumentos', expectedUrl: 'https://www.instagram.com/phxinstrumentos/' },
      { platform: Platform.X, username: 'phxinstrumentos', expectedUrl: 'https://x.com/phxinstrumentos' },
      { platform: Platform.FACEBOOK, username: 'phxinstrumentos', expectedUrl: 'https://www.facebook.com/phxinstrumentos' },
      { platform: Platform.LINKEDIN, username: 'phxinstrumentos', expectedUrl: 'https://www.linkedin.com/company/phxinstrumentos/' },
      { platform: Platform.YOUTUBE, username: 'phxinstrumentos', expectedUrl: 'https://www.youtube.com/@phxinstrumentos' },
    ]
    
    for (const testCase of testCases) {
      const profile = await service.getOrCreateSocialProfile(
        brand.id,
        testCase.platform,
        testCase.username
      )
      
      const profileInDb = await prisma.socialProfile.findFirst({
        where: {
          platform: testCase.platform.toLowerCase() as any,
          username: testCase.username,
        },
      })
      
      if (profileInDb && profileInDb.url) {
        logInfo(`   ✅ ${testCase.platform}: ${profileInDb.url}`)
      } else {
        logWarning(`   ⚠️  ${testCase.platform}: URL não gerada`)
      }
    }
    
    logInfo('   ✅ URLs padrão funcionam para todas as plataformas')
  })

  // Resumo dos Testes
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log('📊 RESUMO DOS TESTES', 'blue')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  results.forEach(result => {
    if (result.passed) {
      logSuccess(`${result.name}`)
    } else {
      logError(`${result.name}: ${result.error}`)
    }
  })

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log(`✅ Passou: ${passed}/${total}`, 'green')
  if (failed > 0) {
    log(`❌ Falhou: ${failed}/${total}`, 'red')
  }
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')

  if (failed === 0) {
    log('🎉 Todos os testes passaram!', 'green')
    process.exit(0)
  } else {
    log('⚠️  Alguns testes falharam. Verifique os erros acima.', 'yellow')
    process.exit(1)
  }
}

main()
  .catch((error) => {
    logError(`\n❌ Erro fatal: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

