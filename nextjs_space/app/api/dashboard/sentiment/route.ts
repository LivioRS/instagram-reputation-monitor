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

    if (totalPosts === 0) {
      return NextResponse.json([])
    }

    const avgPositivo = posts.reduce((sum: number, p: any) => sum + (p?.sentimentoPositivo ?? 0), 0) / totalPosts
    const avgNeutro = posts.reduce((sum: number, p: any) => sum + (p?.sentimentoNeutro ?? 0), 0) / totalPosts
    const avgNegativo = posts.reduce((sum: number, p: any) => sum + (p?.sentimentoNegativo ?? 0), 0) / totalPosts

    const data = [
      { name: 'Positivo', value: parseFloat(avgPositivo.toFixed(1)) },
      { name: 'Neutro', value: parseFloat(avgNeutro.toFixed(1)) },
      { name: 'Negativo', value: parseFloat(avgNegativo.toFixed(1)) },
    ]

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar dados de sentimento:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
