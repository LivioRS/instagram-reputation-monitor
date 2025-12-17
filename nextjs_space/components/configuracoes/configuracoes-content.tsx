'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Config {
  // Empresa
  empresaNome: string
  instagramUsername: string
  
  // Instagram
  instagramMetodo: string
  instagramAccessToken: string
  apifyApiKey: string
  apifyTaskId: string
  
  // Claude
  claudeModel: string
  
  // Telegram
  telegramBotToken: string
  telegramChatId: string
  
  // Coleta
  coletaAtiva: boolean
  coletaIntervalo: string
  coletaQuantidade: string
  
  // Alertas
  alertasAtivos: boolean
  alertasRiscoMinimo: string
  alertasSentimentoMinimo: string
}

export default function ConfiguracoesContent() {
  const [config, setConfig] = useState<Config>({
    empresaNome: 'PHX Instrumentos',
    instagramUsername: '',
    instagramMetodo: 'apify',
    instagramAccessToken: '',
    apifyApiKey: '',
    apifyTaskId: '',
    claudeModel: 'claude-sonnet-4-20250514',
    telegramBotToken: '',
    telegramChatId: '',
    coletaAtiva: false,
    coletaIntervalo: '24',
    coletaQuantidade: '10',
    alertasAtivos: true,
    alertasRiscoMinimo: 'alto',
    alertasSentimentoMinimo: '40',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/configuracoes')
      if (res.ok) {
        const data = await res.json()
        setConfig({ ...config, ...data })
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/configuracoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        toast.success('Configurações salvas com sucesso!')
      } else {
        toast.error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async (type: string) => {
    try {
      setTesting(type)
      const res = await fetch(`/api/configuracoes/test-${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        toast.success(`Teste de ${type} realizado com sucesso!`)
      } else {
        const data = await res.json()
        toast.error(data?.error ?? 'Erro no teste')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao realizar teste')
    } finally {
      setTesting(null)
    }
  }

  if (loading) {
    return <div className="py-8">Carregando configurações...</div>
  }

  return (
    <div className="space-y-6">
      {/* Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Empresa</CardTitle>
          <CardDescription>Informações básicas da empresa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="empresaNome">Nome da Empresa</Label>
            <Input
              id="empresaNome"
              value={config?.empresaNome ?? ''}
              onChange={(e) => setConfig({ ...config, empresaNome: e?.target?.value ?? '' })}
              placeholder="PHX Instrumentos"
            />
          </div>
          <div>
            <Label htmlFor="instagramUsername">Username do Instagram</Label>
            <Input
              id="instagramUsername"
              value={config?.instagramUsername ?? ''}
              onChange={(e) => setConfig({ ...config, instagramUsername: e?.target?.value ?? '' })}
              placeholder="@phxinstrumentos"
            />
          </div>
        </CardContent>
      </Card>

      {/* Instagram API */}
      <Card>
        <CardHeader>
          <CardTitle>Instagram API</CardTitle>
          <CardDescription>Configure o método de coleta do Instagram</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="instagramMetodo">Método de Coleta</Label>
            <Select
              value={config?.instagramMetodo ?? 'apify'}
              onValueChange={(value) => setConfig({ ...config, instagramMetodo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apify">Apify Scraper</SelectItem>
                <SelectItem value="graph">Graph API (Oficial)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config?.instagramMetodo === 'graph' ? (
            <div>
              <Label htmlFor="instagramAccessToken">Access Token</Label>
              <Input
                id="instagramAccessToken"
                type="password"
                value={config?.instagramAccessToken ?? ''}
                onChange={(e) => setConfig({ ...config, instagramAccessToken: e?.target?.value ?? '' })}
                placeholder="Seu access token da Graph API"
              />
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="apifyApiKey">Apify API Key</Label>
                <Input
                  id="apifyApiKey"
                  type="password"
                  value={config?.apifyApiKey ?? ''}
                  onChange={(e) => setConfig({ ...config, apifyApiKey: e?.target?.value ?? '' })}
                  placeholder="Sua chave de API do Apify"
                />
              </div>
              <div>
                <Label htmlFor="apifyTaskId">Apify Task ID</Label>
                <Input
                  id="apifyTaskId"
                  value={config?.apifyTaskId ?? ''}
                  onChange={(e) => setConfig({ ...config, apifyTaskId: e?.target?.value ?? '' })}
                  placeholder="ID da task do Apify"
                />
              </div>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => handleTest('instagram')}
            disabled={testing === 'instagram'}
          >
            {testing === 'instagram' ? 'Testando...' : 'Testar Conexão'}
          </Button>
        </CardContent>
      </Card>

      {/* Claude API */}
      <Card>
        <CardHeader>
          <CardTitle>Claude API (Anthropic)</CardTitle>
          <CardDescription>Configurações da API de análise - A chave está pré-configurada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              A chave da API Claude já está configurada e pronta para uso. Você pode alterar apenas o modelo se necessário.
            </p>
          </div>
          <div>
            <Label htmlFor="claudeModel">Modelo</Label>
            <Select
              value={config?.claudeModel ?? 'claude-sonnet-4-20250514'}
              onValueChange={(value) => setConfig({ ...config, claudeModel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Telegram */}
      <Card>
        <CardHeader>
          <CardTitle>Telegram</CardTitle>
          <CardDescription>Configure o bot do Telegram para envio de alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="telegramBotToken">Bot Token</Label>
            <Input
              id="telegramBotToken"
              type="password"
              value={config?.telegramBotToken ?? ''}
              onChange={(e) => setConfig({ ...config, telegramBotToken: e?.target?.value ?? '' })}
              placeholder="Token do bot do Telegram"
            />
          </div>
          <div>
            <Label htmlFor="telegramChatId">Chat ID</Label>
            <Input
              id="telegramChatId"
              value={config?.telegramChatId ?? ''}
              onChange={(e) => setConfig({ ...config, telegramChatId: e?.target?.value ?? '' })}
              placeholder="ID do chat"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => handleTest('telegram')}
            disabled={testing === 'telegram'}
          >
            {testing === 'telegram' ? 'Enviando...' : 'Enviar Mensagem de Teste'}
          </Button>
        </CardContent>
      </Card>

      {/* Coleta Automática */}
      <Card>
        <CardHeader>
          <CardTitle>Coleta Automática</CardTitle>
          <CardDescription>Agende coletas periódicas de posts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="coletaAtiva">Ativar coleta automática</Label>
            <Switch
              id="coletaAtiva"
              checked={config?.coletaAtiva ?? false}
              onCheckedChange={(checked) => setConfig({ ...config, coletaAtiva: checked })}
            />
          </div>
          <div>
            <Label htmlFor="coletaIntervalo">Intervalo de Coleta</Label>
            <Select
              value={config?.coletaIntervalo ?? '24'}
              onValueChange={(value) => setConfig({ ...config, coletaIntervalo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hora</SelectItem>
                <SelectItem value="2">2 horas</SelectItem>
                <SelectItem value="4">4 horas</SelectItem>
                <SelectItem value="6">6 horas</SelectItem>
                <SelectItem value="12">12 horas</SelectItem>
                <SelectItem value="24">24 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="coletaQuantidade">Quantidade de Posts por Coleta</Label>
            <Input
              id="coletaQuantidade"
              type="number"
              value={config?.coletaQuantidade ?? '10'}
              onChange={(e) => setConfig({ ...config, coletaQuantidade: e?.target?.value ?? '10' })}
              placeholder="10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
          <CardDescription>Configure os critérios para envio de alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="alertasAtivos">Ativar alertas no Telegram</Label>
            <Switch
              id="alertasAtivos"
              checked={config?.alertasAtivos ?? true}
              onCheckedChange={(checked) => setConfig({ ...config, alertasAtivos: checked })}
            />
          </div>
          <div>
            <Label htmlFor="alertasRiscoMinimo">Nível de risco mínimo</Label>
            <Select
              value={config?.alertasRiscoMinimo ?? 'alto'}
              onValueChange={(value) => setConfig({ ...config, alertasRiscoMinimo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="alertasSentimentoMinimo">Sentimento negativo mínimo (%)</Label>
            <Input
              id="alertasSentimentoMinimo"
              type="number"
              value={config?.alertasSentimentoMinimo ?? '40'}
              onChange={(e) => setConfig({ ...config, alertasSentimentoMinimo: e?.target?.value ?? '40' })}
              placeholder="40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
