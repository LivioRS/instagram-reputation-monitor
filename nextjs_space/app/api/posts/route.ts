import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getActiveUsername } from '@/lib/active-profile'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request?.url ?? '')
    const period = searchParams?.get('period') ?? '30'
    
    // Obter username do perfil ativo
    const activeUsername = await getActiveUsername()

    let whereFilter: any = {
      username: activeUsername  // Filtrar apenas posts do perfil ativo
    }
    
    if (period !== 'all') {
      const days = parseInt(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      whereFilter.dataPublicacao = {
        gte: startDate,
      }
    }

    const posts = await prisma.instagramPost.findMany({
      where: whereFilter,
      orderBy: {
        dataPublicacao: 'desc',
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    return NextResponse.json({ error: 'Erro ao buscar posts' }, { status: 500 })
  }
}
