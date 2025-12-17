'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Loader2, CheckCircle, XCircle, AlertCircle, Link2, User } from 'lucide-react'
import { toast } from 'sonner'

interface LogEntry {
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
}

interface ColetaResult {
  totalColetado: number
  novosAnalisados: number
  alertasGerados: number
  tempoExecucao: number
}

export default function ColetaContent() {
  const [collecting, setCollecting] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [result, setResult] = useState<ColetaResult | null>(null)
  const [collectionMode, setCollectionMode] = useState<'profile' | 'single'>('profile')
  const [postUrl, setPostUrl] = useState('')

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        type,
        message,
      },
    ])
  }

  const handleCollect = async () => {
    try {
      // Validar URL se estiver em modo single
      if (collectionMode === 'single') {
        if (!postUrl.trim()) {
          toast.error('Por favor, insira o link do post')
          return
        }
        if (!postUrl.includes('instagram.com')) {
          toast.error('Link inválido. Use um link do Instagram')
          return
        }
      }

      setCollecting(true)
      setLogs([])
      setResult(null)
      
      addLog('info', 'Iniciando coleta de posts...')

      const response = await fetch('/api/coleta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: collectionMode,
          postUrl: collectionMode === 'single' ? postUrl : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.message ?? 'Erro ao iniciar coleta')
      }

      // Processar stream de logs
      const reader = response?.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines?.pop() ?? ''

        for (const line of lines) {
          if (!line?.trim()) continue
          
          try {
            const data = JSON.parse(line)
            
            if (data?.type === 'log') {
              addLog(data?.level ?? 'info', data?.message ?? '')
            } else if (data?.type === 'result') {
              setResult(data?.data ?? null)
              toast.success('Coleta finalizada com sucesso!')
            }
          } catch (e) {
            console.error('Erro ao processar linha:', e)
          }
        }
      }
    } catch (error: any) {
      console.error('Erro na coleta:', error)
      addLog('error', error?.message ?? 'Erro desconhecido')
      toast.error('Erro ao executar coleta')
    } finally {
      setCollecting(false)
    }
  }

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <div className="w-2 h-2 rounded-full bg-blue-600" />
    }
  }

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-700'
      case 'error':
        return 'text-red-700'
      case 'warning':
        return 'text-yellow-700'
      default:
        return 'text-slate-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Card */}
      <Card>
        <CardHeader>
          <CardTitle>Executar Coleta Manual</CardTitle>
          <CardDescription>
            Colete e analise posts do Instagram manualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Modo de Coleta */}
          <div className="space-y-3">
            <Label>Modo de Coleta</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setCollectionMode('profile')}
                disabled={collecting}
                className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  collectionMode === 'profile'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                } ${collecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <User className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Perfil Inteiro</div>
                  <div className="text-xs text-gray-500">Últimos posts do perfil</div>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setCollectionMode('single')}
                disabled={collecting}
                className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  collectionMode === 'single'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                } ${collecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Link2 className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-semibold">Post Específico</div>
                  <div className="text-xs text-gray-500">Analisar um post</div>
                </div>
              </button>
            </div>
          </div>

          {/* Campo de URL (quando modo single) */}
          {collectionMode === 'single' && (
            <div className="space-y-2">
              <Label htmlFor="postUrl">Link do Post do Instagram</Label>
              <Input
                id="postUrl"
                type="url"
                placeholder="https://www.instagram.com/p/ABC123xyz/"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                disabled={collecting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Cole o link completo do post que você quer analisar
              </p>
            </div>
          )}

          {/* Informação sobre perfil */}
          {collectionMode === 'profile' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <strong>📌 Perfil configurado:</strong> Você pode alterar o perfil a ser monitorado em{' '}
              <a href="/configuracoes" className="underline font-semibold">
                Configurações
              </a>
            </div>
          )}

          {/* Botão de Coleta */}
          <Button
            onClick={handleCollect}
            disabled={collecting}
            size="lg"
            className="w-full"
          >
            {collecting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Coletando...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                {collectionMode === 'profile' ? 'Coletar Posts do Perfil' : 'Analisar Post'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logs */}
      {(logs?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Log de Execução</CardTitle>
            <CardDescription>Acompanhe o progresso da coleta em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-xs text-slate-500 font-mono mt-0.5 w-20 flex-shrink-0">
                    {log?.timestamp ?? ''}
                  </span>
                  <div className="flex-shrink-0 mt-1">
                    {getLogIcon(log?.type ?? 'info')}
                  </div>
                  <p className={`text-sm ${getLogColor(log?.type ?? 'info')} flex-1`}>
                    {log?.message ?? ''}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo da Coleta</CardTitle>
            <CardDescription>Estatísticas da coleta finalizada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium mb-1">Total Coletado</p>
                <p className="text-3xl font-bold text-blue-900">{result?.totalColetado ?? 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium mb-1">Novos Analisados</p>
                <p className="text-3xl font-bold text-green-900">{result?.novosAnalisados ?? 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600 font-medium mb-1">Alertas Gerados</p>
                <p className="text-3xl font-bold text-red-900">{result?.alertasGerados ?? 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium mb-1">Tempo (seg)</p>
                <p className="text-3xl font-bold text-purple-900">{result?.tempoExecucao ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
