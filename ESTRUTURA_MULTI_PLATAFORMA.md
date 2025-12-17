# 🎯 Estrutura Multi-Plataforma - Implementada

## ✅ O que foi criado

### 1. **Novo Schema do Prisma** (`schema.prisma`)

Modelos criados:
- ✅ **Brand** - Marcas/empresas
- ✅ **SocialProfile** - Perfis sociais (Instagram, X, Facebook, LinkedIn, YouTube)
- ✅ **SocialPost** - Posts de qualquer plataforma
- ✅ **SocialComment** - Comentários de qualquer plataforma
- ✅ **ReputationSnapshot** - Snapshots de reputação
- ✅ **Configuracao** - Mantido (expandido)
- ✅ **LogColeta** - Mantido (expandido com `plataforma` e `profileId`)
- ✅ **Profile** - Mantido para compatibilidade

### 2. **Estrutura de Services/Adapters**

```
lib/
├── services/
│   ├── adapters/
│   │   └── instagram-adapter.ts  ✅ Criado
│   └── social-service.ts         ✅ Criado
└── types/
    └── social.ts                 ✅ Criado
```

**Arquivos criados:**
- ✅ `lib/types/social.ts` - Tipos TypeScript e interfaces
- ✅ `lib/services/adapters/instagram-adapter.ts` - Adapter do Instagram
- ✅ `lib/services/social-service.ts` - Serviço principal

### 3. **Scripts de Migração**

- ✅ `scripts/migrate-to-multi-platform.ts` - Migra dados antigos

### 4. **Documentação**

- ✅ `MIGRACAO_MULTI_PLATAFORMA.md` - Guia completo
- ✅ `ESTRUTURA_MULTI_PLATAFORMA.md` - Este arquivo

---

## 🚀 Como Aplicar (Quando o banco estiver ativo)

### Passo 1: Verificar Conexão

```bash
cd nextjs_space
npm run setup:supabase
```

Se der erro de conexão:
- Verifique se o projeto Supabase está ativo (não pausado)
- Free tier pausa após inatividade - reative no dashboard

### Passo 2: Rodar Migrações

```bash
npx prisma migrate dev --name multi-platform
```

Isso cria todas as novas tabelas.

### Passo 3: Migrar Dados Antigos

```bash
npx tsx --require dotenv/config scripts/migrate-to-multi-platform.ts
```

Migra:
- Posts de `instagram_posts` → `social_posts`
- Cria marca padrão
- Cria perfil social

### Passo 4: Verificar

```bash
npm run setup:supabase
```

Deve mostrar:
- ✅ Marca criada
- ✅ Perfil criado
- ✅ Posts migrados

---

## 📝 Como Usar o Novo Sistema

### Exemplo: Coletar Posts do Instagram

```typescript
import { SocialService } from '@/lib/services/social-service'
import { SocialPlatform } from '@/lib/types/social'

// 1. Obter adapter
const adapter = SocialService.getAdapter(
  SocialPlatform.INSTAGRAM,
  process.env.APIFY_API_TOKEN
)

// 2. Coletar posts
const rawPosts = await adapter.collectPosts('phxinstrumentos', {
  limit: 30
})

// 3. Salvar no banco
const service = new SocialService()

// Obter/criar marca
const brand = await service.getOrCreateBrand('PHX Instrumentos')

// Obter/criar perfil
const profile = await service.getOrCreateSocialProfile(
  brand.id,
  SocialPlatform.INSTAGRAM,
  'phxinstrumentos'
)

// Salvar cada post
for (const rawPost of rawPosts) {
  // Analisar (usar API existente)
  const analysis = await analyzePost(rawPost)
  
  // Salvar
  await service.savePost(
    profile.id,
    SocialPlatform.INSTAGRAM,
    rawPost,
    analysis
  )
}
```

---

## 🔌 Adapter do Instagram

O `InstagramAdapter` implementa:

- ✅ `collectPosts()` - Coleta posts de um perfil ou post específico
- ✅ `collectComments()` - Coleta comentários (estrutura pronta)
- ✅ `testConnection()` - Testa conexão com Apify

**Uso:**
```typescript
const adapter = new InstagramAdapter(process.env.APIFY_API_TOKEN!)
const posts = await adapter.collectPosts('username', { limit: 10 })
```

---

## 🆕 Adicionar Nova Plataforma

Para adicionar X, Facebook, etc.:

1. **Criar adapter:**
   ```typescript
   // lib/services/adapters/x-adapter.ts
   export class XAdapter implements SocialPlatformAdapter {
     platform = SocialPlatform.X
     // Implementar métodos...
   }
   ```

2. **Registrar no SocialService.getAdapter()**

3. **Usar normalmente**

---

## ⚠️ Status Atual

- ✅ Schema atualizado
- ✅ Estrutura de código criada
- ✅ Adapter do Instagram implementado
- ✅ Script de migração criado
- ⏳ Migrações do banco (aguardando banco ativo)
- ⏳ Migração de dados (aguardando migrações)
- ⏳ Atualizar rotas da API (próximo passo)

---

## 📋 Próximos Passos

1. **Quando o banco estiver ativo:**
   - Rodar migrações
   - Migrar dados
   - Testar sistema

2. **Atualizar rotas da API:**
   - `/api/coleta` - Usar novo SocialService
   - `/api/posts` - Buscar de `social_posts`
   - `/api/alertas` - Buscar de `social_posts`
   - Dashboard - Usar novo modelo

3. **Adicionar outras plataformas:**
   - Criar adapters para X, Facebook, etc.

---

## 💡 Notas Importantes

- O modelo antigo (`InstagramPost`) ainda existe
- Dados antigos serão migrados automaticamente
- Novos posts usarão o modelo novo
- Sistema agora é extensível para múltiplas plataformas

---

**Tudo pronto para quando o banco estiver ativo!** 🚀

