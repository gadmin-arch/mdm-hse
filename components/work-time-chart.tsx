"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface MiniChartProps {
  data: Array<{ label: string; value: number }>
  color: string
  gradientId: string
}

/**
 * Reusable mini area chart with smooth monotone curves.
 * Designed to be embedded inside stat cards.
 */
export function MiniAreaChart({ data, color, gradientId }: MiniChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: "#94a3b8", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis hide domain={["dataMin - 100", "dataMax + 200"]} />
        <Tooltip
          contentStyle={{
            background: "rgba(7, 26, 48, 0.95)",
            border: "1px solid rgba(100,150,220,0.2)",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "12px",
            padding: "6px 10px",
          }}
          labelStyle={{ color: "#94a3b8", fontSize: "11px" }}
          itemStyle={{ color }}
          formatter={(value: number) => [value.toLocaleString(), ""]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ── Legacy combined chart (kept for reference) ── */

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
          type="monotone"
          dataKey="total"
          stroke="#2aa9c0"
          strokeWidth={2}
          fill="url(#overtimeFill)"
        />
        <Area
          type="monotone"
          dataKey="work"
          stroke="#e0b84e"
          strokeWidth={2}
          fill="url(#workFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
