# 🔧 Resolver Problemas do Banco de Dados

## 🚨 Problemas Comuns

### ❌ Problema 1: "Can't reach database server"

**Causas:**
- Projeto Supabase pausado (free tier pausa após 7 dias)
- `DATABASE_URL` incorreto no `.env`
- Firewall ou rede bloqueando

**Solução:**

1. **Verificar status do Supabase:**
   ```bash
   npm run fix:database
   ```

2. **Se estiver pausado:**
   - Acesse [Supabase Dashboard](https://app.supabase.com)
   - Procure por banner "Paused" ou "Inactive"
   - Clique em "Resume" ou "Restore"
   - Aguarde 1-2 minutos

3. **Verificar DATABASE_URL:**
   ```env
   # Formato correto:
   DATABASE_URL="postgresql://postgres:[SENHA]@db.lqxajuzldepodkxkepui.supabase.co:5432/postgres"
   
   # Se a senha tiver caracteres especiais, use URL encoding:
   # $ vira %24
   # @ vira %40
   # etc.
   ```

### ❌ Problema 2: "Tabela não encontrada"

**Causa:**
- Migrações não foram executadas
- Schema não foi criado

**Solução:**

```bash
cd nextjs_space

# 1. Gerar Prisma Client
npx prisma generate

# 2. Criar schema (escolha uma opção):

# Opção A - Desenvolvimento (mais rápido)
npx prisma db push

# Opção B - Produção (com histórico)
npx prisma migrate dev --name multi-platform
```

## 🔍 Script de Diagnóstico

Execute o script de diagnóstico:

```bash
cd nextjs_space
npm run fix:database
```

Este script:
- ✅ Verifica variáveis de ambiente
- ✅ Testa conexão com banco
- ✅ Verifica se tabelas existem
- ✅ Fornece comandos para resolver

## 📋 Checklist Completo

### Passo 1: Verificar Supabase

- [ ] Acesse [Supabase Dashboard](https://app.supabase.com)
- [ ] Verifique se projeto está ativo (não pausado)
- [ ] Se pausado, clique em "Resume"
- [ ] Aguarde 1-2 minutos

### Passo 2: Verificar .env

- [ ] Arquivo `.env` existe em `nextjs_space/`
- [ ] `DATABASE_URL` está configurado
- [ ] Senha está correta (com URL encoding se necessário)
- [ ] Formato: `postgresql://postgres:[SENHA]@db.xxx.supabase.co:5432/postgres`

### Passo 3: Executar Diagnóstico

```bash
cd nextjs_space
npm run fix:database
```

### Passo 4: Criar Schema

Se o diagnóstico indicar que faltam tabelas:

```bash
# Gerar Prisma Client
npx prisma generate

# Criar schema
npx prisma db push
```

### Passo 5: Testar

```bash
npm run test:multi-platform
```

## 🛠️ Comandos Rápidos

### Resolver Tudo de Uma Vez

```bash
cd C:\Ai-Studio\instagram_reputation_monitor\nextjs_space

# 1. Diagnóstico
npm run fix:database

# 2. Gerar Prisma Client
npx prisma generate

# 3. Criar schema
npx prisma db push

# 4. Testar
npm run test:multi-platform
```

## 💡 Dicas

### URL Encoding de Senhas

Se sua senha tem caracteres especiais:

| Caractere | URL Encoded |
|-----------|-------------|
| `$`       | `%24`       |
| `@`       | `%40`       |
| `#`       | `%23`       |
| `%`       | `%25`       |
| `&`       | `%26`       |
| `+`       | `%2B`       |
| `=`       | `%3D`       |
| `?`       | `%3F`       |

**Exemplo:**
```
Senha: Duda1211$
DATABASE_URL: postgresql://postgres:Duda1211%24@db.xxx.supabase.co:5432/postgres
```

### Verificar Conexão Manualmente

```bash
# Usando psql (se instalado)
psql "postgresql://postgres:[SENHA]@db.xxx.supabase.co:5432/postgres"

# Ou usando Prisma Studio
npx prisma studio
```

## 🆘 Ainda com Problemas?

1. **Execute o diagnóstico:**
   ```bash
   npm run fix:database
   ```

2. **Verifique os logs:**
   - O script mostra mensagens detalhadas
   - Siga as instruções específicas

3. **Verifique no Supabase:**
   - Database → Connection Pooling
   - Settings → Database
   - Verifique se há avisos ou erros

4. **Teste conexão direta:**
   ```bash
   npx prisma db pull
   ```

---

**Pronto para resolver? Execute:**

```bash
cd nextjs_space
npm run fix:database
```

