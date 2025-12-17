import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // 1. Criar configurações padrão
  console.log('📝 Criando configurações padrão...')
  
  const defaultConfigs = [
    {
      chave: 'empresaNome',
      valor: 'PHX Instrumentos',
      tipo: 'string',
      categoria: 'empresa',
      descricao: 'Nome da empresa',
    },
    {
      chave: 'instagramUsername',
      valor: 'phxinstrumentos',
      tipo: 'string',
      categoria: 'instagram',
      descricao: 'Username do Instagram para monitorar',
    },
    {
      chave: 'instagramMetodo',
      valor: 'apify',
      tipo: 'string',
      categoria: 'instagram',
      descricao: 'Método de coleta: apify ou graph_api',
    },
    {
      chave: 'claudeModel',
      valor: 'claude-sonnet-4-20250514',
      tipo: 'string',
      categoria: 'claude',
      descricao: 'Modelo do Claude para análise',
    },
    {
      chave: 'coletaQuantidade',
      valor: '30',
      tipo: 'number',
      categoria: 'coleta',
      descricao: 'Quantidade de posts para coletar',
    },
    {
      chave: 'coletaIntervalo',
      valor: '24',
      tipo: 'number',
      categoria: 'coleta',
      descricao: 'Intervalo de coleta em horas',
    },
    {
      chave: 'coletaAtiva',
      valor: 'false',
      tipo: 'boolean',
      categoria: 'coleta',
      descricao: 'Coleta automática ativa',
    },
    {
      chave: 'alertasAtivos',
      valor: 'true',
      tipo: 'boolean',
      categoria: 'alertas',
      descricao: 'Alertas ativos',
    },
    {
      chave: 'alertasRiscoMinimo',
      valor: 'alto',
      tipo: 'string',
      categoria: 'alertas',
      descricao: 'Nível mínimo de risco para alerta',
    },
    {
      chave: 'alertasSentimentoMinimo',
      valor: '40',
      tipo: 'string',
      categoria: 'alertas',
      descricao: 'Percentual mínimo de sentimento negativo para alerta',
    },
  ]

  for (const config of defaultConfigs) {
    await prisma.configuracao.upsert({
      where: { chave: config.chave },
      update: {},
      create: config,
    })
  }

  console.log(`✅ ${defaultConfigs.length} configurações criadas/atualizadas`)

  // 2. Criar perfil padrão
  console.log('👤 Criando perfil padrão...')
  
  const defaultProfile = await prisma.profile.upsert({
    where: { username: 'phxinstrumentos' },
    update: {},
    create: {
      username: 'phxinstrumentos',
      displayName: '@phxinstrumentos',
      isActive: true,
      postsCount: 0,
    },
  })

  console.log(`✅ Perfil criado: ${defaultProfile.username}`)

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

