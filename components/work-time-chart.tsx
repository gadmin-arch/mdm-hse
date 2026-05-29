"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

interface ChartDataPoint {
  week: string
  workTime: number
  overtime: number
  total: number
}

interface WorkTimeChartProps {
  data: ChartDataPoint[]
}

export function WorkTimeChart({ data }: WorkTimeChartProps) {
  // Transform data to match the chart's expected format
  const chartData = data.map((item) => ({
    week: item.week,
    work: item.workTime,
    total: item.total,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="workFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a24a" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#c9a24a" stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id="overtimeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f8a9e" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#1f8a9e" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1c3a5e" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: "#cbd5e1", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#1c3a5e" }}
          interval={0}
        />
        <YAxis
          domain={[0, 6000]}
          ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000]}
          tick={{ fill: "#cbd5e1", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Area
          type="linear"
          dataKey="total"
          stroke="#2aa9c0"
          strokeWidth={2}
          fill="url(#overtimeFill)"
        />
        <Area
          type="linear"
          dataKey="work"
          stroke="#e0b84e"
          strokeWidth={2}
          fill="url(#workFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
