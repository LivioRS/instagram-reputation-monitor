import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getActiveUsername } from '@/lib/active-profile'

export const dynamic = 'force-dynamic'

interface LogData {
  type: 'log'
  level: 'info' | 'success' | 'error' | 'warning'
  message: string
}

interface ResultData {
  type: 'result'
  data: {
    totalColetado: number
    novosAnalisados: number
    alertasGerados: number
    tempoExecucao: number
  }
}

type StreamData = LogData | ResultData

function sendLog(controller: ReadableStreamDefaultController, data: StreamData) {
  const encoder = new TextEncoder()
  controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  // Ler body para pegar modo e URL (se aplicável)
  let body: any = {}
  try {
    const text = await request.text()
    if (text) {
      body = JSON.parse(text)
    }
  } catch (error) {
    // Ignore se não tiver body
  }

  const collectionMode = body.mode || 'profile' // 'profile' ou 'single'
  const postUrl = body.postUrl

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Criar log de coleta
        const logColeta = await prisma.logColeta.create({
          data: {
            tipoColeta: 'manual',
            status: 'em_andamento',
          },
        })

        sendLog(controller, {
          type: 'log',
          level: 'info',
          message: 'Verificando configurações...',
        })

        // Buscar configurações
        const configs = await prisma.configuracao.findMany()
        const configMap: any = {}
        for (const config of configs) {
          configMap[config?.chave ?? ''] = config?.valor ?? ''
        }

        const {
          empresaNome,
          instagramUsername,
          instagramMetodo,
          coletaQuantidade,
          alertasRiscoMinimo,
          alertasSentimentoMinimo,
        } = configMap

        // Se for modo single, não precisa de username
        if (collectionMode === 'profile' && !instagramUsername) {
          sendLog(controller, {
            type: 'log',
            level: 'error',
            message: 'Username do Instagram não configurado',
          })
          await prisma.logColeta.update({
            where: { id: logColeta.id },
            data: {
              status: 'erro',
              erros: 'Username do Instagram não configurado',
              finalizadaEm: new Date(),
            },
          })
          controller.close()
          return
        }

        // Se for modo single, validar URL
        if (collectionMode === 'single' && !postUrl) {
          sendLog(controller, {
            type: 'log',
            level: 'error',
            message: 'URL do post não fornecida',
          })
          await prisma.logColeta.update({
            where: { id: logColeta.id },
            data: {
              status: 'erro',
              erros: 'URL do post não fornecida',
              finalizadaEm: new Date(),
            },
          })
          controller.close()
          return
        }

        // Mensagem de coleta
        if (collectionMode === 'single') {
          sendLog(controller, {
            type: 'log',
            level: 'info',
            message: `Analisando post específico...`,
          })
        } else {
          sendLog(controller, {
            type: 'log',
            level: 'info',
            message: `Coletando posts de @${instagramUsername}...`,
          })
        }

        // Coletar posts (real ou mock)
        let collectedPosts: any[] = []
        
        // Modo single: coletar apenas um post
        if (collectionMode === 'single') {
          if (instagramMetodo === 'apify' && configMap['apify_api_token']) {
            sendLog(controller, {
              type: 'log',
              level: 'info',
              message: 'Usando Apify para coletar post...',
            })
            try {
              const singlePost = await collectSinglePostFromApify(
                postUrl,
                configMap['apify_api_token'],
                (message: string) => {
                  sendLog(controller, {
                    type: 'log',
                    level: 'info',
                    message,
                  })
                }
              )
              collectedPosts = [singlePost]
            } catch (error) {
              sendLog(controller, {
                type: 'log',
                level: 'error',
                message: `Erro ao coletar post do Apify: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
              })
              throw error
            }
          } else {
            sendLog(controller, {
              type: 'log',
              level: 'error',
              message: 'Apify não configurado. Necessário para analisar posts específicos.',
            })
            throw new Error('Apify não configurado')
          }
        }
        // Modo profile: coletar múltiplos posts
        else if (instagramMetodo === 'apify' && configMap['apify_api_token']) {
          sendLog(controller, {
            type: 'log',
            level: 'info',
            message: 'Usando Apify para coleta...',
          })
          try {
            collectedPosts = await collectFromApify(
              instagramUsername,
              configMap['apify_api_token'],
              parseInt(coletaQuantidade || '10'),
              (message: string) => {
                sendLog(controller, {
                  type: 'log',
                  level: 'info',
                  message,
                })
              }
            )
          } catch (error) {
            sendLog(controller, {
              type: 'log',
              level: 'error',
              message: `Erro ao coletar do Apify: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            })
            sendLog(controller, {
              type: 'log',
              level: 'info',
              message: 'Usando dados mock como fallback...',
            })
            collectedPosts = await generateMockPosts(instagramUsername, parseInt(coletaQuantidade || '10'))
          }
        } else if (instagramMetodo === 'graph_api' && configMap['instagram_access_token']) {
          sendLog(controller, {
            type: 'log',
            level: 'info',
            message: 'Usando Instagram Graph API para coleta...',
          })
          try {
            collectedPosts = await collectFromGraphAPI(
              configMap['instagram_access_token'],
              parseInt(coletaQuantidade || '10')
            )
          } catch (error) {
            sendLog(controller, {
              type: 'log',
              level: 'error',
              message: `Erro ao coletar do Graph API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            })
            sendLog(controller, {
              type: 'log',
              level: 'info',
              message: 'Usando dados mock como fallback...',
            })
            collectedPosts = await generateMockPosts(instagramUsername, parseInt(coletaQuantidade || '10'))
          }
        } else {
          sendLog(controller, {
            type: 'log',
            level: 'warning',
            message: 'Nenhum método de coleta configurado. Usando dados mock para demonstração...',
          })
          collectedPosts = await generateMockPosts(instagramUsername, parseInt(coletaQuantidade || '10'))
        }

        sendLog(controller, {
          type: 'log',
          level: 'success',
          message: `${collectedPosts?.length ?? 0} posts encontrados`,
        })

        let novosAnalisados = 0
        let alertasGerados = 0

        for (let i = 0; i < (collectedPosts?.length ?? 0); i++) {
          const post = collectedPosts[i]

          sendLog(controller, {
            type: 'log',
            level: 'info',
            message: `Processando post ${i + 1}/${collectedPosts?.length ?? 0}...`,
          })

          // Verificar se já existe
          const existingPost = await prisma.instagramPost.findUnique({
            where: { postId: post?.postId ?? '' },
          })

          if (existingPost) {
            sendLog(controller, {
              type: 'log',
              level: 'warning',
              message: `Post já existe no banco, pulando...`,
            })
            continue
          }

          // Analisar com Claude
          sendLog(controller, {
            type: 'log',
            level: 'info',
            message: 'Analisando sentimento com IA...',
          })

          try {
            const analysisRes = await fetch(
              `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analise`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  postUrl: post.postUrl,
                  legenda: post.legenda,
                  curtidas: post.curtidas,
                  comentarios: post.comentarios,
                  empresa: empresaNome || 'PHX Instrumentos',
                }),
              }
            )

            if (!analysisRes.ok) {
              throw new Error('Erro ao analisar post')
            }

            const analysis = await analysisRes.json()

            // Determinar username do post
            let postUsername = collectionMode === 'single' && postUrl 
              ? (postUrl.match(/@([^/]+)/) || [])[1] || await getActiveUsername()
              : instagramUsername || await getActiveUsername()

            // Salvar no banco
            const savedPost = await prisma.instagramPost.create({
              data: {
                empresa: empresaNome || 'PHX Instrumentos',
                username: postUsername,
                postUrl: post.postUrl,
                postId: post.postId,
                dataPublicacao: post.dataPublicacao,
                legenda: post.legenda,
                tipoConteudo: post.tipoConteudo,
                curtidas: post.curtidas,
                comentarios: post.comentarios,
                compartilhamentos: post.compartilhamentos || 0,
                saves: post.saves || 0,
                thumbnailUrl: post.thumbnailUrl,
                sentimentoPositivo: analysis?.sentimento?.positivo ?? 0,
                sentimentoNeutro: analysis?.sentimento?.neutro ?? 0,
                sentimentoNegativo: analysis?.sentimento?.negativo ?? 0,
                scoreReputacao: analysis?.score_reputacao ?? 0,
                nivelRisco: analysis?.nivel_risco ?? 'baixo',
                temasPrincipais: analysis?.temas_principais ?? [],
                resumo: analysis?.resumo ?? null,
                alertas: analysis?.alertas ?? null,
                recomendacoes: analysis?.recomendacoes ?? [],
              },
            })

            novosAnalisados++

            sendLog(controller, {
              type: 'log',
              level: 'success',
              message: `Post analisado - Score: ${(analysis?.score_reputacao ?? 0).toFixed(1)}, Risco: ${analysis?.nivel_risco ?? 'baixo'}`,
            })

            // Verificar se deve enviar alerta
            const shouldAlert =
              analysis?.nivel_risco === alertasRiscoMinimo ||
              (analysis?.nivel_risco === 'alto' && alertasRiscoMinimo === 'medio') ||
              (analysis?.sentimento?.negativo ?? 0) >= parseFloat(alertasSentimentoMinimo || '40')

            if (shouldAlert) {
              sendLog(controller, {
                type: 'log',
                level: 'warning',
                message: 'Enviando alerta no Telegram...',
              })

              try {
                await fetch(
                  `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/telegram`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      post: savedPost,
                      analysis,
                    }),
                  }
                )
                alertasGerados++
                sendLog(controller, {
                  type: 'log',
                  level: 'success',
                  message: 'Alerta enviado com sucesso',
                })
              } catch (error) {
                sendLog(controller, {
                  type: 'log',
                  level: 'error',
                  message: 'Erro ao enviar alerta',
                })
              }
            }
          } catch (error) {
            console.error('Erro ao processar post:', error)
            sendLog(controller, {
              type: 'log',
              level: 'error',
              message: `Erro ao processar post: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            })
          }
        }

        const endTime = Date.now()
        const duracaoSegundos = Math.floor((endTime - startTime) / 1000)

        // Atualizar log de coleta
        await prisma.logColeta.update({
          where: { id: logColeta.id },
          data: {
            status: 'sucesso',
            totalColetado: collectedPosts?.length ?? 0,
            novosAnalisados,
            alertasGerados,
            duracaoSegundos,
            finalizadaEm: new Date(),
          },
        })

        sendLog(controller, {
          type: 'log',
          level: 'success',
          message: 'Coleta finalizada com sucesso!',
        })

        // Enviar resultado final
        sendLog(controller, {
          type: 'result',
          data: {
            totalColetado: collectedPosts?.length ?? 0,
            novosAnalisados,
            alertasGerados,
            tempoExecucao: duracaoSegundos,
          },
        })

        controller.close()
      } catch (error) {
        console.error('Erro na coleta:', error)
        sendLog(controller, {
          type: 'log',
          level: 'error',
          message: `Erro fatal: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        })
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

// Função para coletar um post específico do Apify
async function collectSinglePostFromApify(
  postUrl: string,
  apiToken: string,
  onProgress: (message: string) => void
) {
  onProgress('Iniciando Apify Actor para post específico...')
  
  // Iniciar o actor do Instagram Scraper para um post específico
  const runResponse = await fetch('https://api.apify.com/v2/acts/apify~instagram-scraper/runs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      directUrls: [postUrl],
      resultsType: 'posts',
      resultsLimit: 1,
    }),
  })

  if (!runResponse.ok) {
    const errorText = await runResponse.text()
    throw new Error(`Falha ao iniciar Apify Actor: ${runResponse.status} - ${errorText}`)
  }

  const runData = await runResponse.json()
  const runId = runData.data.id
  
  onProgress(`Actor iniciado (ID: ${runId}). Aguardando finalização...`)

  // Aguardar finalização do actor (polling)
  let status = 'RUNNING'
  let attempts = 0
  const maxAttempts = 60 // 5 minutos no máximo
  
  while (status === 'RUNNING' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)) // Aguardar 5 segundos
    
    const statusResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    })
    
    if (!statusResponse.ok) {
      throw new Error(`Erro ao verificar status do Apify: ${statusResponse.status}`)
    }
    
    const statusData = await statusResponse.json()
    status = statusData.data.status
    attempts++
    
    onProgress(`Aguardando... (${attempts * 5}s)`)
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify Actor não finalizou com sucesso. Status: ${status}`)
  }

  onProgress('Coletando resultado...')

  // Buscar resultados
  const datasetId = runData.data.defaultDatasetId
  const resultsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
  })

  if (!resultsResponse.ok) {
    throw new Error(`Erro ao buscar resultados do Apify: ${resultsResponse.status}`)
  }

  const results = await resultsResponse.json()
  
  if (!results || results.length === 0) {
    throw new Error('Nenhum resultado retornado pelo Apify. Verifique se o link está correto.')
  }

  onProgress('Post coletado do Apify com sucesso')

  // Converter formato Apify para formato do sistema
  const item = results[0]
  const post = {
    postId: item.id || item.shortCode,
    postUrl: item.url || postUrl,
    dataPublicacao: new Date(item.timestamp || item.timestampParsed || Date.now()),
    legenda: item.caption || '',
    tipoConteudo: item.type === 'Video' ? 'video' : item.type === 'Sidecar' ? 'carousel' : 'image',
    curtidas: item.likesCount || 0,
    comentarios: item.commentsCount || 0,
    compartilhamentos: 0,
    saves: 0,
    thumbnailUrl: item.displayUrl || item.thumbnailUrl || null,
  }

  return post
}

