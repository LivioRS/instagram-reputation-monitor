import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const post = await prisma.instagramPost.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 })
    }

    // Chamar API de análise
    const analysisRes = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analise`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postUrl: post.postUrl,
          legenda: post.legenda,
          curtidas: post.curtidas,
          comentarios: post.comentarios,
          empresa: post.empresa,
        }),
      }
    )

    if (!analysisRes.ok) {
      throw new Error('Erro ao analisar post')
    }

    const analysis = await analysisRes.json()

    // Atualizar post com nova análise
    const updatedPost = await prisma.instagramPost.update({
      where: { id },
      data: {
        sentimentoPositivo: analysis?.sentimento?.positivo ?? 0,
        sentimentoNeutro: analysis?.sentimento?.neutro ?? 0,
        sentimentoNegativo: analysis?.sentimento?.negativo ?? 0,
        scoreReputacao: analysis?.score_reputacao ?? 0,
        nivelRisco: analysis?.nivel_risco ?? 'baixo',
        temasPrincipais: analysis?.temas_principais ?? [],
        resumo: analysis?.resumo ?? null,
        alertas: analysis?.alertas ?? null,
        recomendacoes: analysis?.recomendacoes ?? [],
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Erro ao reprocessar post:', error)
    return NextResponse.json({ error: 'Erro ao reprocessar post' }, { status: 500 })
  }
}
