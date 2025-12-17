# Integração com N8N

Este guia explica como integrar o sistema de monitoramento de Instagram com N8N para envio automático de alertas via Telegram.

## 🎯 Visão Geral

O endpoint `/api/posts-alerta` foi criado especificamente para ser consumido pelo N8N, permitindo:

- ✅ Buscar posts com alertas automaticamente
- ✅ Filtrar por período e status
- ✅ Enviar notificações personalizadas via Telegram
- ✅ Marcar posts como já notificados (evitar duplicatas)
- ✅ Integração simples com webhook

---

## 🔗 Endpoint da API

### Base URL
```
https://SEU_DOMINIO.abacusai.app/api/posts-alerta
```

---

## 📊 GET - Buscar Posts com Alerta

### URL
```
GET /api/posts-alerta
```

### Parâmetros de Query (Opcionais)

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|---------|-------------|
| `status` | string | `pendente` | Filtro de status: `pendente`, `em_analise`, `resolvido`, `todos` |
| `periodo` | number | `24` | Número de horas para buscar (ex: 24 = últimas 24h) |
| `limite` | number | `20` | Número máximo de posts retornados |
| `apenas_nao_notificados` | boolean | `true` | Se `true`, retorna apenas posts ainda não notificados pelo N8N |

### Exemplos de Uso

**Buscar posts pendentes das últimas 24h (não notificados):**
```
GET /api/posts-alerta
```

**Buscar todos os posts das últimas 48h:**
```
GET /api/posts-alerta?status=todos&periodo=48
```

**Buscar até 5 posts, incluindo já notificados:**
```
GET /api/posts-alerta?limite=5&apenas_nao_notificados=false
```

### Resposta JSON

```json
{
  "sucesso": true,
  "total": 2,
  "periodo_horas": 24,
  "threshold_sentimento": 40,
  "posts": [
    {
      "id": "abc123",
      "post_id": "instagram_12345",
      "empresa": "PHX Instrumentos",
      "post_url": "https://instagram.com/p/xyz",
      "data_publicacao": "2024-12-16T10:00:00Z",
      
      "legenda": "Post com legenda resumida...",
      "legenda_completa": "Post com legenda completa...",
      "tipo_conteudo": "IMAGE",
      "thumbnail_url": "https://...",
      
      "curtidas": 150,
      "comentarios": 45,
      "compartilhamentos": 10,
      "saves": 5,
      
      "sentimento": {
        "positivo": 30,
        "neutro": 20,
        "negativo": 50
      },
      "score_reputacao": 4.5,
      "nivel_risco": "alto",
      "temas_principais": ["atendimento", "entrega", "qualidade"],
      "resumo": "Post com alta negatividade devido a reclamações...",
      "alertas": "Detectados comentários negativos sobre entrega",
      "recomendacoes": [
        "Responder rapidamente aos comentários",
        "Investigar problemas de entrega"
      ],
      
      "status_alerta": "pendente",
      "notificado_n8n": false,
      "coletado_em": "2024-12-16T10:05:00Z",
      
      "tem_alerta_critico": true,
      "tem_sentimento_muito_negativo": true
    }
  ]
}
```

---

## ✅ POST - Marcar Posts como Notificados

Depois de enviar a notificação ao Telegram, marque os posts como notificados para evitar duplicatas.

### URL
```
POST /api/posts-alerta
```

### Body (JSON)

```json
{
  "post_ids": ["abc123", "def456", "ghi789"]
}
```

### Resposta

```json
{
  "sucesso": true,
  "posts_atualizados": 3,
  "post_ids": ["abc123", "def456", "ghi789"]
}
```

---

## 🤖 Workflow N8N

### Estrutura Recomendada

```
Schedule Trigger (a cada 1 hora)
↓
HTTP Request (GET /api/posts-alerta)
↓
IF (posts.length > 0)
↓
Split In Batches (processar 1 por vez)
↓
Function (formatar mensagem Telegram)
↓
Telegram (enviar mensagem)
↓
Function (coletar IDs processados)
↓
HTTP Request (POST /api/posts-alerta - marcar como notificado)
```