// Função para coletar posts do Apify
async function collectFromApify(
  username: string,
  apiToken: string,
  quantity: number,
  onProgress: (message: string) => void
) {
  onProgress('Iniciando Apify Actor...')
  
  // Iniciar o actor do Instagram Scraper
  const runResponse = await fetch('https://api.apify.com/v2/acts/apify~instagram-scraper/runs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsType: 'posts',
      resultsLimit: quantity,
      searchType: 'user',
      searchLimit: 1,
    }),
  })

  if (!runResponse.ok) {
    const errorText = await runResponse.text()
    throw new Error(`Falha ao iniciar Apify Actor: ${runResponse.status} - ${errorText}`)
  }

  const runData = await runResponse.json()
  const runId = runData.data.id
  
  onProgress(`Actor iniciado (ID: ${runId}). Aguardando finalização...`)

  // Aguardar finalização do actor (polling)
  let status = 'RUNNING'
  let attempts = 0
  const maxAttempts = 60 // 5 minutos no máximo
  
  while (status === 'RUNNING' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)) // Aguardar 5 segundos
    
    const statusResponse = await fetch(`https://api.apify.com/v2/acts/apify~instagram-scraper/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    })
    
    if (!statusResponse.ok) {
      throw new Error(`Erro ao verificar status do Apify: ${statusResponse.status}`)
    }
    
    const statusData = await statusResponse.json()
    status = statusData.data.status
    attempts++
    
    onProgress(`Aguardando... (${attempts * 5}s)`)
  }

  if (status !== 'SUCCEEDED') {
    throw new Error(`Apify Actor não finalizou com sucesso. Status: ${status}`)
  }

  onProgress('Coletando resultados...')

  // Buscar resultados
  const datasetId = runData.data.defaultDatasetId
  const resultsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    },
  })

  if (!resultsResponse.ok) {
    throw new Error(`Erro ao buscar resultados do Apify: ${resultsResponse.status}`)
  }

  const results = await resultsResponse.json()
  
  onProgress(`${results.length} posts coletados do Apify`)

  // Converter formato Apify para formato do sistema
  const posts = results.map((item: any) => ({
    postId: item.id || item.shortCode,
    postUrl: item.url,
    dataPublicacao: new Date(item.timestamp || item.timestampParsed || Date.now()),
    legenda: item.caption || '',
    tipoConteudo: item.type === 'Video' ? 'video' : item.type === 'Sidecar' ? 'carousel' : 'image',
    curtidas: item.likesCount || 0,
    comentarios: item.commentsCount || 0,
    compartilhamentos: 0,
    saves: 0,
    thumbnailUrl: item.displayUrl || item.thumbnailUrl || null,
  }))

  return posts
}

// Função para coletar posts do Instagram Graph API
async function collectFromGraphAPI(accessToken: string, quantity: number) {
  const response = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${quantity}&access_token=${accessToken}`
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Instagram API Error: ${errorData.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()

  // Converter formato Graph API para formato do sistema
  const posts = data.data.map((item: any) => ({
    postId: item.id,
    postUrl: item.permalink,
    dataPublicacao: new Date(item.timestamp),
    legenda: item.caption || '',
    tipoConteudo: item.media_type?.toLowerCase() || 'image',
    curtidas: item.like_count || 0,
    comentarios: item.comments_count || 0,
    compartilhamentos: 0,
    saves: 0,
    thumbnailUrl: item.media_url || null,
  }))

  return posts
}

// Função para gerar posts mock
async function generateMockPosts(username: string, quantity: number) {
  const posts = []
  const now = new Date()

  for (let i = 0; i < quantity; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i * 2)

    posts.push({
      postId: `mock_${Date.now()}_${i}`,
      postUrl: `https://www.instagram.com/p/mock${i}/`,
      dataPublicacao: date,
      legenda: `Post de exemplo #${i + 1} da empresa PHX Instrumentos. Nossos produtos são de alta qualidade e atendemos com excelência! 🚀 #phx #instrumentos #qualidade`,
      tipoConteudo: 'image',
      curtidas: Math.floor(Math.random() * 500) + 50,
      comentarios: Math.floor(Math.random() * 50) + 5,
      compartilhamentos: Math.floor(Math.random() * 20),
      saves: Math.floor(Math.random() * 30),
      thumbnailUrl: null,
    })
  }

  return posts
}
