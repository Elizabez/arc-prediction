import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, LineData, Time } from 'lightweight-charts'

interface PriceChartProps {
  asset: 'BTC' | 'ETH'
  lockPrice?: number
  closePrice?: number
  status?: number // 0=OPEN, 1=LOCKED, 2=RESOLVED
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
}

export default function PriceChart({ asset, lockPrice, closePrice, status }: PriceChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const lineSeries = useRef<ISeriesApi<'Area'> | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  // Init chart
  useEffect(() => {
    if (!chartRef.current) return

    chart.current = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 280,
      layout: {
        background: { color: 'transparent' },
        textColor: '#5a6a8a',
      },
      grid: {
        vertLines: { color: '#1e2d4a22' },
        horzLines: { color: '#1e2d4a22' },
      },
      crosshair: {
        vertLine: { color: '#3b7bff44', width: 1, style: 1 },
        horzLine: { color: '#3b7bff44', width: 1, style: 1 },
      },
      rightPriceScale: {
        borderColor: '#1e2d4a',
        textColor: '#5a6a8a',
      },
      timeScale: {
        borderColor: '#1e2d4a',
        textColor: '#5a6a8a',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    })

    lineSeries.current = chart.current.addAreaSeries({
      lineColor: '#3b7bff',
      topColor: '#3b7bff33',
      bottomColor: '#3b7bff00',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
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

  // Fetch historical data
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
          const formatted: LineData[] = data.prices.map(([ts, price]: [number, number]) => ({
            time: Math.floor(ts / 1000) as Time,
            value: price,
          }))
          // Deduplicate by time
          const seen = new Set()
          const deduped = formatted.filter(d => {
            if (seen.has(d.time)) return false
            seen.add(d.time)
            return true
          })
          lineSeries.current.setData(deduped)
          const last = deduped[deduped.length - 1]
          const first = deduped[0]
          setCurrentPrice(last.value)
          setPriceChange(((last.value - first.value) / first.value) * 100)
          chart.current?.timeScale().fitContent()
        }
      } catch (e) {
        console.error('Failed to fetch price history', e)
      }
      setIsLoading(false)
    }
    fetchHistory()
  }, [asset])

  // Realtime price update every 15s
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const id = COINGECKO_IDS[asset]
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
        )
        const data = await res.json()
        const price = data[id]?.usd
        if (price && lineSeries.current) {
          const now = Math.floor(Date.now() / 1000) as Time
          lineSeries.current.update({ time: now, value: price })
          setCurrentPrice(price)
        }
      } catch (e) {}
    }
    const id = setInterval(fetchCurrent, 15000)
    return () => clearInterval(id)
  }, [asset])

  // Draw lock/close price lines
  useEffect(() => {
    if (!chart.current) return
    const markers: any[] = []

    if (lockPrice && lockPrice > 0 && status && status >= 1) {
      // Add lock price as horizontal line marker
      lineSeries.current?.applyOptions({
        priceLines: [
          {
            price: lockPrice,
            color: '#f5c842',
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `Lock $${lockPrice.toLocaleString()}`,
          },
          ...(closePrice && closePrice > 0 && status === 2 ? [{
            price: closePrice,
            color: closePrice > lockPrice ? '#00e5a0' : '#ff4d6d',
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `Close $${closePrice.toLocaleString()}`,
          }] : []),
        ],
      })
    } else {
      lineSeries.current?.applyOptions({ priceLines: [] })
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

      {/* Lock/Close price legend */}
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
