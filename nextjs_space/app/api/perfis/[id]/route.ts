import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

// PUT /api/perfis/[id] - Ativa um perfil
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se perfil existe
    const profile = await prisma.profile.findUnique({
      where: { id }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }

    // Desativar todos os outros perfis
    await prisma.profile.updateMany({
      where: { id: { not: id } },
      data: { isActive: false }
    })

    // Ativar este perfil
    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: { isActive: true }
    })

    // Atualizar configuração do sistema
    await prisma.configuracao.upsert({
      where: { chave: 'instagramUsername' },
      update: { valor: profile.username },
      create: {
        chave: 'instagramUsername',
        valor: profile.username,
        tipo: 'string',
        categoria: 'instagram'
      }
    })

    return NextResponse.json({
      message: 'Perfil ativado com sucesso',
      profile: updatedProfile
    })
  } catch (error) {
    console.error('Erro ao ativar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao ativar perfil' },
      { status: 500 }
    )
  }
}

// DELETE /api/perfis/[id] - Deleta perfil e todos os seus posts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se perfil existe
    const profile = await prisma.profile.findUnique({
      where: { id }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      )
    }

    // Não permitir deletar o único perfil
    const totalProfiles = await prisma.profile.count()
    if (totalProfiles <= 1) {
      return NextResponse.json(
        { error: 'Não é possível deletar o único perfil' },
        { status: 400 }
      )
    }

    // Se está ativo, ativar outro perfil primeiro
    if (profile.isActive) {
      const otherProfile = await prisma.profile.findFirst({
        where: { id: { not: id } },
        orderBy: { createdAt: 'asc' }
      })

      if (otherProfile) {
        await prisma.profile.update({
          where: { id: otherProfile.id },
          data: { isActive: true }
        })

        await prisma.configuracao.upsert({
          where: { chave: 'instagramUsername' },
          update: { valor: otherProfile.username },
          create: {
            chave: 'instagramUsername',
            valor: otherProfile.username,
            tipo: 'string',
            categoria: 'instagram'
          }
        })
      }
    }

    // Deletar todos os posts do perfil
    const deletedPosts = await prisma.instagramPost.deleteMany({
      where: { username: profile.username }
    })

    // Deletar o perfil
    await prisma.profile.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Perfil deletado com sucesso',
      deletedProfile: profile,
      deletedPostsCount: deletedPosts.count
    })
  } catch (error) {
    console.error('Erro ao deletar perfil:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar perfil' },
      { status: 500 }
    )
  }
}
