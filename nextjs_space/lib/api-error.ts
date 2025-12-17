/**
 * Utilitários para tratamento de erros nas APIs
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Cria uma resposta de erro padronizada
 */
export function createErrorResponse(error: unknown, defaultMessage = 'Erro interno do servidor') {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      error: error.message || defaultMessage,
      statusCode: 500,
    }
  }

  return {
    error: defaultMessage,
    statusCode: 500,
  }
}

/**
 * Wrapper para rotas da API com tratamento de erro
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (error) {
      const errorResponse = createErrorResponse(error)
      return Response.json(
        { error: errorResponse.error, code: errorResponse.code, details: errorResponse.details },
        { status: errorResponse.statusCode || 500 }
      )
    }
  }
}

