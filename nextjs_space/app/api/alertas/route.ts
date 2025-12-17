import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const alerts = await prisma.instagramPost.findMany({
      where: {
        OR: [
          { nivelRisco: 'alto' },
          { nivelRisco: 'medio' },
          { sentimentoNegativo: { gte: 40 } },
        ],
      },
      orderBy: {
        dataPublicacao: 'desc',
      },
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Erro ao buscar alertas:', error)
    return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 })
  }
}
