import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Configurar método como Apify
    await prisma.configuracao.upsert({
      where: { chave: 'instagram_metodo' },
      update: { valor: 'apify' },
      create: {
        chave: 'instagram_metodo',
        valor: 'apify',
        tipo: 'string',
        categoria: 'instagram',
        descricao: 'Método de coleta: apify ou graph_api'
      }
    });

    // Configurar API Token do Apify
    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken) {
      throw new Error('APIFY_API_TOKEN não encontrado nas variáveis de ambiente. Configure no arquivo .env');
    }

    await prisma.configuracao.upsert({
      where: { chave: 'apify_api_token' },
      update: { valor: apifyToken },
      create: {
        chave: 'apify_api_token',
        valor: apifyToken,
        tipo: 'string',
        categoria: 'instagram',
        descricao: 'API Token do Apify'
      }
    });

    // Configurar username do Instagram (exemplo - você pode mudar depois)
    await prisma.configuracao.upsert({
      where: { chave: 'instagram_username' },
      update: {},
      create: {
        chave: 'instagram_username',
        valor: 'phxinstrumentos',
        tipo: 'string',
        categoria: 'instagram',
        descricao: 'Username do Instagram para monitorar'
      }
    });

    console.log('✅ API key do Apify configurada com sucesso!');
    console.log('✅ Método de coleta: Apify');
    console.log('✅ Username padrão: phxinstrumentos (você pode alterar em /configuracoes)');
  } catch (error) {
    console.error('❌ Erro ao configurar:', error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
