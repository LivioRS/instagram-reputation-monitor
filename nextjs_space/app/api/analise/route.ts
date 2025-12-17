import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { analysisRequestSchema, validateData } from '@/lib/validations'
import { ApiError, createErrorResponse } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

/**
 * POST /api/analise
 * Analisa um post do Instagram usando IA (Claude)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateData(analysisRequestSchema, body)

    if (!validation.success) {
      throw new ApiError(400, validation.error, 'VALIDATION_ERROR')
    }

    const { postUrl, legenda, curtidas, comentarios, empresa } = validation.data

    // Buscar modelo configurado
    const modelConfig = await prisma.configuracao.findUnique({
      where: { chave: 'claudeModel' },
    })
    const model = modelConfig?.valor ?? 'claude-sonnet-4-20250514'

    const prompt = `Você é um especialista em análise de reputação e sentimento para a empresa ${empresa || 'PHX Instrumentos'}.

Analise o seguinte post do Instagram:

Legenda: ${legenda || 'Sem legenda'}
Curtidas: ${curtidas ?? 0}
Comentários: ${comentarios ?? 0}
URL: ${postUrl}

Forneça uma análise detalhada respondendo em JSON puro (sem markdown, sem blocos de código) com a seguinte estrutura EXATA:

{
  "sentimento": {
    "positivo": <número de 0 a 100>,
    "neutro": <número de 0 a 100>,
    "negativo": <número de 0 a 100>
  },
  "score_reputacao": <número de 0 a 10>,
  "nivel_risco": "<baixo, medio ou alto>",
  "temas_principais": ["<tema1>", "<tema2>", "<tema3>"],
  "resumo": "<breve resumo da análise>",
  "alertas": "<alertas importantes ou null se não houver>",
  "recomendacoes": ["<recomendação1>", "<recomendação2>"]
}

Critérios:
- Sentimento: Some deve dar 100%
- Score: Considere sentimento geral, engajamento, contexto
- Nível de risco: baixo (score > 7), medio (4-7), alto (< 4)
- Alertas: Apenas para situações que requerem atenção imediata
- Recomendações: Ações práticas para melhorar ou manter a reputação

Responda APENAS com o JSON, sem texto adicional.`

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status,
        errorData.error?.message || 'Erro ao chamar API de análise',
        'ANALYSIS_API_ERROR',
        errorData
      )
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content ?? '{}'

    let analysis
    try {
      analysis = JSON.parse(content)
    } catch (e) {
      console.error('Erro ao parsear JSON da análise:', e)
      // Fallback
      analysis = {
        sentimento: { positivo: 50, neutro: 40, negativo: 10 },
        score_reputacao: 5,
        nivel_risco: 'medio',
        temas_principais: [],
        resumo: 'Análise indisponível',
        alertas: null,
        recomendacoes: [],
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    const errorResponse = createErrorResponse(error, 'Erro ao analisar post')
    return NextResponse.json(
      {
        error: errorResponse.error,
        code: errorResponse.code,
        details: errorResponse.details,
      },
      { status: errorResponse.statusCode || 500 }
    )
  }
}
