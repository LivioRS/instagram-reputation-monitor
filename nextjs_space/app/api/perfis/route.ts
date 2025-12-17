import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { profileSchema, validateData } from '@/lib/validations'
import { ApiError, createErrorResponse } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

const MAX_PROFILES = 30

/**
 * GET /api/perfis
 * Lista todos os perfis cadastrados
 */
export async function GET() {
  try {
    const profiles = await prisma.profile.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Atualizar contagem de posts para cada perfil
    const profilesWithCounts = await Promise.all(
      profiles.map(async (profile) => {
        const postsCount = await prisma.instagramPost.count({
          where: { username: profile.username }
        })
        
        // Atualizar no banco se diferente
        if (postsCount !== profile.postsCount) {
          await prisma.profile.update({
            where: { id: profile.id },
            data: { postsCount }
          })
        }

        return {
          ...profile,
          postsCount
        }
      })
    )

    const activeProfile = profilesWithCounts.find(p => p.isActive)

    return NextResponse.json({
      profiles: profilesWithCounts,
      activeProfile,
      total: profilesWithCounts.length,
      maxProfiles: MAX_PROFILES,
      canAddMore: profilesWithCounts.length < MAX_PROFILES
    })
  } catch (error) {
    console.error('Erro ao listar perfis:', error)
    const errorResponse = createErrorResponse(error, 'Erro ao listar perfis')
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode || 500 }
    )
  }
}

/**
 * POST /api/perfis
 * Cria um novo perfil do Instagram
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateData(profileSchema, body)

    if (!validation.success) {
      throw new ApiError(400, validation.error, 'VALIDATION_ERROR')
    }

    const { username } = validation.data

    // Limpar username (remover @ se tiver)
    const cleanUsername = username.replace('@', '').trim().toLowerCase()

    if (!cleanUsername || cleanUsername.length < 1) {
      throw new ApiError(400, 'Username inválido', 'INVALID_USERNAME')
    }

    // Verificar limite de perfis
    const count = await prisma.profile.count()
    if (count >= MAX_PROFILES) {
      throw new ApiError(400, `Limite de ${MAX_PROFILES} perfis atingido`, 'MAX_PROFILES_REACHED')
    }

    // Verificar se já existe
    const existing = await prisma.profile.findUnique({
      where: { username: cleanUsername }
    })

    if (existing) {
      throw new ApiError(400, 'Perfil já existe', 'PROFILE_EXISTS')
    }

    // Criar perfil
    const profile = await prisma.profile.create({
      data: {
        username: cleanUsername,
        displayName: `@${cleanUsername}`,
        isActive: false,
        postsCount: 0
      }
    })

    return NextResponse.json({
      message: 'Perfil criado com sucesso',
      profile
    })
  } catch (error) {
    const errorResponse = createErrorResponse(error, 'Erro ao criar perfil')
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode || 500 }
    )
  }
}
