/**
 * Script de Teste do Sistema Completo
 * Verifica todas as funcionalidades principais
 */

import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  message: string
  details?: any
}

const results: TestResult[] = []

function addResult(name: string, status: 'pass' | 'fail' | 'skip', message: string, details?: any) {
  results.push({ name, status, message, details })
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  console.log(`${icon} ${name}: ${message}`)
}

async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    addResult('Conexão com Banco de Dados', 'pass', 'Conexão estabelecida com sucesso')
    return true
  } catch (error) {
    addResult('Conexão com Banco de Dados', 'fail', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    return false
  }
}

async function testDatabaseSchema() {
  try {
    // Testar se as tabelas existem tentando fazer queries simples
    await prisma.configuracao.findMany({ take: 1 })
    await prisma.profile.findMany({ take: 1 })
    await prisma.instagramPost.findMany({ take: 1 })
    await prisma.logColeta.findMany({ take: 1 })
    
    addResult('Schema do Banco de Dados', 'pass', 'Todas as tabelas estão acessíveis')
    return true
  } catch (error) {
    addResult('Schema do Banco de Dados', 'fail', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, {
      hint: 'Execute: npx prisma migrate dev'
    })
    return false
  }
}

async function testEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
  ]
  
  const optionalVars = [
    'ABACUSAI_API_KEY',
    'APIFY_API_TOKEN',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'NEXTAUTH_URL',
  ]
  
  const missing: string[] = []
  const optionalMissing: string[] = []
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }
  
  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      optionalMissing.push(varName)
    }
  }
  
  if (missing.length > 0) {
    addResult('Variáveis de Ambiente (Obrigatórias)', 'fail', `Faltando: ${missing.join(', ')}`)
    return false
  }
  
  addResult('Variáveis de Ambiente (Obrigatórias)', 'pass', 'Todas as variáveis obrigatórias configuradas')
  
  if (optionalMissing.length > 0) {
    addResult('Variáveis de Ambiente (Opcionais)', 'skip', `Não configuradas: ${optionalMissing.join(', ')}`, {
      note: 'Essas variáveis são opcionais, mas necessárias para funcionalidades específicas'
    })
  } else {
    addResult('Variáveis de Ambiente (Opcionais)', 'pass', 'Todas as variáveis opcionais configuradas')
  }
  
  return true
}

