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

  // 5. Teste do Adapter do Instagram (se token disponível)
  await runTest('Testar Adapter do Instagram', async () => {
    const apiToken = process.env.APIFY_API_TOKEN
    
    if (!apiToken) {
      logWarning('   APIFY_API_TOKEN não configurado - pulando teste de coleta')
      throw new Error('APIFY_API_TOKEN não configurado (teste opcional)')
    }
    
    const adapter = SocialService.getAdapter(Platform.INSTAGRAM, apiToken)
    
    // Testar conexão
    const connectionOk = await adapter.testConnection?.()
    
    if (!connectionOk) {
      throw new Error('Falha ao conectar com Apify')
    }
    
    logInfo('   ✅ Conexão com Apify OK')
    logWarning('   ⚠️  Teste de coleta real não executado (pode consumir créditos)')
    logInfo('   Para testar coleta completa, use: npm run test:collect')
  })

  // 6. Teste de Salvamento de Post (mock)
  await runTest('Salvar Post no Banco', async () => {
    const service = new SocialService()
    
    // Obter marca e perfil
    const brand = await service.getOrCreateBrand('PHX Instrumentos')
    const profile = await service.getOrCreateSocialProfile(
      brand.id,
      Platform.INSTAGRAM,
      'phxinstrumentos'
    )
    
    // Criar post mock
    const mockPost = {
      externalId: `test_${Date.now()}`,
      postUrl: 'https://www.instagram.com/p/test123/',
      publishedAt: new Date(),
      contentText: 'Post de teste do sistema multi-plataforma',
      contentType: 'image' as const,
      likes: 100,
      commentsCount: 10,
      shares: 5,
      saves: 20,
      views: undefined,
      thumbnailUrl: undefined,
    }
    
    // Salvar post
    const result = await service.savePost(
      profile.id,
      Platform.INSTAGRAM,
      mockPost
    )
    
    if (!result.id) {
      throw new Error('Post não foi salvo corretamente')
    }
    
    logInfo(`   Post salvo: ${result.id} (novo: ${result.isNew})`)
    
    // Verificar no banco
    const postInDb = await prisma.socialPost.findUnique({
      where: {
        platform_externalId: {
          platform: 'instagram',
          externalId: mockPost.externalId,
        },
      },
    })
    
    if (!postInDb) {
      throw new Error('Post não encontrado no banco')
    }
    
    logInfo(`   ✅ Post verificado no banco: ${postInDb.contentText?.substring(0, 30)}...`)
    
    // Limpar post de teste
    await prisma.socialPost.delete({
      where: { id: result.id },
    })
    logInfo('   🧹 Post de teste removido')
  })

  // 7. Teste de Enum SocialPlatform
  await runTest('Verificar Enum SocialPlatform', async () => {
    const platforms = Object.values(Platform)
    
    if (platforms.length === 0) {
      throw new Error('Nenhuma plataforma encontrada no enum')
    }
    
    logInfo(`   Plataformas disponíveis: ${platforms.join(', ')}`)
    
    // Verificar se instagram está presente
    if (!platforms.includes(Platform.INSTAGRAM)) {
      throw new Error('Plataforma Instagram não encontrada')
    }
    
    logInfo('   ✅ Enum SocialPlatform está correto')
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

