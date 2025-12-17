# 🚀 Configurar Supabase - Passo a Passo Rápido

## ⚡ Passos Rápidos (5 minutos)

### 1️⃣ Criar Projeto no Supabase

1. Acesse: **https://supabase.com**
2. Clique em **"Start your project"** ou faça login
3. Clique em **"New Project"**
4. Preencha:
   - **Name:** `instagram-monitor` (ou outro nome)
   - **Database Password:** Crie uma senha forte (⚠️ ANOTE!)
   - **Region:** `South America (São Paulo)` ou mais próxima
   - **Plan:** Free
5. Clique em **"Create new project"**
6. ⏱️ Aguarde 2-3 minutos

### 2️⃣ Copiar String de Conexão

1. No dashboard, vá em **Settings** (⚙️) → **Database**
2. Role até **"Connection string"**
3. Selecione **"URI"** (não "Session mode")
4. Você verá algo como:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
5. **Clique no ícone de copiar** 📋
6. **IMPORTANTE:** Substitua `[YOUR-PASSWORD]` pela senha que você criou

**Exemplo final:**
```
postgresql://postgres.abcdefghijklmnop:minhasenha123@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### 3️⃣ Configurar no Projeto

1. Abra o arquivo `.env` em `nextjs_space/.env`
2. **Substitua** a linha `DATABASE_URL` por:
   ```env
   DATABASE_URL="cole_a_string_aqui"
   ```
3. Salve o arquivo

### 4️⃣ Rodar Migrações

Abra o terminal e execute:

```bash
cd nextjs_space
npx prisma migrate dev --name init
```

Quando perguntar sobre criar o banco, digite `y` (yes).

### 5️⃣ Verificar

```bash
npm run setup:supabase
```

Se aparecer ✅, está tudo certo!

### 6️⃣ Seed Inicial (Opcional)

```bash
npm run seed
```

---

## ✅ Checklist Rápido

- [ ] Projeto criado no Supabase
- [ ] Senha anotada
- [ ] String de conexão copiada
- [ ] `[YOUR-PASSWORD]` substituído pela senha real
- [ ] `.env` atualizado
- [ ] Migrações rodadas (`npx prisma migrate dev`)
- [ ] Teste passou (`npm run setup:supabase`)

---

## 🆘 Problemas Comuns

### "Connection refused"
- ✅ Verifique se substituiu `[YOUR-PASSWORD]` pela senha real
- ✅ Verifique se o projeto Supabase está ativo (não pausado)

### "Schema not found"
- ✅ Execute: `npx prisma migrate dev`

### "Table already exists"
- ✅ Execute: `npx prisma migrate reset` (cuidado: apaga dados)
- ✅ Ou: `npx prisma migrate deploy`

---

## 🎯 Depois de Configurar

```bash
# Testar sistema completo
npm run test:system

# Iniciar servidor
npm run dev
```

---

**💡 Dica:** Guarde a senha do banco em um lugar seguro!

