import { useEffect, useRef } from 'react'
import { createChart, ColorType } from 'lightweight-charts'

interface PriceChartProps {
  asset: 'BTC' | 'ETH'
  lockPrice?: number
  closePrice?: number
  status?: number
}

export function PriceChart({ asset }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#94a3b8' },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: { vertLines: { color: '#1e293b' }, horzLines: { color: '#1e293b' } },
    })

    const lineSeries = chart.addLineSeries({ color: '#3b82f6', lineWidth: 2 })
    
    // Dữ liệu giả lập ban đầu để test giao diện
    lineSeries.setData([
      { time: '2024-01-01', value: 60000 },
      { time: '2024-01-02', value: 61000 },
    ])

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [asset])

  return (
    <div className="relative w-full">
      <div ref={chartContainerRef} className="w-full" />
      <div className="absolute top-4 left-4 bg-slate-900/80 p-2 rounded border border-slate-700">
        <span className="text-blue-400 font-bold">{asset}/USD Live</span>
      </div>
    </div>
  )
}
