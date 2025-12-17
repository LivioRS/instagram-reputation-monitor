'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Plus, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Profile {
  id: string
  username: string
  displayName: string | null
  isActive: boolean
  postsCount: number
  lastCollectAt: Date | null
  createdAt: Date
  updatedAt: Date
}

interface ProfileSelectorProps {
  onProfileChange?: () => void
}

export function ProfileSelector({ onProfileChange }: ProfileSelectorProps) {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/perfis')
      if (!response.ok) throw new Error('Erro ao carregar perfis')
      
      const data = await response.json()
      setProfiles(data.profiles || [])
      setActiveProfile(data.activeProfile || null)
    } catch (error) {
      console.error('Erro ao carregar perfis:', error)
      toast.error('Erro ao carregar perfis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const handleSwitchProfile = async (profileId: string) => {
    if (switching) return
    
    try {
      setSwitching(true)
      const response = await fetch(`/api/perfis/${profileId}`, {
        method: 'PUT'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao trocar perfil')
      }

      const data = await response.json()
      toast.success(`Perfil alterado para @${data.profile.username}`)
      
      // Recarregar perfis e notificar mudança
      await loadProfiles()
      onProfileChange?.()
      
      // Recarregar a página para atualizar todos os dados
      router.refresh()
    } catch (error) {
      console.error('Erro ao trocar perfil:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao trocar perfil')
    } finally {
      setSwitching(false)
    }
  }

  const handleManageProfiles = () => {
    router.push('/perfis')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
        <User className="w-4 h-4 animate-pulse" />
        <span>Carregando...</span>
      </div>
    )
  }

  if (!activeProfile) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleManageProfiles}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Adicionar Perfil
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 min-w-[180px] justify-between"
          disabled={switching}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <User className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">@{activeProfile.username}</span>
          </div>
          <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel className="text-xs text-gray-500">
          Perfil Ativo ({profiles.length} de 30)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-[300px] overflow-y-auto">
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => {
                if (profile.id !== activeProfile?.id) {
                  handleSwitchProfile(profile.id)
                }
              }}
              className="flex items-center justify-between cursor-pointer"
              disabled={profile.id === activeProfile?.id || switching}
            >
              <div className="flex items-center gap-2 flex-1 overflow-hidden">
                <User className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">@{profile.username}</span>
                  <span className="text-xs text-gray-500">
                    {profile.postsCount} posts
                  </span>
                </div>
              </div>
              {profile.isActive && (
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleManageProfiles}
          className="gap-2 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          Gerenciar Perfis
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
