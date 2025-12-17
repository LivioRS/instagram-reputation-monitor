'use client'

import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface EngagementChartProps {
  period: string
}

export default function EngagementChart({ period }: EngagementChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/dashboard/engagement?period=${period}`)
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
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
          <XAxis 
            dataKey="date" 
            tickLine={false} 
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
            label={{ value: 'Data', position: 'insideBottom', offset: -20, style: { textAnchor: 'middle', fontSize: 11 } }}
          />
          <YAxis 
            tickLine={false} 
            tick={{ fontSize: 10 }}
            label={{ value: 'Quantidade', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
          />
          <Tooltip />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
          <Line 
            type="monotone" 
            dataKey="curtidas" 
            stroke="#FF9149" 
            strokeWidth={2} 
            name="Curtidas"
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="comentarios" 
            stroke="#80D8C3" 
            strokeWidth={2} 
            name="Comentários"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
