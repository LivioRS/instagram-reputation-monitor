# 📚 Documentação da API - Instagram Reputation Monitor

## Base URL
```
http://localhost:3000/api
```

## Autenticação
Atualmente não há autenticação implementada. Todas as rotas são públicas.

---

## 🔄 Rotas de Coleta

### `POST /api/coleta`
Inicia uma coleta de posts do Instagram.

**Body:**
```json
{
  "mode": "profile" | "single",  // Opcional, default: "profile"
  "postUrl": "https://instagram.com/p/..."  // Obrigatório se mode="single"
}
```

**Response (Stream):**
Retorna um stream de eventos em tempo real:
```json
{"type": "log", "level": "info", "message": "..."}
{"type": "result", "data": {"totalColetado": 10, "novosAnalisados": 5, "alertasGerados": 2, "tempoExecucao": 120}}
```

**Exemplo:**
```bash
curl -X POST http://localhost:3000/api/coleta \
  -H "Content-Type: application/json" \
  -d '{"mode": "profile"}'
```

---

## 📊 Rotas de Dashboard

### `GET /api/dashboard`
Retorna estatísticas gerais do dashboard.

**Query Parameters:**
- `period`: `"7" | "30" | "90" | "all"` (default: "30")

**Response:**
```json
{
  "totalPosts": 150,
  "avgScore": 7.5,
  "highRiskPosts": 5,
  "avgSentiment": {
    "positivo": 60,
    "neutro": 30,
    "negativo": 10
  }
}
```

### `GET /api/dashboard/reputation`
Retorna dados de reputação ao longo do tempo.

**Query Parameters:**
- `period`: `"7" | "30" | "90" | "all"` (default: "30")

**Response:**
```json
[
  {"date": "01/12", "score": 7.5},
  {"date": "02/12", "score": 8.0}
]
```

### `GET /api/dashboard/sentiment`
Retorna média de sentimento.

**Query Parameters:**
- `period`: `"7" | "30" | "90" | "all"` (default: "30")

**Response:**
```json
[
  {"name": "Positivo", "value": 60.5},
  {"name": "Neutro", "value": 30.2},
  {"name": "Negativo", "value": 9.3}
]
```

### `GET /api/dashboard/engagement`
Retorna dados de engajamento.

**Query Parameters:**
- `period`: `"7" | "30" | "90" | "all"` (default: "30")

**Response:**
```json
[
  {"date": "01/12", "curtidas": 150, "comentarios": 20},
  {"date": "02/12", "curtidas": 200, "comentarios": 25}
]
```

### `GET /api/dashboard/risk`
Retorna distribuição de risco.

**Query Parameters:**
- `period`: `"7" | "30" | "90" | "all"` (default: "30")

**Response:**
```json
[
  {"name": "Baixo", "value": 80},
  {"name": "Médio", "value": 15},
  {"name": "Alto", "value": 5}
]
```

### `GET /api/dashboard/recent-alerts`
Retorna alertas recentes.

**Query Parameters:**
- `limit`: `number` (default: 10)

**Response:**
```json
[
  {
    "id": "...",
    "postUrl": "...",
    "nivelRisco": "alto",
    "scoreReputacao": 3.5,
    "dataPublicacao": "2024-12-01T..."
  }
]
```

---

## 📝 Rotas de Posts

### `GET /api/posts`
Lista todos os posts.

**Query Parameters:**
- `period`: `"7" | "30" | "90" | "all"` (default: "30")

**Response:**
```json
[
  {
    "id": "...",
    "postUrl": "...",
    "legenda": "...",
    "curtidas": 150,
    "comentarios": 20,
    "scoreReputacao": 7.5,
    "nivelRisco": "baixo",
    "dataPublicacao": "2024-12-01T..."
  }
]
```

### `POST /api/posts/[id]/reprocess`
Reprocessa a análise de um post específico.

**Response:**
```json
{
  "id": "...",
  "scoreReputacao": 8.0,
  "nivelRisco": "baixo",
  ...
}
```

### `GET /api/posts-alerta`
Lista posts com alertas.

**Query Parameters:**
- `status`: `"pendente" | "em_analise" | "resolvido" | "todos"` (default: "pendente")

**Response:**
```json
[
  {
    "id": "...",
    "postUrl": "...",
    "statusAlerta": "pendente",
    "nivelRisco": "alto",
    ...
  }
]
```

---

## 🚨 Rotas de Alertas

### `GET /api/alertas`
Lista todos os alertas.

