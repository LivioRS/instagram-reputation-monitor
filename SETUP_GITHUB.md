# 🚀 Passo a Passo Completo - Configuração GitHub

## Cenário 1: Criar Novo Repositório do Zero

### 1. Criar o Repositório no GitHub

1. Acesse [https://github.com](https://github.com)
2. Clique no botão **"+"** no canto superior direito → **"New repository"**
3. Preencha:
   - **Repository name:** `instagram-reputation-monitor` (ou `instagram-reputation-monitor-phx`)
   - **Description:** (opcional) "Sistema de monitoramento de reputação do Instagram"
   - **Visibility:** Escolha **Public** ou **Private**
   - **⚠️ IMPORTANTE:** NÃO marque nenhuma opção de inicialização:
     - ❌ Não marque "Add a README file"
     - ❌ Não marque "Add .gitignore"
     - ❌ Não marque "Choose a license"
4. Clique em **"Create repository"**

### 2. Preparar a Pasta Local

No Cursor/VS Code:

1. Abra a pasta do projeto: `C:\Ai-Studio\instagram_reputation_monitor`
2. Certifique-se de que todos os arquivos estão presentes:
   - ✅ Estrutura completa `nextjs_space/`
   - ✅ Arquivos de configuração na raiz
   - ✅ Scripts em `nextjs_space/scripts/`

### 3. Inicializar Git Localmente

Abra o terminal no Cursor (Ctrl + `) e execute:

```powershell
# Navegar para a pasta do projeto
cd C:\Ai-Studio\instagram_reputation_monitor

# Inicializar repositório Git
git init

# Verificar status
git status
```

### 4. Fazer o Primeiro Commit

```powershell
# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial PHX Instagram monitor setup"

# Renomear branch para main (se estiver em master)
git branch -M main
```

### 5. Conectar ao Repositório GitHub

```powershell
# Adicionar remote (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/instagram-reputation-monitor.git

# Verificar se foi adicionado corretamente
git remote -v
```

**Saída esperada:**
```
origin  https://github.com/SEU_USUARIO/instagram-reputation-monitor.git (fetch)
origin  https://github.com/SEU_USUARIO/instagram-reputation-monitor.git (push)
```

### 6. Fazer o Primeiro Push

```powershell
# Enviar código para o GitHub
git push -u origin main
```

**Se aparecer erro de autenticação:**
- O GitHub pode pedir credenciais
- Use um **Personal Access Token** (não sua senha)
- Para criar um token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

---

## Cenário 2: Assumir Controle de Repositório Existente

### Problema: Remote com URL Incorreta

Se você ver um erro como:
```
remote: Repository not found.
fatal: repository 'https://github.com/SEU_USUARIO/instagram-reputation-monitor-phx.git/' not found
```

### Solução: Corrigir a URL do Remote

```powershell
# 1. Ver o remote atual
git remote -v
```

**Saída (incorreta):**
```
origin  https://github.com/SEU_USUARIO/instagram-reputation-monitor-phx.git (fetch)
origin  https://github.com/SEU_USUARIO/instagram-reputation-monitor-phx.git (push)
```

```powershell
# 2. Atualizar para a URL correta
git remote set-url origin https://github.com/LivioRS/instagram-reputation-monitor.git

# 3. Verificar se foi atualizado
git remote -v
```

**Saída (correta):**
```
origin  https://github.com/LivioRS/instagram-reputation-monitor.git (fetch)
origin  https://github.com/LivioRS/instagram-reputation-monitor.git (push)
```

```powershell
# 4. Fazer push
git push -u origin main
```

---

## Cenário 3: Repositório Já Existe no GitHub

Se o repositório já foi criado e você quer conectar sua pasta local:

```powershell
# 1. Verificar se já tem remote
git remote -v

# 2. Se não tiver, adicionar
git remote add origin https://github.com/SEU_USUARIO/instagram-reputation-monitor.git

# 3. Se já tiver mas estiver errado, atualizar
git remote set-url origin https://github.com/SEU_USUARIO/instagram-reputation-monitor.git

# 4. Verificar branch atual
git branch

# 5. Se necessário, renomear para main
git branch -M main

# 6. Fazer push
git push -u origin main
```

---

## 🔒 Segurança: Remover Tokens do Código

**IMPORTANTE:** Se o GitHub bloquear o push por detectar tokens:

### Erro Comum:
```
remote: error: GH013: Repository rule violations found
remote: - Push cannot contain secrets
```

### Solução:

1. **Remover o token do código** e usar variável de ambiente
2. **Fazer commit amending** para remover do histórico:
   ```powershell
   # Editar o arquivo removendo o token
   # Depois:
   git add .
   git commit --amend --no-edit
   git push -u origin main
   ```

3. **Configurar variável de ambiente** no arquivo `.env`:
   ```
   APIFY_API_TOKEN=seu_token_aqui
   ```

---

## ✅ Checklist Final

Após seguir os passos, verifique:

- [ ] Repositório criado no GitHub
- [ ] Git inicializado localmente (`git init`)
- [ ] Primeiro commit feito (`git commit`)
- [ ] Remote configurado corretamente (`git remote -v`)
- [ ] Push realizado com sucesso (`git push`)
- [ ] Arquivos visíveis no GitHub
- [ ] Tokens removidos do código
- [ ] Variáveis de ambiente configuradas

---

## 📚 Comandos Úteis

```powershell
# Ver status
git status

# Ver histórico de commits
git log --oneline

# Ver branches
git branch

# Ver remotes
git remote -v

# Adicionar arquivos
git add .

# Fazer commit
git commit -m "Mensagem descritiva"

# Enviar para GitHub
git push

# Atualizar do GitHub
git pull
```

---

## 🆘 Troubleshooting

### Erro: "remote origin already exists"
```powershell
# Remover o remote antigo
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/SEU_USUARIO/instagram-reputation-monitor.git
```

### Erro: "Repository not found"
- Verifique se o repositório existe no GitHub
- Verifique se você tem permissão de escrita
- Confirme o nome do usuário na URL

### Erro: "Authentication failed"
- Use Personal Access Token ao invés de senha
- Configure credenciais: `git config --global credential.helper manager-core`

---

**Repositório atual:** `https://github.com/LivioRS/instagram-reputation-monitor`

