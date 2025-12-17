/**
 * Script Helper para Configuração do Supabase
 * Ajuda a validar e configurar a conexão com Supabase
 */

import * as dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '@prisma/client'

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando configuração do Supabase...\n')

  // Verificar DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.log('❌ DATABASE_URL não encontrado no arquivo .env\n')
    console.log('📝 Para configurar:')
    console.log('1. Acesse: https://supabase.com')
    console.log('2. Crie um projeto')
    console.log('3. Vá em Settings → Database')
    console.log('4. Copie a Connection string (URI)')
    console.log('5. Adicione no .env: DATABASE_URL="sua_string_aqui"')
    console.log('\n💡 Veja SETUP_SUPABASE.md para instruções detalhadas\n')
    process.exit(1)
  }

  // Verificar se é Supabase
  const isSupabase = databaseUrl.includes('supabase.co')

  if (!isSupabase) {
    console.log('⚠️  DATABASE_URL não parece ser do Supabase')
    console.log('   URL atual:', databaseUrl.replace(/:[^:@]+@/, ':****@'))
    console.log('   Continuando mesmo assim...\n')
  } else {
    console.log('✅ DATABASE_URL configurado (Supabase detectado)')
    console.log('   URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'))
    console.log('')
  }

  // Testar conexão
  console.log('🔌 Testando conexão com o banco...')
  try {
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso!\n')

    // Verificar se as tabelas existem
    console.log('📊 Verificando schema do banco...')
    try {
      await prisma.configuracao.findMany({ take: 1 })
      await prisma.profile.findMany({ take: 1 })
      await prisma.instagramPost.findMany({ take: 1 })
      await prisma.logColeta.findMany({ take: 1 })
      
      console.log('✅ Todas as tabelas estão criadas\n')
      
      // Contar registros
      const configs = await prisma.configuracao.count()
      const profiles = await prisma.profile.count()
      const posts = await prisma.instagramPost.count()
      
      console.log('📈 Estatísticas do banco:')
      console.log(`   • Configurações: ${configs}`)
      console.log(`   • Perfis: ${profiles}`)
      console.log(`   • Posts: ${posts}`)
      console.log('')
      
      if (configs === 0) {
        console.log('💡 Dica: Execute "npm run seed" para criar dados iniciais\n')
      }
      
    } catch (error) {
      console.log('⚠️  Tabelas não encontradas\n')
      console.log('📝 Execute as migrações:')
      console.log('   npx prisma migrate dev\n')
    }

  } catch (error) {
    console.log('❌ Erro ao conectar com o banco\n')
    
    if (error instanceof Error) {
      if (error.message.includes('password')) {
        console.log('🔐 Erro de autenticação:')
        console.log('   • Verifique se a senha está correta no DATABASE_URL')
        console.log('   • A senha deve substituir [YOUR-PASSWORD] na URL\n')
      } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
        console.log('🌐 Erro de conexão:')
        console.log('   • Verifique se o projeto Supabase está ativo')
        console.log('   • Verifique se a URL está correta')
        console.log('   • Verifique sua conexão com internet\n')
      } else {
        console.log('❌ Erro:', error.message)
        console.log('')
      }
    }
    
    console.log('💡 Veja SETUP_SUPABASE.md para instruções detalhadas\n')
    process.exit(1)
  }

  console.log('🎉 Configuração do Supabase está correta!')
  console.log('✅ Pronto para usar o sistema\n')
}

main()
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

