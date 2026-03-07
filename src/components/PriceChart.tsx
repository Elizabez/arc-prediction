import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, Time, LineStyle } from 'lightweight-charts'

interface PriceChartProps {
  asset: 'BTC' | 'ETH'
  lockPrice?: number
  closePrice?: number
  status?: number
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
}

export default function PriceChart({ asset, lockPrice, closePrice, status }: PriceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const lineSeries = useRef<ISeriesApi<'Line'> | null>(null)
  const lockLine = useRef<any>(null)
  const closeLine = useRef<any>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!chartRef.current) return

    chart.current = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 280,
      layout: {
        background: { color: 'transparent' } as any,
        textColor: '#5a6a8a',
      },
      grid: {
        vertLines: { color: '#1e2d4a22' },
        horzLines: { color: '#1e2d4a22' },
      },
      rightPriceScale: { borderColor: '#1e2d4a' },
      timeScale: {
        borderColor: '#1e2d4a',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    lineSeries.current = chart.current.addLineSeries({
      color: '#3b7bff',
      lineWidth: 2,
    })

    const handleResize = () => {
      if (chart.current && chartRef.current) {
        chart.current.applyOptions({ width: chartRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.current?.remove()
    }
  }, [])

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const id = COINGECKO_IDS[asset]
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1&interval=minutely`
        )
        const data = await res.json()
        if (data.prices && lineSeries.current) {
          const seen = new Set<number>()
          const formatted = data.prices
            .map(([ts, price]: [number, number]) => ({ time: Math.floor(ts / 1000) as Time, value: price }))
            .filter((d: any) => { if (seen.has(d.time as number)) return false; seen.add(d.time as number); return true })
          lineSeries.current.setData(formatted)
          if (formatted.length > 0) {
            setCurrentPrice(formatted[formatted.length - 1].value)
            setPriceChange(((formatted[formatted.length - 1].value - formatted[0].value) / formatted[0].value) * 100)
          }
          chart.current?.timeScale().fitContent()
        }
      } catch (e) { console.error(e) }
      setIsLoading(false)
    }
    fetchHistory()
  }, [asset])

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const id = COINGECKO_IDS[asset]
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`)
        const data = await res.json()
        const price = data[id]?.usd
        if (price && lineSeries.current) {
          lineSeries.current.update({ time: Math.floor(Date.now() / 1000) as Time, value: price })
          setCurrentPrice(price)
        }
      } catch (e) {}
    }
    const id = setInterval(fetchCurrent, 15000)
    return () => clearInterval(id)
  }, [asset])

  // Draw lock/close price lines using priceLine API
  useEffect(() => {
    if (!lineSeries.current) return

    // Remove old lines
    if (lockLine.current) { try { lineSeries.current.removePriceLine(lockLine.current) } catch(e){} lockLine.current = null }
    if (closeLine.current) { try { lineSeries.current.removePriceLine(closeLine.current) } catch(e){} closeLine.current = null }

    if (lockPrice && lockPrice > 0 && status && status >= 1) {
      lockLine.current = lineSeries.current.createPriceLine({
        price: lockPrice,
        color: '#f5c842',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Lock $${lockPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      })
    }

    if (closePrice && closePrice > 0 && status === 2) {
      closeLine.current = lineSeries.current.createPriceLine({
        price: closePrice,
        color: closePrice > (lockPrice ?? 0) ? '#00e5a0' : '#ff4d6d',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `Close $${closePrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      })
    }
  }, [lockPrice, closePrice, status])

  const isUp = priceChange >= 0

  return (
    <div className="price-chart-wrapper">
      <div className="chart-header">
        <div className="chart-asset">
          <span className="chart-asset-icon">{asset === 'BTC' ? '₿' : 'Ξ'}</span>
          <span>{asset}/USD</span>
        </div>
        {currentPrice && (
          <div className="chart-price-info">
            <span className="chart-current-price">
              ${currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
            <span className={`chart-change ${isUp ? 'up' : 'down'}`}>
              {isUp ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </span>
            <span className="chart-period">24h</span>
          </div>
        )}
      </div>

      {lockPrice && lockPrice > 0 && status && status >= 1 && (
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot locked" />
            <span>Lock: ${lockPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
          </div>
          {closePrice && closePrice > 0 && status === 2 && (
            <div className="legend-item">
              <span className={`legend-dot ${closePrice > lockPrice ? 'up' : 'down'}`} />
              <span>Close: ${closePrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
              <span className={`legend-result ${closePrice > lockPrice ? 'up' : 'down'}`}>
                {closePrice > lockPrice ? '▲ UP WINS' : '▼ DOWN WINS'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="chart-container" ref={chartRef}>
        {isLoading && (
          <div className="chart-loading">
            <div className="chart-spinner" />
            <span>Loading chart...</span>
          </div>
        )}
      </div>
    </div>
  )
}
