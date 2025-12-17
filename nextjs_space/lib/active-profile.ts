import prisma from '@/lib/db'

/**
 * Retorna o perfil ativo atual
 * Se nenhum perfil estiver ativo, retorna o primeiro perfil encontrado
 */
export async function getActiveProfile() {
  try {
    // Buscar perfil ativo
    let activeProfile = await prisma.profile.findFirst({
      where: { isActive: true }
    })

    // Se não houver perfil ativo, pegar o primeiro
    if (!activeProfile) {
      activeProfile = await prisma.profile.findFirst({
        orderBy: { createdAt: 'asc' }
      })

      // Se encontrou, ativar
      if (activeProfile) {
        await prisma.profile.update({
          where: { id: activeProfile.id },
          data: { isActive: true }
        })
        activeProfile.isActive = true
      }
    }

    return activeProfile
  } catch (error) {
    console.error('Erro ao buscar perfil ativo:', error)
    return null
  }
}

/**
 * Retorna o username do perfil ativo
 * Se não houver perfil ativo, retorna o username das configurações ou um default
 */
export async function getActiveUsername(): Promise<string> {
  const profile = await getActiveProfile()
  
  if (profile) {
    return profile.username
  }

  // Fallback: buscar das configurações
  try {
    const config = await prisma.configuracao.findUnique({
      where: { chave: 'instagramUsername' }
    })
    
    if (config?.valor) {
      return config.valor
    }
  } catch (error) {
    console.error('Erro ao buscar username das configurações:', error)
  }

  // Último fallback
  return 'phxinstrumentos'
}
