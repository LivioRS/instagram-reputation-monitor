import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🚀 Iniciando migração para sistema de perfis...')
    
    // 1. Adicionar coluna username na tabela instagram_posts (se não existir)
    console.log('📝 Verificando estrutura do banco...')
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'instagram_posts' AND column_name = 'username'
        ) THEN
          ALTER TABLE instagram_posts ADD COLUMN username VARCHAR(255) DEFAULT 'phxinstrumentos';
          CREATE INDEX IF NOT EXISTS "instagram_posts_username_idx" ON "instagram_posts"("username");
        END IF;
      END $$;
    `)
    console.log('✅ Coluna username adicionada/verificada')

    // 2. Criar tabela profiles (se não existir)
    console.log('📝 Criando tabela de perfis...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id" TEXT PRIMARY KEY,
        "username" TEXT UNIQUE NOT NULL,
        "display_name" TEXT,
        "is_active" BOOLEAN DEFAULT false,
        "posts_count" INTEGER DEFAULT 0,
        "last_collect_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "profiles_is_active_idx" ON "profiles"("is_active");
    `)
    console.log('✅ Tabela profiles criada/verificada')

    // 3. Buscar username configurado
    const usernameConfig = await prisma.configuracao.findUnique({
      where: { chave: 'instagramUsername' }
    })
    const configuredUsername = usernameConfig?.valor || 'phxinstrumentos'
    console.log(`📌 Username configurado: @${configuredUsername}`)

    // 4. Atualizar posts existentes com o username configurado
    const postsCount = await prisma.instagramPost.count()
    if (postsCount > 0) {
      console.log(`📊 Atualizando ${postsCount} posts existentes...`)
      // Atualizar diretamente via SQL pois os posts antigos podem não ter o campo
      await prisma.$executeRawUnsafe(`
        UPDATE instagram_posts 
        SET username = '${configuredUsername}'
        WHERE username = 'phxinstrumentos' OR username = '' OR username IS NULL
      `)
      console.log('✅ Posts atualizados com username')
    }

    // 5. Criar perfil inicial ou atualizar existente
    console.log('👤 Criando/atualizando perfil inicial...')
    
    const existingProfile = await prisma.profile.findUnique({
      where: { username: configuredUsername }
    })

    if (!existingProfile) {
      await prisma.profile.create({
        data: {
          id: `profile_${Date.now()}`,
          username: configuredUsername,
          displayName: `@${configuredUsername}`,
          isActive: true,
          postsCount: postsCount,
          lastCollectAt: postsCount > 0 ? new Date() : null,
        }
      })
      console.log(`✅ Perfil @${configuredUsername} criado e ativado`)
    } else {
      await prisma.profile.update({
        where: { username: configuredUsername },
        data: {
          isActive: true,
          postsCount: postsCount,
        }
      })
      console.log(`✅ Perfil @${configuredUsername} atualizado e ativado`)
    }

    // 6. Desativar outros perfis (se houver)
    await prisma.profile.updateMany({
      where: {
        username: { not: configuredUsername }
      },
      data: {
        isActive: false
      }
    })

    console.log('\n🎉 Migração concluída com sucesso!')
    console.log(`\n📊 Resumo:`)
    console.log(`   • Posts: ${postsCount}`)
    console.log(`   • Perfil ativo: @${configuredUsername}`)
    console.log(`   • Sistema de múltiplos perfis: ATIVADO ✓`)
    
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