async function testConfigurations() {
  try {
    const configs = await prisma.configuracao.findMany()
    
    if (configs.length === 0) {
      addResult('Configurações Iniciais', 'skip', 'Nenhuma configuração encontrada', {
        hint: 'Execute: npm run seed'
      })
      return false
    }
    
    const importantConfigs = ['empresaNome', 'instagramUsername', 'instagramMetodo']
    const found = configs.filter(c => importantConfigs.includes(c.chave))
    
    if (found.length < importantConfigs.length) {
      addResult('Configurações Iniciais', 'skip', `Faltando algumas configurações (${found.length}/${importantConfigs.length})`, {
        hint: 'Execute: npm run seed'
      })
    } else {
      addResult('Configurações Iniciais', 'pass', `${configs.length} configurações encontradas`)
    }
    
    return true
  } catch (error) {
    addResult('Configurações Iniciais', 'fail', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    return false
  }
}

async function testProfiles() {
  try {
    const profiles = await prisma.profile.findMany()
    
    if (profiles.length === 0) {
      addResult('Perfis', 'skip', 'Nenhum perfil encontrado', {
        hint: 'Crie um perfil via interface ou execute: npm run seed'
      })
    } else {
      const activeProfile = profiles.find(p => p.isActive)
      addResult('Perfis', 'pass', `${profiles.length} perfil(is) encontrado(s)`, {
        active: activeProfile ? activeProfile.username : 'nenhum ativo'
      })
    }
    
    return true
  } catch (error) {
    addResult('Perfis', 'fail', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    return false
  }
}

async function testExternalAPIs() {
  const tests = []
  
  // Testar Abacus AI
  if (process.env.ABACUSAI_API_KEY) {
    try {
      const response = await fetch('https://apps.abacus.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
        }
      })
      
      if (response.ok) {
        tests.push({ name: 'Abacus AI', status: 'pass', message: 'API Key válida' })
      } else {
        tests.push({ name: 'Abacus AI', status: 'fail', message: `API Key inválida (${response.status})` })
      }
    } catch (error) {
      tests.push({ name: 'Abacus AI', status: 'fail', message: `Erro ao conectar: ${error instanceof Error ? error.message : 'Erro desconhecido'}` })
    }
  } else {
    tests.push({ name: 'Abacus AI', status: 'skip', message: 'API Key não configurada' })
  }
  
  // Testar Apify
  if (process.env.APIFY_API_TOKEN) {
    try {
      const response = await fetch('https://api.apify.com/v2/user', {
        headers: {
          'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
        }
      })
      
      if (response.ok) {
        tests.push({ name: 'Apify', status: 'pass', message: 'Token válido' })
      } else {
        tests.push({ name: 'Apify', status: 'fail', message: `Token inválido (${response.status})` })
      }
    } catch (error) {
      tests.push({ name: 'Apify', status: 'fail', message: `Erro ao conectar: ${error instanceof Error ? error.message : 'Erro desconhecido'}` })
    }
  } else {
    tests.push({ name: 'Apify', status: 'skip', message: 'Token não configurado' })
  }
  
  // Testar Telegram
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`)
      
      if (response.ok) {
        tests.push({ name: 'Telegram', status: 'pass', message: 'Bot token válido' })
      } else {
        tests.push({ name: 'Telegram', status: 'fail', message: `Bot token inválido (${response.status})` })
      }
    } catch (error) {
      tests.push({ name: 'Telegram', status: 'fail', message: `Erro ao conectar: ${error instanceof Error ? error.message : 'Erro desconhecido'}` })
    }
  } else {
    tests.push({ name: 'Telegram', status: 'skip', message: 'Bot token ou Chat ID não configurados' })
  }
  
  tests.forEach(test => addResult(test.name, test.status, test.message))
  
  return tests.every(t => t.status === 'pass' || t.status === 'skip')
}

async function generateReport() {
  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const skipped = results.filter(r => r.status === 'skip').length
  const total = results.length
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 RELATÓRIO DE TESTES')
  console.log('='.repeat(60))
  console.log(`✅ Passou: ${passed}/${total}`)
  console.log(`❌ Falhou: ${failed}/${total}`)
  console.log(`⚠️  Pulado: ${skipped}/${total}`)
  console.log('='.repeat(60))
  
  if (failed > 0) {
    console.log('\n❌ TESTES QUE FALHARAM:')
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`\n  ${r.name}`)
      console.log(`  Mensagem: ${r.message}`)
      if (r.details?.hint) {
        console.log(`  💡 Dica: ${r.details.hint}`)
      }
    })
  }
  
  if (skipped > 0) {
    console.log('\n⚠️  TESTES PULADOS (Opcionais):')
    results.filter(r => r.status === 'skip').forEach(r => {
      console.log(`\n  ${r.name}`)
      console.log(`  Motivo: ${r.message}`)
      if (r.details?.hint) {
        console.log(`  💡 Dica: ${r.details.hint}`)
      }
    })
  }
  
  console.log('\n' + '='.repeat(60))
  
  if (failed === 0) {
    console.log('🎉 Todos os testes obrigatórios passaram!')
    console.log('✅ Sistema pronto para uso!')
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique os erros acima.')
    console.log('💡 Execute os comandos sugeridos para corrigir.')
  }
  
  console.log('='.repeat(60) + '\n')
}

async function main() {
  console.log('🧪 Iniciando testes do sistema...\n')
  
  // Testes básicos
  await testEnvironmentVariables()
  const dbConnected = await testDatabaseConnection()
  
  if (dbConnected) {
    await testDatabaseSchema()
    await testConfigurations()
    await testProfiles()
  }
  
  // Testes de integrações (não bloqueiam)
  await testExternalAPIs()
  
  // Gerar relatório
  await generateReport()
  
  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('❌ Erro fatal nos testes:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
