import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { alertUpdateSchema, validateData } from '@/lib/validations'
import { ApiError, createErrorResponse } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

/**
 * PATCH /api/alertas/[id]
 * Atualiza o status de um alerta
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validation = validateData(alertUpdateSchema, body)

    if (!validation.success) {
      throw new ApiError(400, validation.error, 'VALIDATION_ERROR')
    }

    const { statusAlerta } = validation.data

    // Verificar se o post existe
    const post = await prisma.instagramPost.findUnique({
      where: { id }
    })

    if (!post) {
      throw new ApiError(404, 'Post não encontrado', 'POST_NOT_FOUND')
    }

    const updatedPost = await prisma.instagramPost.update({
      where: { id },
      data: {
        statusAlerta: statusAlerta ?? 'pendente',
        alertaResolvido: statusAlerta === 'resolvido',
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    const errorResponse = createErrorResponse(error, 'Erro ao atualizar alerta')
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode || 500 }
    )
  }
}