---

## 📦 Configuração Passo a Passo no N8N

### 1. Schedule Trigger

**Node:** Schedule Trigger  
**Configuração:**
```json
{
  "rule": {
    "interval": [
      {
        "field": "hours",
        "hoursInterval": 1
      }
    ]
  }
}
```

---

### 2. HTTP Request - Buscar Posts

**Node:** HTTP Request  
**Método:** GET  
**URL:** `https://SEU_DOMINIO.abacusai.app/api/posts-alerta`

**Query Parameters:**
```json
{
  "status": "pendente",
  "periodo": "24",
  "limite": "10"
}
```

**Headers:** (nenhum necessário, endpoint público)

**Options:**
- Response Format: `JSON`

---

### 3. IF - Verificar se há posts

**Node:** IF  
**Condition:**
```
{{ $json.posts.length }} > 0
```

Se **TRUE**, continua o workflow.  
Se **FALSE**, termina aqui.

---

### 4. Split In Batches

**Node:** Split In Batches  
**Batch Size:** 1  
**Input Data:** `{{ $json.posts }}`

Isso faz o N8N processar um post por vez.

---

### 5. Function - Formatar Mensagem Telegram

**Node:** Function  
**JavaScript:**

```javascript
const post = $input.item.json;

// Emoji baseado no risco
const emojiRisco = {
  'baixo': '✅',
  'medio': '⚠️',
  'alto': '🚨'
}[post.nivel_risco] || '🚨';

// Formatar mensagem para Telegram
const mensagem = `
${emojiRisco} *ALERTA DE REPUTAÇÃO*

*Empresa:* ${post.empresa}
*Data:* ${new Date(post.data_publicacao).toLocaleDateString('pt-BR')}

📊 *MÉTRICAS*
❤️ Curtidas: ${post.curtidas}
💬 Comentários: ${post.comentarios}

📈 *SCORE DE REPUTAÇÃO*
Score: ${post.score_reputacao}/10
Risco: ${post.nivel_risco.toUpperCase()}

😊 *SENTIMENTO*
✅ Positivo: ${post.sentimento.positivo}%
⚪ Neutro: ${post.sentimento.neutro}%
❌ Negativo: ${post.sentimento.negativo}%

📝 *RESUMO*
${post.resumo}

⚠️ *ALERTAS*
${post.alertas || 'Nenhum alerta específico'}

🎯 *TEMAS PRINCIPAIS*
${post.temas_principais.join(', ')}

🔗 [Ver Post no Instagram](${post.post_url})
`.trim();

return [{
  json: {
    post_id: post.id,
    mensagem: mensagem
  }
}];
```

---

### 6. Telegram - Enviar Mensagem

**Node:** Telegram  
**Operation:** Send Message  
**Chat ID:** `SEU_CHAT_ID`  
**Text:** `{{ $json.mensagem }}`

**Additional Fields:**
- Parse Mode: `Markdown`
- Disable Web Page Preview: `true`

---

### 7. Function - Coletar IDs Processados

**Node:** Function  
**JavaScript:**

```javascript
// Aguardar até todos os posts serem processados
if ($input.context.noItemsLeft) {
  // Coletar todos os IDs dos posts processados
  const allItems = $input.all();
  const post_ids = allItems.map(item => item.json.post_id);
  
  return [{
    json: {
      post_ids: post_ids
    }
  }];
}

return [];
```

**IMPORTANTE:** Coloque este node **DEPOIS** do loop (conecte na saída do Split In Batches quando terminar).

---

### 8. HTTP Request - Marcar como Notificado

**Node:** HTTP Request  
**Método:** POST  
**URL:** `https://SEU_DOMINIO.abacusai.app/api/posts-alerta`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON):**
```json
{
  "post_ids": "{{ $json.post_ids }}"
}
```

