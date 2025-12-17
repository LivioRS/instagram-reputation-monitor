'use client'

import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface RiskChartProps {
  period: string
}

export default function RiskChart({ period }: RiskChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/dashboard/risk?period=${period}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="h-80 flex items-center justify-center">Carregando...</div>
  if (!data?.length) return <div className="h-80 flex items-center justify-center text-slate-500">Sem dados</div>

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            tick={{ fontSize: 10 }}
            label={{ value: 'Nível de Risco', position: 'insideBottom', offset: -15, style: { textAnchor: 'middle', fontSize: 11 } }}
          />
          <YAxis 
            tickLine={false} 
            tick={{ fontSize: 10 }}
            label={{ value: 'Quantidade', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
          />
          <Tooltip />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="count" fill="#60B5FF" name="Posts" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
