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
      orderBy: {
        dataPublicacao: 'asc',
      },
    })

    if (!posts?.length) {
      return NextResponse.json([])
    }

    const data = posts.map((post) => ({
      date: new Date(post?.dataPublicacao ?? new Date()).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      score: parseFloat((post?.scoreReputacao ?? 0).toFixed(1)),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar dados de reputação:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