**Options:**
- Response Format: `JSON`

---

## 📝 Exemplo de Workflow Completo (JSON)

Você pode importar este workflow no N8N:

```json
{
  "name": "Alertas Instagram -> Telegram",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 1
            }
          ]
        }
      },
      "name": "A cada 1 hora",
      "type": "n8n-nodes-base.scheduleTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://SEU_DOMINIO.abacusai.app/api/posts-alerta",
        "options": {
          "response": {
            "response": {
              "responseFormat": "json"
            }
          }
        }
      },
      "name": "Buscar Posts com Alerta",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{$json.posts.length}}",
              "operation": "larger",
              "value2": 0
            }
          ]
        }
      },
      "name": "Tem posts?",
      "type": "n8n-nodes-base.if",
      "position": [650, 300]
    }
  ],
  "connections": {}
}
```

**⚠️ Lembre-se de substituir:**
- `SEU_DOMINIO` pelo seu domínio real
- `SEU_CHAT_ID` pelo seu Chat ID do Telegram

---

## 🔍 Testes

### Teste Manual via cURL

**Buscar posts:**
```bash
curl "https://SEU_DOMINIO.abacusai.app/api/posts-alerta?limite=2"
```

**Marcar como notificado:**
```bash
curl -X POST "https://SEU_DOMINIO.abacusai.app/api/posts-alerta" \
  -H "Content-Type: application/json" \
  -d '{"post_ids": ["abc123"]}'
```

### Teste no N8N

1. Crie o workflow
2. Desative o Schedule Trigger temporariamente
3. Clique em "Execute Workflow" manualmente
4. Observe os dados passando por cada node
5. Verifique se a mensagem chegou no Telegram
6. Ative o Schedule Trigger

---

## ⚙️ Configurações Avançadas

### Filtrar apenas riscos altos

Adicione um node **IF** depois do Split In Batches:

```
{{ $json.nivel_risco }} === 'alto'
```

### Enviar mensagens diferentes por tipo de risco

Use um node **Switch** para separar por `nivel_risco` e enviar mensagens customizadas.

### Adicionar delay entre mensagens

Adicione um node **Wait** com 2-3 segundos entre o Telegram e o próximo loop para evitar rate limiting.

---

## 📊 Monitoramento

### Ver posts já notificados

Para ver quais posts já foram notificados:

```
GET /api/posts-alerta?apenas_nao_notificados=false
```

### Resetar flag de notificação

Se precisar reenviar notificações, você pode resetar via SQL no banco:

```sql
UPDATE instagram_posts 
SET notificado_n8n = false 
WHERE nivel_risco = 'alto';
```

---

## ❓ Troubleshooting

### Problema: N8N não recebe nenhum post

**Solução:**
1. Verifique se há posts com alerta no sistema (acesse `/alertas`)
2. Teste o endpoint manualmente via cURL
3. Verifique os parâmetros de `periodo` e `status`
4. Confirme que `apenas_nao_notificados=true` não está bloqueando

### Problema: Posts são enviados repetidamente

**Solução:**
1. Verifique se o node de marcar como notificado está funcionando
2. Confirme que o POST está sendo chamado com os IDs corretos
3. Verifique logs no N8N para erros

### Problema: Mensagem não aparece formatada no Telegram

**Solução:**
1. Confirme que `Parse Mode` está configurado como `Markdown`
2. Verifique se há caracteres especiais quebrando o Markdown
3. Teste com uma mensagem simples primeiro

---

## 🚀 Próximos Passos

- 📊 Adicionar gráficos no Telegram (via bot custom)
- 📧 Enviar relatórios semanais por email
- 🔔 Configurar alertas via WhatsApp (usando API)
- 🤖 Respostas automáticas sugeridas pelo Claude

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique os logs do N8N
2. Teste os endpoints manualmente
3. Revise a documentação do N8N: https://docs.n8n.io
4. Teste com dados mock primeiro

---

**Boa sorte com a automação! 🚀**
