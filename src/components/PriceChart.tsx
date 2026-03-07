import { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';

export const PriceChart = ({ data, symbol }: { data: any[], symbol: string }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: { mode: CrosshairMode.Normal },
    });

    // Bản v5 dùng addSeries(AreaSeries, ...) hoặc addAreaSeries
    // Để an toàn nhất với TypeScript, ta dùng addAreaSeries nhưng ép kiểu dữ liệu
    const areaSeries = chart.addAreaSeries({
      lineColor: '#3b82f6',
      topColor: 'rgba(59, 130, 246, 0.4)',
      bottomColor: 'rgba(59, 130, 246, 0.0)',
      lineWidth: 2,
    });

    if (data && data.length > 0) {
      areaSeries.setData(data);
    }
    
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="relative w-full bg-slate-900 p-4 rounded-xl border border-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">{symbol} / USDC</h3>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
