import { z } from 'zod'

/**
 * Schemas de validação para as APIs
 */

// Schema para criação/atualização de perfil
export const profileSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório').max(50, 'Username muito longo'),
  displayName: z.string().optional(),
})

// Schema para configurações
export const configSchema = z.object({
  empresaNome: z.string().optional(),
  instagramUsername: z.string().optional(),
  instagramMetodo: z.enum(['apify', 'graph_api']).optional(),
  instagramAccessToken: z.string().optional(),
  apifyApiKey: z.string().optional(),
  claudeModel: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
  coletaAtiva: z.boolean().optional(),
  coletaIntervalo: z.string().optional(),
  coletaQuantidade: z.string().optional(),
  alertasAtivos: z.boolean().optional(),
  alertasRiscoMinimo: z.enum(['baixo', 'medio', 'alto']).optional(),
  alertasSentimentoMinimo: z.string().optional(),
})

// Schema para análise de post
export const analysisRequestSchema = z.object({
  postUrl: z.string().url('URL inválida'),
  legenda: z.string().optional(),
  curtidas: z.number().int().min(0).optional(),
  comentarios: z.number().int().min(0).optional(),
  empresa: z.string().optional(),
})

// Schema para atualização de alerta
export const alertUpdateSchema = z.object({
  statusAlerta: z.enum(['pendente', 'em_analise', 'resolvido']).optional(),
  alertaResolvido: z.boolean().optional(),
})

// Schema para coleta
export const collectionRequestSchema = z.object({
  mode: z.enum(['profile', 'single']).optional(),
  postUrl: z.string().url('URL inválida').optional(),
})

// Schema para teste do Instagram
export const testInstagramSchema = z.object({
  instagramMetodo: z.enum(['apify', 'graph']),
  instagramAccessToken: z.string().optional(),
  instagramUsername: z.string().optional(),
})

// Schema para teste do Telegram
export const testTelegramSchema = z.object({
  telegramBotToken: z.string().min(1, 'Token do bot é obrigatório'),
  telegramChatId: z.string().min(1, 'Chat ID é obrigatório'),
})

/**
 * Função helper para validar dados
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { 
        success: false, 
        error: firstError?.message || 'Dados inválidos' 
      }
    }
    return { success: false, error: 'Erro de validação' }
  }
}

