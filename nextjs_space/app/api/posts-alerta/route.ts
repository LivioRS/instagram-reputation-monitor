import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

/**
 * GET /api/posts-alerta
 * 
 * Retorna posts com alertas (risco alto ou sentimento negativo elevado)
 * para serem consumidos pelo N8N e enviados ao Telegram
 * 
 * Query params:
 * - status: 'pendente' | 'todos' (default: 'pendente')
 * - periodo: número de horas para buscar (default: 24)
 * - limite: número máximo de posts (default: 20)
 * - apenas_nao_notificados: 'true' | 'false' (default: 'true')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pendente';
    const periodo = parseInt(searchParams.get('periodo') || '24');
    const limite = parseInt(searchParams.get('limite') || '20');
    const apenasNaoNotificados = searchParams.get('apenas_nao_notificados') !== 'false';

    // Buscar configurações de threshold
    const thresholdSentimento = await prisma.configuracao.findUnique({
      where: { chave: 'threshold_sentimento_negativo' },
    });

    const thresholdValue = thresholdSentimento?.valor ? parseInt(thresholdSentimento.valor) : 40;

    // Calcular data limite
    const dataLimite = new Date();
    dataLimite.setHours(dataLimite.getHours() - periodo);

    // Buscar posts com alertas
    const posts = await prisma.instagramPost.findMany({
      where: {
        AND: [
          // Posts com alerta
          {
            OR: [
              { nivelRisco: 'alto' },
              { sentimentoNegativo: { gte: thresholdValue } },
            ],
          },
          // Filtro por período
          {
            dataPublicacao: {
              gte: dataLimite,
            },
          },
          // Filtro por status (se não for 'todos')
          ...(status !== 'todos'
            ? [{ statusAlerta: status }]
            : []),
          // Filtro por notificação N8N
          ...(apenasNaoNotificados
            ? [{ notificadoN8n: false }]
            : []),
        ],
      },
      orderBy: {
        dataPublicacao: 'desc',
      },
      take: limite,
    });

    // Formatar resposta para N8N
    const postsFormatados = posts.map(post => ({
      id: post.id,
      post_id: post.postId,
      empresa: post.empresa,
      post_url: post.postUrl,
      data_publicacao: post.dataPublicacao,
      
      // Conteúdo
      legenda: post.legenda?.substring(0, 200) || '', // Limitar tamanho
      legenda_completa: post.legenda,
      tipo_conteudo: post.tipoConteudo,
      thumbnail_url: post.thumbnailUrl,
      
      // Métricas
      curtidas: post.curtidas,
      comentarios: post.comentarios,
      compartilhamentos: post.compartilhamentos,
      saves: post.saves,
      
      // Análise
      sentimento: {
        positivo: post.sentimentoPositivo,
        neutro: post.sentimentoNeutro,
        negativo: post.sentimentoNegativo,
      },
      score_reputacao: post.scoreReputacao,
      nivel_risco: post.nivelRisco,
      temas_principais: post.temasPrincipais,
      resumo: post.resumo,
      alertas: post.alertas,
      recomendacoes: post.recomendacoes,
      
      // Metadados
      status_alerta: post.statusAlerta,
      notificado_n8n: post.notificadoN8n,
      coletado_em: post.coletadoEm,
      
      // Campos úteis para N8N
      tem_alerta_critico: post.nivelRisco === 'alto',
      tem_sentimento_muito_negativo: post.sentimentoNegativo > 50,
    }));

    return NextResponse.json({
      sucesso: true,
      total: postsFormatados.length,
      periodo_horas: periodo,
      threshold_sentimento: thresholdValue,
      posts: postsFormatados,
    });
  } catch (error) {
    console.error('Erro ao buscar posts com alerta:', error);
    return NextResponse.json(
      {
        sucesso: false,
        erro: 'Erro ao buscar posts com alerta',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts-alerta
 * 
 * Marca posts como notificados pelo N8N
 * 
 * Body:
 * {
 *   "post_ids": ["id1", "id2", ...]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_ids } = body;

    if (!Array.isArray(post_ids) || post_ids.length === 0) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Campo post_ids é obrigatório e deve ser um array',
        },
        { status: 400 }
      );
    }

    // Atualizar posts como notificados
    const resultado = await prisma.instagramPost.updateMany({
      where: {
        id: {
          in: post_ids,
        },
      },
      data: {
        notificadoN8n: true,
      },
    });

    return NextResponse.json({
      sucesso: true,
      posts_atualizados: resultado.count,
      post_ids: post_ids,
    });
  } catch (error) {
    console.error('Erro ao marcar posts como notificados:', error);
    return NextResponse.json(
      {
        sucesso: false,
        erro: 'Erro ao marcar posts como notificados',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
