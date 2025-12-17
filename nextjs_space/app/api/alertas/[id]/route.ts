import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { statusAlerta } = body

    const updatedPost = await prisma.instagramPost.update({
      where: { id },
      data: {
        statusAlerta: statusAlerta ?? 'pendente',
        alertaResolvido: statusAlerta === 'resolvido',
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Erro ao atualizar alerta:', error)
    return NextResponse.json({ error: 'Erro ao atualizar alerta' }, { status: 500 })
  }
}
