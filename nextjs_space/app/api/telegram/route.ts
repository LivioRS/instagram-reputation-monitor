import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { post, analysis } = body

    // Buscar configurações do Telegram
    const configs = await prisma.configuracao.findMany({
      where: {
        chave: {
          in: ['telegramBotToken', 'telegramChatId', 'alertasAtivos'],
        },
      },
    })

    const configMap: any = {}
    for (const config of configs) {
      configMap[config?.chave ?? ''] = config?.valor ?? ''
    }

    const { telegramBotToken, telegramChatId, alertasAtivos } = configMap

    if (alertasAtivos === 'false') {
      return NextResponse.json({ success: true, skipped: true })
    }

    if (!telegramBotToken || !telegramChatId) {
      return NextResponse.json({ success: true, skipped: true })
    }

    const riskEmoji =
      analysis?.nivel_risco === 'alto'
        ? '🔴'
        : analysis?.nivel_risco === 'medio'
        ? '🟡'
        : '🟢'

    const message = `${riskEmoji} *ALERTA DE REPUTAÇÃO*

*Post:* [Ver no Instagram](${post?.postUrl ?? ''})
*Data:* ${new Date(post?.dataPublicacao ?? new Date()).toLocaleDateString('pt-BR')}

*Métricas:*
❤️ Curtidas: ${post?.curtidas ?? 0}
💬 Comentários: ${post?.comentarios ?? 0}

*Score de Reputação:* ${(analysis?.score_reputacao ?? 0).toFixed(1)}/10
*Nível de Risco:* ${(analysis?.nivel_risco ?? 'baixo').toUpperCase()}

*Sentimento:*
😊 Positivo: ${(analysis?.sentimento?.positivo ?? 0).toFixed(0)}%
😐 Neutro: ${(analysis?.sentimento?.neutro ?? 0).toFixed(0)}%
😟 Negativo: ${(analysis?.sentimento?.negativo ?? 0).toFixed(0)}%

${analysis?.alertas ? `*Alertas:*\n${analysis.alertas}\n\n` : ''}*Resumo:*
${analysis?.resumo ?? 'N/A'}

${(analysis?.recomendacoes?.length ?? 0) > 0 ? `*Recomendações:*\n${analysis.recomendacoes.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}` : ''}`

    const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`

    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error('Erro ao enviar mensagem Telegram:', error)
      return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao enviar alerta Telegram:', error)
    return NextResponse.json({ error: 'Erro ao enviar alerta' }, { status: 500 })
  }
}