**Response:**
```json
[
  {
    "id": "...",
    "postUrl": "...",
    "nivelRisco": "alto",
    "sentimentoNegativo": 45,
    ...
  }
]
```

### `PATCH /api/alertas/[id]`
Atualiza o status de um alerta.

**Body:**
```json
{
  "statusAlerta": "pendente" | "em_analise" | "resolvido",
  "alertaResolvido": true
}
```

**Response:**
```json
{
  "id": "...",
  "statusAlerta": "resolvido",
  "alertaResolvido": true,
  ...
}
```

---

## 👤 Rotas de Perfis

### `GET /api/perfis`
Lista todos os perfis.

**Response:**
```json
{
  "profiles": [
    {
      "id": "...",
      "username": "phxinstrumentos",
      "displayName": "@phxinstrumentos",
      "isActive": true,
      "postsCount": 150
    }
  ],
  "activeProfile": {...},
  "total": 1,
  "maxProfiles": 30,
  "canAddMore": true
}
```

### `POST /api/perfis`
Cria um novo perfil.

**Body:**
```json
{
  "username": "novoperfil"
}
```

**Response:**
```json
{
  "message": "Perfil criado com sucesso",
  "profile": {...}
}
```

### `GET /api/perfis/[id]`
Retorna um perfil específico.

**Response:**
```json
{
  "id": "...",
  "username": "phxinstrumentos",
  "isActive": true,
  "postsCount": 150
}
```

### `PATCH /api/perfis/[id]`
Atualiza um perfil (ativa/desativa).

**Body:**
```json
{
  "isActive": true
}
```

### `DELETE /api/perfis/[id]`
Deleta um perfil e todos os seus posts.

**Response:**
```json
{
  "message": "Perfil deletado com sucesso"
}
```

---

## ⚙️ Rotas de Configurações

### `GET /api/configuracoes`
Retorna todas as configurações.

**Response:**
```json
{
  "empresaNome": "PHX Instrumentos",
  "instagramUsername": "phxinstrumentos",
  "instagramMetodo": "apify",
  "coletaQuantidade": "30",
  ...
}
```

### `POST /api/configuracoes`
Salva configurações.

**Body:**
```json
{
  "empresaNome": "PHX Instrumentos",
  "instagramUsername": "phxinstrumentos",
  "coletaQuantidade": "50"
}
```

**Response:**
```json
{
  "success": true
}
```

### `POST /api/configuracoes/test-instagram`
Testa conexão com Instagram.

**Body:**
```json
{
  "instagramMetodo": "apify" | "graph",
  "instagramAccessToken": "...",  // Se method="graph"
  "instagramUsername": "..."  // Se method="apify"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conexão testada com sucesso"
}
```

### `POST /api/configuracoes/test-telegram`
Testa envio de mensagem no Telegram.

**Body:**
```json
{
  "telegramBotToken": "...",
  "telegramChatId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso"
}
```

---

## 🤖 Rotas de Integração

### `POST /api/analise`
Analisa um post usando IA (Claude).

**Body:**
```json
{
  "postUrl": "https://instagram.com/p/...",
  "legenda": "Texto da legenda...",
  "curtidas": 150,
  "comentarios": 20,
  "empresa": "PHX Instrumentos"
}
```

**Response:**
```json
{
  "sentimento": {
    "positivo": 60,
    "neutro": 30,
    "negativo": 10
  },
  "score_reputacao": 7.5,
  "nivel_risco": "baixo",
  "temas_principais": ["produtos", "qualidade"],
  "resumo": "Post positivo sobre produtos...",
  "alertas": null,
  "recomendacoes": ["Continuar estratégia atual"]
}
```

### `POST /api/telegram`
Envia alerta para o Telegram.

**Body:**
```json
{
  "post": {...},
  "analysis": {...}
}
```

**Response:**
```json
{
  "success": true
}
```

---

## 📊 Códigos de Status HTTP

- `200` - Sucesso
- `400` - Erro de validação/Bad Request
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

---

## 🔍 Filtros e Paginação

A maioria das rotas GET aceita:
- `period`: Filtro por período (`"7"`, `"30"`, `"90"`, `"all"`)
- Algumas rotas aceitam `limit` para paginação

---

## ⚠️ Notas Importantes

1. Todas as rotas retornam JSON
2. Rotas de coleta retornam stream de eventos
3. Validações são feitas com Zod
4. Erros retornam formato padronizado: `{"error": "mensagem", "code": "CODIGO", "details": {...}}`
5. Todas as rotas são dinâmicas (`force-dynamic`) para garantir dados atualizados

