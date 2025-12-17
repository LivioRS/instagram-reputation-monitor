import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

const MAX_PROFILES = 30

// GET /api/perfis - Lista todos os perfis
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
    return NextResponse.json(
      { error: 'Erro ao listar perfis' },
      { status: 500 }
    )
  }
}

// POST /api/perfis - Cria novo perfil
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username é obrigatório' },
        { status: 400 }
      )
    }

    // Limpar username (remover @ se tiver)
    const cleanUsername = username.replace('@', '').trim().toLowerCase()

    if (!cleanUsername) {
      return NextResponse.json(
        { error: 'Username inválido' },
        { status: 400 }
      )
    }

    // Verificar limite de perfis
    const count = await prisma.profile.count()
    if (count >= MAX_PROFILES) {
      return NextResponse.json(
        { error: `Limite de ${MAX_PROFILES} perfis atingido` },
        { status: 400 }
      )
    }

    // Verificar se já existe
    const existing = await prisma.profile.findUnique({
      where: { username: cleanUsername }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Perfil já existe' },
        { status: 400 }
      )
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
    console.error('Erro ao criar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao criar perfil' },
      { status: 500 }
    )
  }
}
