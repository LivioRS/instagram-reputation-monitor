/**
 * Script de Diagnóstico e Correção do Banco de Dados
 * Resolve problemas comuns de conexão e schema
 */

import prisma from '../lib/db'
import * as dotenv from 'dotenv'
import path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') })

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

async function checkDatabaseConnection(): Promise<boolean> {
  logInfo('\n🔌 Verificando conexão com o banco de dados...')
  
  try {
    await prisma.$connect()
    logSuccess('Conexão estabelecida com sucesso!')
    
    // Testar uma query simples
    await prisma.$queryRaw`SELECT 1`
    logSuccess('Query de teste executada com sucesso!')
    
    return true
  } catch (error: any) {
    logError('Falha ao conectar com o banco de dados')
    
    if (error.message?.includes("Can't reach database server")) {
      logWarning('\n💡 Possíveis causas:')
      logWarning('   1. Projeto Supabase está pausado (free tier pausa após 7 dias)')
      logWarning('   2. DATABASE_URL incorreto no arquivo .env')
      logWarning('   3. Firewall ou rede bloqueando a conexão')
      logWarning('\n🔧 Soluções:')
      logWarning('   1. Acesse o Supabase Dashboard')
      logWarning('   2. Verifique se há um banner "Paused" ou "Inactive"')
      logWarning('   3. Clique em "Resume" ou "Restore" para reativar')
      logWarning('   4. Aguarde 1-2 minutos e tente novamente')
    } else if (error.message?.includes('authentication failed')) {
      logWarning('\n💡 Problema de autenticação')
      logWarning('   Verifique se a senha no DATABASE_URL está correta')
      logWarning('   Lembre-se: caracteres especiais precisam ser URL-encoded')
      logWarning('   Exemplo: $ vira %24')
    } else {
      logWarning(`\n💡 Erro: ${error.message}`)
    }
    
    return false
  }
}

async function checkSchema(): Promise<boolean> {
  logInfo('\n📊 Verificando schema do banco de dados...')
  
  const requiredTables = [
    'brand',
    'socialProfile',
    'socialPost',
    'socialComment',
    'reputationSnapshot',
    'configuracao',
    'logColeta',
  ]
  
  const missingTables: string[] = []
  
  for (const table of requiredTables) {
    try {
      await (prisma as any)[table].findFirst({ take: 1 })
      logSuccess(`Tabela '${table}' existe`)
    } catch (error: any) {
      if (error.message?.includes('does not exist') || error.message?.includes('Unknown table')) {
        missingTables.push(table)
        logError(`Tabela '${table}' não encontrada`)
      } else {
        logWarning(`Erro ao verificar '${table}': ${error.message}`)
      }
    }
  }
  
  if (missingTables.length > 0) {
    logWarning(`\n⚠️  ${missingTables.length} tabela(s) faltando: ${missingTables.join(', ')}`)
    logWarning('\n🔧 Execute as migrações:')
    logWarning('   npx prisma migrate dev --name multi-platform')
    logWarning('   OU')
    logWarning('   npx prisma db push')
    return false
  }
  
  logSuccess('Todas as tabelas necessárias existem!')
  return true
}

async function checkEnvironmentVariables(): Promise<boolean> {
  logInfo('\n🔐 Verificando variáveis de ambiente...')
  
  const required = ['DATABASE_URL']
  const optional = ['APIFY_API_TOKEN', 'ABACUSAI_API_KEY', 'TELEGRAM_BOT_TOKEN']
  
  const missing: string[] = []
  const optionalMissing: string[] = []
  
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName)
      logError(`${varName} não configurado`)
    } else {
      // Mascarar senha na URL
      const masked = process.env[varName]!.replace(/:[^:@]+@/, ':****@')
      logSuccess(`${varName} configurado: ${masked.substring(0, 50)}...`)
    }
  }
  
  for (const varName of optional) {
    if (!process.env[varName]) {
      optionalMissing.push(varName)
      logWarning(`${varName} não configurado (opcional)`)
    } else {
      logSuccess(`${varName} configurado`)
    }
  }
  
  if (missing.length > 0) {
    logError(`\n❌ Variáveis obrigatórias faltando: ${missing.join(', ')}`)
    logWarning('   Configure no arquivo .env')
    return false
  }
  
  if (optionalMissing.length > 0) {
    logWarning(`\n⚠️  Variáveis opcionais não configuradas: ${optionalMissing.join(', ')}`)
    logWarning('   Essas são necessárias para funcionalidades específicas')
  }
  
  return true
}

async function suggestFix(): Promise<void> {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log('🔧 COMANDOS PARA RESOLVER', 'blue')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')
  
  log('Execute os seguintes comandos na ordem:\n', 'cyan')
  
  log('1️⃣  Gerar Prisma Client:', 'yellow')
  log('   npx prisma generate\n', 'reset')
  
  log('2️⃣  Criar/Atualizar Schema (escolha uma opção):', 'yellow')
  log('   Opção A - Para desenvolvimento (mais rápido):', 'cyan')
  log('   npx prisma db push\n', 'reset')
  log('   Opção B - Para produção (com histórico):', 'cyan')
  log('   npx prisma migrate dev --name multi-platform\n', 'reset')
  
  log('3️⃣  Verificar novamente:', 'yellow')
  log('   npm run test:multi-platform\n', 'reset')
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')
}

async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log('🔍 DIAGNÓSTICO DO BANCO DE DADOS', 'blue')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')
  
  // 1. Verificar variáveis de ambiente
  const envOk = await checkEnvironmentVariables()
  
  if (!envOk) {
    logError('\n❌ Configure as variáveis de ambiente primeiro!')
    await prisma.$disconnect()
    process.exit(1)
  }
  
  // 2. Verificar conexão
  const connectionOk = await checkDatabaseConnection()
  
  if (!connectionOk) {
    logError('\n❌ Não foi possível conectar ao banco de dados')
    logWarning('\n💡 Ações necessárias:')
    logWarning('   1. Verifique se o projeto Supabase está ativo')
    logWarning('   2. Verifique a DATABASE_URL no .env')
    logWarning('   3. Se estiver pausado, reative no dashboard do Supabase')
    await suggestFix()
    await prisma.$disconnect()
    process.exit(1)
  }
  
  // 3. Verificar schema
  const schemaOk = await checkSchema()
  
  // Resumo
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue')
  log('📊 RESUMO', 'blue')
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')
  
  if (connectionOk && schemaOk) {
    logSuccess('✅ Banco de dados está configurado corretamente!')
    logSuccess('✅ Todas as tabelas existem!')
    logSuccess('\n🎉 Sistema pronto para uso!')
    log('\n💡 Execute os testes:', 'cyan')
    log('   npm run test:multi-platform\n', 'reset')
  } else if (connectionOk && !schemaOk) {
    logWarning('⚠️  Conexão OK, mas schema precisa ser criado')
    await suggestFix()
  } else {
    logError('❌ Problemas encontrados. Siga as instruções acima.')
  }
  
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue')
  
  await prisma.$disconnect()
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

