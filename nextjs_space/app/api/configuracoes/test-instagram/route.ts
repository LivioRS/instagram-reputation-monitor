import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { instagramMetodo, instagramAccessToken, instagramUsername } = body

    if (!instagramUsername) {
      return NextResponse.json(
        { error: 'Username do Instagram é obrigatório' },
        { status: 400 }
      )
    }

    if (instagramMetodo === 'graph') {
      if (!instagramAccessToken) {
        return NextResponse.json(
          { error: 'Access Token é obrigatório para Graph API' },
          { status: 400 }
        )
      }

      // Testar Graph API
      const testUrl = `https://graph.instagram.com/me/media?fields=id,caption&access_token=${instagramAccessToken}`
      const res = await fetch(testUrl)

      if (!res.ok) {
        const error = await res.json()
        return NextResponse.json(
          { error: error?.error?.message ?? 'Erro ao conectar com Graph API' },
          { status: 400 }
        )
      }

      return NextResponse.json({ success: true, message: 'Conexão com Graph API bem-sucedida!' })
    } else {
      // Para Apify, apenas validar que os campos estão preenchidos
      const { apifyApiKey, apifyTaskId } = body

      if (!apifyApiKey || !apifyTaskId) {
        return NextResponse.json(
          { error: 'API Key e Task ID do Apify são obrigatórios' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Credenciais do Apify configuradas. A validação será feita durante a coleta.',
      })
    }
  } catch (error) {
    console.error('Erro ao testar Instagram:', error)
    return NextResponse.json({ error: 'Erro ao testar conexão' }, { status: 500 })
  }
}
