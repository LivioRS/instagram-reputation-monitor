import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telegramBotToken, telegramChatId } = body

    if (!telegramBotToken || !telegramChatId) {
      return NextResponse.json(
        { error: 'Bot Token e Chat ID são obrigatórios' },
        { status: 400 }
      )
    }

    const message = '✅ *Teste de Conexão*\n\nSeu bot do Telegram está funcionando corretamente!'

    const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`

    const res = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      return NextResponse.json(
        { error: error?.description ?? 'Erro ao enviar mensagem' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao testar Telegram:', error)
    return NextResponse.json({ error: 'Erro ao testar Telegram' }, { status: 500 })
  }
}
