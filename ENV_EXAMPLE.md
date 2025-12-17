# Variáveis de Ambiente - Instagram Reputation Monitor

Crie um arquivo `.env` na pasta `nextjs_space/` com as seguintes variáveis:

```env
# ============================================
# Banco de Dados
# ============================================
DATABASE_URL="postgresql://usuario:senha@localhost:5432/instagram_monitor"

# ============================================
# Next.js
# ============================================
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# Abacus AI / Claude
# ============================================
ABACUSAI_API_KEY="sua_api_key_aqui"

# ============================================
# Apify
# ============================================
APIFY_API_TOKEN="seu_token_apify_aqui"

# ============================================
# Instagram Graph API (Opcional)
# ============================================
INSTAGRAM_ACCESS_TOKEN="seu_access_token_aqui"

# ============================================
# Telegram (Opcional)
# ============================================
TELEGRAM_BOT_TOKEN="seu_bot_token_aqui"
TELEGRAM_CHAT_ID="seu_chat_id_aqui"

# ============================================
# Ambiente
# ============================================
NODE_ENV="development"
```

## Como obter cada variável:

### DATABASE_URL
- Formato: `postgresql://usuario:senha@host:porta/database`
- Exemplo: `postgresql://postgres:senha123@localhost:5432/instagram_monitor`

### ABACUSAI_API_KEY
- Acesse: https://abacus.ai
- Crie uma conta e obtenha sua API Key

### APIFY_API_TOKEN
- Acesse: https://console.apify.com/account/integrations
- Crie ou copie seu token
- Ou execute: `npm run setup-apify` (após configurar APIFY_API_TOKEN)

### TELEGRAM_BOT_TOKEN
- Fale com @BotFather no Telegram
- Use `/newbot` para criar um bot
- Copie o token fornecido

### TELEGRAM_CHAT_ID
- Envie uma mensagem para @userinfobot no Telegram
- Ele retornará seu Chat ID

## Notas Importantes:

⚠️ **NUNCA** commite o arquivo `.env` no Git!
- O arquivo `.env` já está no `.gitignore`
- Use `.env.example` como template (se existir)

✅ Todas as configurações também podem ser feitas via interface web em `/configuracoes`
- As configurações via interface são salvas no banco de dados
- Variáveis de ambiente têm prioridade sobre configurações do banco

