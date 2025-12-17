import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Atualizando quantidade padrão de coleta para 30...')
    
    // Atualizar ou criar a configuração
    await prisma.configuracao.upsert({
      where: { chave: 'coletaQuantidade' },
      update: {
        valor: '30',
        tipo: 'string',
      },
      create: {
        chave: 'coletaQuantidade',
        valor: '30',
        tipo: 'string',
      },
    })
    
    console.log('✅ Quantidade padrão atualizada para 30 posts com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao atualizar configuração:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
