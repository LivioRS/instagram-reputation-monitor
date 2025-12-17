# 🗄️ Configuração do Banco de Dados - Supabase

## 📋 Passo a Passo Completo

### 1. Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em **"Start your project"** ou **"Sign up"**
3. Faça login com GitHub (recomendado) ou email
4. Clique em **"New Project"**

### 2. Criar Novo Projeto

1. **Nome do Projeto:** `instagram-reputation-monitor` (ou outro nome)
2. **Database Password:** Crie uma senha forte (ANOTE ELA!)
3. **Region:** Escolha a região mais próxima (ex: `South America (São Paulo)`)
4. **Pricing Plan:** Free (gratuito)
5. Clique em **"Create new project"**

⏱️ Aguarde 2-3 minutos enquanto o projeto é criado.

### 3. Obter String de Conexão

1. No dashboard do Supabase, vá em **Settings** → **Database**
2. Role até a seção **"Connection string"**
3. Selecione **"URI"** (não "Session mode")
4. Copie a string que aparece (formato: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
5. **Substitua `[YOUR-PASSWORD]`** pela senha que você criou

**Exemplo:**
```
postgresql://postgres:minhasenha123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### 4. Configurar no Projeto

1. Abra o arquivo `.env` em `nextjs_space/.env`
2. Adicione ou atualize a linha:
   ```env
   DATABASE_URL="postgresql://postgres:SUA_SENHA@db.xxxxx.supabase.co:5432/postgres"
   ```
3. **IMPORTANTE:** Substitua `SUA_SENHA` pela senha real do banco

### 5. Rodar Migrações

```bash
cd nextjs_space
npx prisma migrate dev --name init
```

Isso vai:
- Criar todas as tabelas no Supabase
- Aplicar o schema do Prisma
- Gerar o Prisma Client

### 6. Seed Inicial (Opcional)

```bash
npm run seed
```

Isso cria:
- Configurações padrão
- Perfil inicial

### 7. Verificar Conexão

```bash
npm run test:system
```

Ou abrir o Prisma Studio:
```bash
npx prisma studio
```

---

## 🔒 Segurança

⚠️ **NUNCA** commite o arquivo `.env` no Git!

O `.env` já está no `.gitignore`, mas verifique:
- ✅ `.env` não aparece em `git status`
- ✅ Senha não está no código
- ✅ Apenas `.env.example` está versionado

---

## 📊 Verificar no Supabase

1. No dashboard do Supabase, vá em **Table Editor**
2. Você deve ver as tabelas:
   - `instagram_posts`
   - `configuracoes`
   - `logs_coleta`
   - `profiles`

---

## 🆘 Troubleshooting

### Erro: "Connection refused"
- Verifique se a senha está correta
- Verifique se o projeto Supabase está ativo
- Verifique se a URL está completa

### Erro: "Schema not found"
- Execute: `npx prisma migrate dev`

### Erro: "Table already exists"
- Execute: `npx prisma migrate reset` (cuidado: apaga dados!)
- Ou: `npx prisma migrate deploy`

---

## ✅ Checklist

- [ ] Conta criada no Supabase
- [ ] Projeto criado
- [ ] Senha anotada
- [ ] String de conexão copiada
- [ ] `.env` configurado
- [ ] Migrações rodadas
- [ ] Seed executado (opcional)
- [ ] Teste de conexão passou

---

## 🎯 Próximos Passos

Após configurar:
1. ✅ Testar sistema: `npm run test:system`
2. ✅ Iniciar servidor: `npm run dev`
3. ✅ Testar funcionalidades

---

**Dica:** Guarde a senha do banco em um gerenciador de senhas seguro!

