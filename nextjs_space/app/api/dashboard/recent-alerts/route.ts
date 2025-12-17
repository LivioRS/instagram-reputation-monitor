import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request?.url ?? '')
    const period = searchParams?.get('period') ?? '30'
    const limit = parseInt(searchParams?.get('limit') ?? '5')

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

    const alerts = await prisma.instagramPost.findMany({
      where: {
        ...dateFilter,
        OR: [
          { nivelRisco: 'alto' },
          { sentimentoNegativo: { gte: 40 } },
        ],
      },
      orderBy: {
        dataPublicacao: 'desc',
      },
      take: limit,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Erro ao buscar alertas recentes:', error)
    return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 })
  }
}
