import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request?.url ?? '')
    const period = searchParams?.get('period') ?? '30'

    let dateFilter: any = {}
    if (period !== 'all') {
      const days = parseInt(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      dateFilter = {
        dataPublicacao: {
          gte: startDate,
        },
      }
    }

    const posts = await prisma.instagramPost.findMany({
      where: dateFilter,
    })

    const totalPosts = posts?.length ?? 0
    const avgScore =
      totalPosts > 0
        ? posts.reduce((sum: number, p: any) => sum + (p?.scoreReputacao ?? 0), 0) / totalPosts
        : 0

    const highRiskPosts = posts.filter((p) => p?.nivelRisco === 'alto')?.length ?? 0

    const avgSentiment = {
      positivo:
        totalPosts > 0
          ? posts.reduce((sum: number, p: any) => sum + (p?.sentimentoPositivo ?? 0), 0) / totalPosts
          : 0,
      neutro:
        totalPosts > 0
          ? posts.reduce((sum: number, p: any) => sum + (p?.sentimentoNeutro ?? 0), 0) / totalPosts
          : 0,
      negativo:
        totalPosts > 0
          ? posts.reduce((sum: number, p: any) => sum + (p?.sentimentoNegativo ?? 0), 0) / totalPosts
          : 0,
    }

    return NextResponse.json({
      totalPosts,
      avgScore,
      highRiskPosts,
      avgSentiment,
    })
  } catch (error) {
    console.error('Erro ao buscar stats:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}
