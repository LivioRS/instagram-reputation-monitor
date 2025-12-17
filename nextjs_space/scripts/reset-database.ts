import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🧹 Iniciando limpeza do banco de dados...');
  console.log('');

  try {
    // 1. Deletar todos os posts
    console.log('📝 Deletando todos os posts...');
    const deletedPosts = await prisma.instagramPost.deleteMany({});
    console.log(`✅ ${deletedPosts.count} posts deletados`);
    console.log('');

    // 2. Deletar todos os perfis
    console.log('👤 Deletando todos os perfis...');
    const deletedProfiles = await prisma.profile.deleteMany({});
    console.log(`✅ ${deletedProfiles.count} perfis deletados`);
    console.log('');

    // 3. Deletar logs de coleta
    console.log('📋 Deletando logs de coleta...');
    const deletedLogs = await prisma.logColeta.deleteMany({});
    console.log(`✅ ${deletedLogs.count} logs deletados`);
    console.log('');

    // 4. Criar perfil padrão limpo
    console.log('🆕 Criando perfil padrão...');
    
    // Pegar o username configurado (ou usar phxinstrumentos como padrão)
    const config = await prisma.configuracao.findUnique({
      where: { chave: 'instagram_username' }
    });
    
    const defaultUsername = config?.valor || 'phxinstrumentos';
    
    const newProfile = await prisma.profile.create({
      data: {
        username: defaultUsername,
        displayName: defaultUsername,
        isActive: true,
        postsCount: 0
      }
    });
    
    console.log(`✅ Perfil padrão criado: @${newProfile.username}`);
    console.log('');

    // 5. Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`   • Posts deletados: ${deletedPosts.count}`);
    console.log(`   • Perfis deletados: ${deletedProfiles.count}`);
    console.log(`   • Logs deletados: ${deletedLogs.count}`);
    console.log(`   • Perfil ativo: @${newProfile.username}`);
    console.log('');
    console.log('✅ Configurações de API mantidas (Apify, Claude, Telegram)');
    console.log('✅ Banco de dados pronto para uso!');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase()
  .then(() => {
    console.log('✨ Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Falha ao executar script:', error);
    process.exit(1);
  });
