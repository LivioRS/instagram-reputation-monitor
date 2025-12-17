'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Check, User, Calendar, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
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

export default function PerfilContent() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [newUsername, setNewUsername] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleteProfile, setDeleteProfile] = useState<Profile | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [maxProfiles, setMaxProfiles] = useState(30)
  const [canAddMore, setCanAddMore] = useState(true)

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/perfis')
      if (!response.ok) throw new Error('Erro ao carregar perfis')
      
      const data = await response.json()
      setProfiles(data.profiles || [])
      setMaxProfiles(data.maxProfiles || 30)
      setCanAddMore(data.canAddMore !== false)
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

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const cleanUsername = newUsername.replace('@', '').trim()
    if (!cleanUsername) {
      toast.error('Digite um username válido')
      return
    }

    setAdding(true)
    try {
      const response = await fetch('/api/perfis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao adicionar perfil')
      }

      toast.success('Perfil adicionado com sucesso!')
      setNewUsername('')
      await loadProfiles()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar perfil')
    } finally {
      setAdding(false)
    }
  }

  const handleActivateProfile = async (profileId: string, username: string) => {
    try {
      const response = await fetch(`/api/perfis/${profileId}`, {
        method: 'PUT'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao ativar perfil')
      }

      toast.success(`Perfil @${username} ativado!`)
      await loadProfiles()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao ativar perfil')
    }
  }

  const handleDeleteProfile = async () => {
    if (!deleteProfile) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/perfis/${deleteProfile.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao deletar perfil')
      }

      toast.success(`Perfil @${deleteProfile.username} deletado!`)
      setDeleteProfile(null)
      await loadProfiles()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao deletar perfil')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca'
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Carregando perfis...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Add Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Perfil</CardTitle>
          <CardDescription>
            {profiles.length} de {maxProfiles} perfis criados
            {!canAddMore && (
              <span className="text-red-500 block mt-1">
                Limite máximo atingido
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProfile} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="username" className="sr-only">Username do Instagram</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite o username (ex: nike)"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={adding || !canAddMore}
                className="font-mono"
              />
            </div>
            <Button
              type="submit"
              disabled={adding || !canAddMore || !newUsername.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {adding ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Profiles List */}
      <Card>
        <CardHeader>
          <CardTitle>Perfis Cadastrados</CardTitle>
          <CardDescription>
            Gerencie seus perfis do Instagram. Apenas um perfil pode estar ativo por vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {profiles.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhum perfil cadastrado ainda. Adicione um perfil acima.
              </div>
            ) : (
              profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    profile.isActive ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      profile.isActive ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <User className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">@{profile.username}</h3>
                        {profile.isActive && (
                          <Badge className="bg-blue-600">
                            <Check className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{profile.postsCount} posts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Última coleta: {formatDate(profile.lastCollectAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!profile.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivateProfile(profile.id, profile.username)}
                        className="gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Ativar
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteProfile(profile)}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={profiles.length === 1}
                      title={profiles.length === 1 ? 'Não é possível deletar o único perfil' : 'Deletar perfil'}
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProfile} onOpenChange={() => setDeleteProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar perfil @{deleteProfile?.username}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Esta ação não pode ser desfeita. Isso irá:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Deletar permanentemente o perfil @{deleteProfile?.username}</li>
                <li>Deletar TODOS os {deleteProfile?.postsCount} posts deste perfil</li>
                <li>Deletar TODOS os alertas relacionados</li>
              </ul>
              <p className="text-red-600 font-semibold mt-4">
                Todos os dados serão perdidos permanentemente!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deletando...' : 'Deletar Perfil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
