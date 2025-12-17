# 🚀 Migração para Modelo Multi-Plataforma

## 📋 O que mudou?

O sistema foi migrado de um modelo específico para Instagram para um modelo **multi-plataforma** que suporta:
- ✅ Instagram
- ✅ X (Twitter)
- ✅ Facebook
- ✅ LinkedIn
- ✅ YouTube

## 🏗️ Nova Estrutura

### Modelos Principais

1. **Brand** - Marcas/empresas monitoradas
2. **SocialProfile** - Perfis sociais (Instagram, X, etc.)
3. **SocialPost** - Posts de qualquer plataforma
4. **SocialComment** - Comentários de qualquer plataforma
5. **ReputationSnapshot** - Snapshots de reputação por período

### Modelos Mantidos

- **Configuracao** - Configurações do sistema
- **LogColeta** - Logs de coletas (expandido com `plataforma` e `profileId`)
- **Profile** - Mantido para compatibilidade (pode ser deprecado)

## 🔄 Como Migrar

### Passo 1: Rodar Migrações do Prisma

```bash
cd nextjs_space
npx prisma migrate dev --name multi-platform
```

Isso vai:
- Criar novas tabelas (Brand, SocialProfile, SocialPost, etc.)
- Manter tabelas antigas (InstagramPost ainda existe)

### Passo 2: Migrar Dados Antigos

```bash
npx tsx --require dotenv/config scripts/migrate-to-multi-platform.ts
```

Este script:
- Cria marca padrão (PHX Instrumentos)
- Cria perfil social do Instagram
- Migra todos os posts de `InstagramPost` → `SocialPost`
- Preserva todos os dados (análises, sentimentos, etc.)

### Passo 3: Verificar Migração

```bash
npm run setup:supabase
```

Verifique se:
- ✅ Marca foi criada
- ✅ Perfil social foi criado
- ✅ Posts foram migrados

## 📁 Nova Estrutura de Código

```
lib/
├── services/
│   ├── adapters/
│   │   └── instagram-adapter.ts  # Adapter do Instagram
│   └── social-service.ts         # Serviço principal
└── types/
    └── social.ts                 # Tipos TypeScript
```

## 🔌 Como Usar os Adapters

### Exemplo: Coletar Posts do Instagram

**Em uma função async (recomendado para Next.js API Routes):**

```typescript
import { SocialService } from '@/lib/services/social-service'
import { SocialPlatform } from '@/lib/types/social'

async function coletarPosts() {
  // Obter adapter
  const adapter = SocialService.getAdapter(
    SocialPlatform.INSTAGRAM,
    process.env.APIFY_API_TOKEN
  )

  // Coletar posts
  const rawPosts = await adapter.collectPosts('phxinstrumentos', {
    limit: 30
  })

  // Salvar no banco
  const service = new SocialService()

  // 1. Obter/criar marca
  const brand = await service.getOrCreateBrand('PHX Instrumentos')

  // 2. Obter/criar perfil
  const profile = await service.getOrCreateSocialProfile(
    brand.id,
    SocialPlatform.INSTAGRAM,
    'phxinstrumentos'
  )

  // 3. Salvar posts
  for (const rawPost of rawPosts) {
    // Analisar sentimento (usar API existente)
    const analysis = await analyzePost(rawPost)
    
    // Salvar
    await service.savePost(profile.id, SocialPlatform.INSTAGRAM, rawPost, analysis)
  }

  return rawPosts
}

// Executar
coletarPosts().then(posts => console.log(`Coletados ${posts.length} posts`))
```

## 🆕 Adicionar Nova Plataforma

Para adicionar suporte a uma nova plataforma (ex: X/Twitter):

1. **Criar Adapter:**
   ```typescript
   // lib/services/adapters/x-adapter.ts
   export class XAdapter implements SocialPlatformAdapter {
     platform = SocialPlatform.X
     // Implementar métodos...
   }
   ```

2. **Registrar no SocialService:**
   ```typescript
   static getAdapter(platform: SocialPlatform, apiToken?: string) {
     switch (platform) {
       case SocialPlatform.X:
         return new XAdapter(apiToken)
       // ...
     }
   }
   ```

3. **Usar:**
   ```typescript
   const adapter = SocialService.getAdapter(SocialPlatform.X, token)
   const posts = await adapter.collectPosts('username')
   ```

## 📊 Compatibilidade

### Dados Antigos

- ✅ Tabela `instagram_posts` ainda existe
- ✅ Dados antigos foram migrados para `social_posts`
- ⚠️ Você pode deletar `instagram_posts` depois de verificar

### APIs Antigas

As rotas antigas (`/api/posts`, `/api/alertas`) ainda funcionam, mas agora:
- Buscam de `social_posts` ao invés de `instagram_posts`
- Filtram por `platform = 'instagram'`

## 🎯 Próximos Passos

1. ✅ Rodar migrações
2. ✅ Migrar dados
3. ⏳ Atualizar rotas da API para usar novo modelo
4. ⏳ Atualizar frontend (se necessário)
5. ⏳ Adicionar adapters para outras plataformas

## 📝 Notas

- O modelo antigo (`InstagramPost`) ainda existe para compatibilidade
- Todos os dados foram preservados na migração
- O sistema agora é extensível para múltiplas plataformas
- Novos posts serão salvos no modelo novo automaticamente

