# Instagram Reputation Monitor - PHX

Sistema de monitoramento de reputação do Instagram com análise de sentimento e alertas.

## 📋 Passo a Passo - Configuração no GitHub

### 1. Criar o Repositório no GitHub

1. Acesse [https://github.com](https://github.com) e clique em **New repository**
2. **Nome do repositório:** `instagram-reputation-monitor` (ou `instagram-reputation-monitor-phx` se preferir)
3. Escolha **Public** (ou **Private**, se preferir)
4. **NÃO** marque nenhuma opção de inicialização (README, .gitignore, license)
5. Clique em **Create repository**

### 2. Preparar a Pasta Local no Cursor

1. No Cursor/VS Code, abra a pasta do projeto: `instagram_reputation_monitor`
2. Certifique-se de que todos os arquivos estão presentes:
   - `nextjs_space/` (toda a estrutura Next.js)
   - `schema.prisma`
   - `tsconfig.json`
   - `tailwind.config.ts`
   - `robots.txt`
   - Scripts: `setup-apify.ts`, `reset-database.ts`, `migrate-to-profiles.ts`, `update-quantity.ts`
   - Imagens: `favicon.svg`, `og-image.png`

### 3. Inicializar Git e Conectar ao GitHub

No terminal dentro da pasta do projeto (no Cursor):

```bash
# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial PHX Instagram monitor setup"

# Renomear branch para main (se necessário)
git branch -M main

# Adicionar remote do GitHub (substitua SEU_USUARIO pelo seu usuário)
git remote add origin https://github.com/SEU_USUARIO/instagram-reputation-monitor.git

# Verificar se o remote está correto
git remote -v
```

**Se o remote já existir com URL incorreta:**

```bash
# Atualizar a URL do remote
git remote set-url origin https://github.com/SEU_USUARIO/instagram-reputation-monitor.git

# Verificar novamente
git remote -v
```

### 4. Fazer o Primeiro Push

```bash
# Fazer push para o GitHub
git push -u origin main
```

**Nota:** Na primeira vez, o Git pode pedir login/token pessoal. Configure suas credenciais se necessário.

### 5. Verificar no GitHub

1. Abra o repositório no GitHub: `https://github.com/SEU_USUARIO/instagram-reputation-monitor`
2. Verifique se todos os arquivos apareceram corretamente
3. Confirme que a estrutura `nextjs_space/` está presente

## 🔄 Comandos Git para Uso Diário

Após a configuração inicial, para versionar suas alterações:

```bash
# Ver status das alterações
git status

# Adicionar arquivos modificados
git add .

# Ou adicionar arquivos específicos
git add caminho/do/arquivo

# Fazer commit
git commit -m "Descrição das alterações"

# Enviar para o GitHub
git push
```

## ⚠️ Importante - Segurança de Tokens

**NUNCA** commite tokens ou credenciais no código!

O projeto já está configurado para usar variáveis de ambiente:

### Configuração do Token Apify

O script `setup-apify.ts` usa a variável de ambiente `APIFY_API_TOKEN`.

**Antes de executar o script:**

1. Crie/edite o arquivo `.env` em `nextjs_space/.env`:
   ```
   APIFY_API_TOKEN=seu_token_aqui
   ```

2. Ou exporte a variável no terminal (PowerShell):
   ```powershell
   $env:APIFY_API_TOKEN="seu_token_aqui"
   ```

3. Ou no terminal (Bash):
   ```bash
   export APIFY_API_TOKEN="seu_token_aqui"
   ```

## 📁 Estrutura do Projeto

```
instagram_reputation_monitor/
├── nextjs_space/          # Aplicação Next.js principal
│   ├── app/               # Rotas e páginas
│   ├── components/        # Componentes React
│   ├── lib/               # Utilitários e configurações
│   ├── prisma/            # Schema do banco de dados
│   ├── scripts/           # Scripts de setup e manutenção
│   └── public/            # Arquivos estáticos
├── INTEGRACAO_N8N.md      # Documentação de integração
└── README.md              # Este arquivo
```

## 🚀 Próximos Passos

1. Configurar variáveis de ambiente no arquivo `.env`
2. Instalar dependências: `npm install` ou `yarn install`
3. Configurar banco de dados (Prisma)
4. Executar scripts de setup conforme necessário

## 📝 Notas

- O repositório atual está em: `https://github.com/LivioRS/instagram-reputation-monitor`
- Branch principal: `main`
- Todos os tokens foram removidos do código e devem ser configurados via variáveis de ambiente

