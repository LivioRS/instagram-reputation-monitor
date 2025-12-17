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

    const baixo = posts.filter((p) => p?.nivelRisco === 'baixo')?.length ?? 0
    const medio = posts.filter((p) => p?.nivelRisco === 'medio')?.length ?? 0
    const alto = posts.filter((p) => p?.nivelRisco === 'alto')?.length ?? 0

    const data = [
      { name: 'Baixo', count: baixo },
      { name: 'Médio', count: medio },
      { name: 'Alto', count: alto },
    ]

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar dados de risco:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
