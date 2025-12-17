# 🧪 Como Testar o Sistema Multi-Plataforma

## 📋 Pré-requisitos

Antes de testar, certifique-se de que:

1. ✅ Banco de dados está ativo e acessível
2. ✅ Migrações do Prisma foram executadas
3. ✅ Variáveis de ambiente configuradas (`.env`)

## 🚀 Testes Disponíveis

### 1. Teste Completo do Sistema (Recomendado)

Testa todas as funcionalidades do sistema multi-plataforma:

```bash
cd nextjs_space
npm run test:multi-platform
```

**O que é testado:**
- ✅ Conexão com banco de dados
- ✅ Schema do banco (todas as tabelas)
- ✅ Criação/obtenção de marca
- ✅ Criação/obtenção de perfil social
- ✅ Adapter do Instagram (conexão)
- ✅ Salvamento de posts
- ✅ Enum SocialPlatform

**Exemplo de saída:**
```
🚀 TESTE DO SISTEMA MULTI-PLATAFORMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 Testando: Conexão com Banco de Dados
✅ Conexão com Banco de Dados - PASSOU

🧪 Testando: Verificar Schema do Banco
✅ Verificar Schema do Banco - PASSOU

📊 RESUMO DOS TESTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passou: 7/7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Todos os testes passaram!
```

### 2. Teste do Sistema Antigo (Compatibilidade)

Testa o sistema antigo (ainda disponível):

```bash
npm run test:system
```

### 3. Teste de API

Testa as rotas da API:

```bash
npm run test:api
```

## 🔧 Testes Manuais

### Teste 1: Verificar Conexão com Banco

```bash
cd nextjs_space
npm run setup:supabase
```

### Teste 2: Criar Marca e Perfil Manualmente

Crie um arquivo `test-manual.ts`:

```typescript
import { SocialService } from './lib/services/social-service'
import { SocialPlatform } from './lib/types/social'

async function test() {
  const service = new SocialService()
  
  // Criar marca
  const brand = await service.getOrCreateBrand('PHX Instrumentos')
  console.log('Marca:', brand)
  
  // Criar perfil
  const profile = await service.getOrCreateSocialProfile(
    brand.id,
    SocialPlatform.INSTAGRAM,
    'phxinstrumentos'
  )
  console.log('Perfil:', profile)
}

test()
```

Execute:
```bash
npx tsx --require dotenv/config test-manual.ts
```

### Teste 3: Testar Adapter do Instagram

Crie um arquivo `test-adapter.ts`:

```typescript
import { SocialService } from './lib/services/social-service'
import { SocialPlatform } from './lib/types/social'

async function testAdapter() {
  const apiToken = process.env.APIFY_API_TOKEN
  
  if (!apiToken) {
    console.error('APIFY_API_TOKEN não configurado')
    return
  }
  
  const adapter = SocialService.getAdapter(SocialPlatform.INSTAGRAM, apiToken)
  
  // Testar conexão
  const connected = await adapter.testConnection?.()
  console.log('Conexão:', connected ? '✅ OK' : '❌ Falhou')
  
  // Coletar posts (cuidado: consome créditos do Apify)
  // const posts = await adapter.collectPosts('phxinstrumentos', { limit: 5 })
  // console.log('Posts coletados:', posts.length)
}

testAdapter()
```

Execute:
```bash
npx tsx --require dotenv/config test-adapter.ts
```

## 📝 Checklist de Testes

### Antes de Rodar os Testes

- [ ] Banco de dados está ativo
- [ ] `.env` configurado com `DATABASE_URL`
- [ ] Migrações executadas: `npx prisma migrate dev`
- [ ] Prisma Client gerado: `npx prisma generate`

### Testes Básicos

- [ ] `npm run test:multi-platform` - Todos passam
- [ ] `npm run setup:supabase` - Conexão OK
- [ ] Verificar tabelas no banco

### Testes Opcionais

- [ ] `APIFY_API_TOKEN` configurado (para testar adapter)
- [ ] `ABACUSAI_API_KEY` configurado (para análise)
- [ ] `TELEGRAM_BOT_TOKEN` configurado (para alertas)

## 🐛 Troubleshooting

### Erro: "Tabela não encontrada"

**Solução:**
```bash
cd nextjs_space
npx prisma migrate dev --name multi-platform
npx prisma generate
```

### Erro: "Can't reach database server"

**Solução:**
1. Verifique se o Supabase está ativo (não pausado)
2. Verifique a `DATABASE_URL` no `.env`
3. Teste a conexão: `npm run setup:supabase`

### Erro: "APIFY_API_TOKEN não configurado"

**Solução:**
- Este é um teste opcional
- Adicione `APIFY_API_TOKEN` no `.env` se quiser testar o adapter
- Ou ignore este teste (não é obrigatório)

### Erro: "Prisma Client não inicializado"

**Solução:**
```bash
npx prisma generate
```

## 📊 Interpretando os Resultados

### ✅ Todos os Testes Passaram

Sistema está funcionando corretamente! Você pode:
- Usar o sistema normalmente
- Coletar posts
- Analisar sentimentos
- Gerar alertas

### ⚠️ Alguns Testes Falharam

1. **Leia a mensagem de erro** - geralmente indica o problema
2. **Siga as dicas** - o script fornece comandos para corrigir
3. **Verifique os pré-requisitos** - banco ativo, migrações, etc.

### ⏭️ Testes Pulados

Testes marcados como "pulados" são opcionais:
- Não bloqueiam o funcionamento do sistema
- Podem ser configurados depois
- Geralmente são integrações externas (Apify, Abacus AI, etc.)

## 🎯 Próximos Passos Após os Testes

1. **Se todos passaram:**
   - ✅ Sistema pronto para uso
   - ✅ Pode começar a coletar posts
   - ✅ Pode configurar integrações opcionais

2. **Se alguns falharam:**
   - 🔧 Corrija os erros indicados
   - 🔄 Execute os testes novamente
   - 📖 Consulte a documentação específica

## 💡 Dicas

- Execute os testes sempre após mudanças no código
- Use `npm run test:multi-platform` antes de fazer deploy
- Mantenha o banco de dados atualizado com as migrações
- Configure as variáveis de ambiente antes de testar integrações

---

**Pronto para testar? Execute:**

```bash
cd nextjs_space
npm run test:multi-platform
```

