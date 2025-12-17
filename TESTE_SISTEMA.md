# 🧪 Guia de Teste do Sistema Completo

## 📋 Checklist de Testes

### 1. ✅ Pré-requisitos

- [x] Dependências instaladas (`npm install --legacy-peer-deps`)
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados configurado
- [ ] Migrações do Prisma executadas

---

## 🚀 Passo a Passo

### Passo 1: Verificar Configuração

```bash
cd nextjs_space

# Verificar se .env existe
# Se não existir, copie do ENV_EXAMPLE.md e configure
```

### Passo 2: Configurar Banco de Dados

```bash
# Rodar migrações
npx prisma migrate dev

# Seed inicial (opcional, mas recomendado)
npm run seed
```

### Passo 3: Executar Testes Automatizados

```bash
# Testar sistema completo
npm run test:system
```

Este script verifica:
- ✅ Conexão com banco de dados
- ✅ Schema do banco
- ✅ Variáveis de ambiente
- ✅ Configurações iniciais
- ✅ Perfis cadastrados
- ✅ Integrações externas (Abacus AI, Apify, Telegram)

### Passo 4: Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🧪 Testes Manuais

### Teste 1: Dashboard
1. Acesse http://localhost:3000
2. Verifique se o dashboard carrega
3. Verifique se os gráficos aparecem
4. Teste filtros de período

### Teste 2: Coleta de Posts
1. Vá para `/coleta`
2. Clique em "Iniciar Coleta"
3. Verifique se o stream de progresso funciona
4. Verifique se posts são salvos

### Teste 3: Análise de Sentimento
1. Após coletar posts, verifique se foram analisados
2. Verifique scores de reputação
3. Verifique níveis de risco

### Teste 4: Alertas
1. Vá para `/alertas`
2. Verifique se alertas aparecem
3. Teste atualizar status de alerta

### Teste 5: Posts
1. Vá para `/posts`
2. Verifique lista de posts
3. Teste filtros
4. Teste reprocessar post

### Teste 6: Perfis
1. Vá para `/perfis`
2. Teste criar novo perfil
3. Teste ativar/desativar perfil
4. Teste deletar perfil

### Teste 7: Configurações
1. Vá para `/configuracoes`
2. Teste salvar configurações
3. Teste conexão Instagram
4. Teste conexão Telegram

---

## 🔍 Testes de API (via curl ou Postman)

### Teste GET /api/dashboard
```bash
curl http://localhost:3000/api/dashboard
```

### Teste GET /api/perfis
```bash
curl http://localhost:3000/api/perfis
```

### Teste POST /api/perfis
```bash
curl -X POST http://localhost:3000/api/perfis \
  -H "Content-Type: application/json" \
  -d '{"username": "testeperfil"}'
```

### Teste POST /api/coleta
```bash
curl -X POST http://localhost:3000/api/coleta \
  -H "Content-Type: application/json" \
  -d '{"mode": "profile"}'
```

### Teste POST /api/analise
```bash
curl -X POST http://localhost:3000/api/analise \
  -H "Content-Type: application/json" \
  -d '{
    "postUrl": "https://instagram.com/p/teste",
    "legenda": "Post de teste",
    "curtidas": 100,
    "comentarios": 10,
    "empresa": "PHX Instrumentos"
  }'
```

---

## ⚠️ Problemas Comuns

### Erro: "Prisma Client não encontrado"
```bash
npx prisma generate
```

### Erro: "DATABASE_URL não configurado"
- Verifique arquivo `.env`
- Certifique-se que `DATABASE_URL` está definido

### Erro: "Tabelas não existem"
```bash
npx prisma migrate dev
```

### Erro: "API Key inválida"
- Verifique variáveis de ambiente no `.env`
- Teste as chaves manualmente

---

## 📊 Resultados Esperados

### Testes Automatizados
- ✅ Todos os testes obrigatórios devem passar
- ⚠️ Testes opcionais podem ser pulados (integrações não configuradas)

### Testes Manuais
- ✅ Todas as páginas devem carregar
- ✅ Navegação deve funcionar
- ✅ Formulários devem validar
- ✅ APIs devem responder corretamente

---

## 🎯 Próximos Passos Após Testes

Se todos os testes passarem:
1. ✅ Sistema está pronto para uso
2. ✅ Pode implementar autenticação
3. ✅ Pode fazer deploy

Se algum teste falhar:
1. ❌ Verifique os erros
2. ❌ Execute os comandos sugeridos
3. ❌ Consulte a documentação

---

## 📝 Logs e Debugging

Para ver logs detalhados:
```bash
# Modo desenvolvimento com logs
npm run dev

# Ver logs do Prisma
DEBUG=prisma:* npm run dev
```

Para verificar banco de dados:
```bash
npx prisma studio
```

