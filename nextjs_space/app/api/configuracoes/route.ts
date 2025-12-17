import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { configSchema, validateData } from '@/lib/validations'
import { ApiError, createErrorResponse } from '@/lib/api-error'

export const dynamic = 'force-dynamic'

const DEFAULT_CONFIG = {
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
  coletaQuantidade: '30',
  alertasAtivos: true,
  alertasRiscoMinimo: 'alto',
  alertasSentimentoMinimo: '40',
}

/**
 * GET /api/configuracoes
 * Retorna todas as configurações do sistema
 */
export async function GET() {
  try {
    const configs = await prisma.configuracao.findMany()
    
    const configMap: any = { ...DEFAULT_CONFIG }
    
    for (const config of configs) {
      const key = config?.chave ?? ''
      let value: any = config?.valor ?? ''
      
      if (config?.tipo === 'boolean') {
        value = value === 'true'
      } else if (config?.tipo === 'number') {
        value = parseFloat(value)
      }
      
      configMap[key] = value
    }

    return NextResponse.json(configMap)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }
}

/**
 * POST /api/configuracoes
 * Salva ou atualiza configurações do sistema
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar configurações (permitir parcial)
    const validation = validateData(configSchema.partial(), body)
    
    if (!validation.success) {
      throw new ApiError(400, validation.error, 'VALIDATION_ERROR')
    }

    const configEntries = Object.entries(validation.data)

    for (const [key, value] of configEntries) {
      let tipo = 'string'
      let valorString = String(value ?? '')

      if (typeof value === 'boolean') {
        tipo = 'boolean'
        valorString = value ? 'true' : 'false'
      } else if (typeof value === 'number') {
        tipo = 'number'
        valorString = String(value)
      }

      await prisma.configuracao.upsert({
        where: { chave: key },
        update: {
          valor: valorString,
          tipo,
        },
        create: {
          chave: key,
          valor: valorString,
          tipo,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorResponse = createErrorResponse(error, 'Erro ao salvar configurações')
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode || 500 }
    )
  }
}
