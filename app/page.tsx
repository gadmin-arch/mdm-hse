"use client"

import { WorkTimeChart } from "@/components/work-time-chart"
import {
  Bandage,
  BarChart3,
  Clock,
  Plus,
  ShieldCheck,
  Skull,
  TrendingUp,
  TriangleAlert,
} from "lucide-react"
import { useEffect, useState } from "react"

interface DashboardData {
  startDate: string
  endDate: string
  kpi: {
    totalHour: number
    activePerson: number
    currentUsers: number
    totalOvertime: number
    totalHoursOvertime: number
    fatality: number
    medicalInjury: number
    firstAid: number
    nearMiss: number
    ltifr: number
  }
  chart: Array<{
    week: string
    workTime: number
    overtime: number
    total: number
  }>
  accidents: Array<{
    date: string
    name: string
    type: string
    timeLost: string
    remarks: string
  }>
}

export default function Page() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard")
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#071a30] p-4 text-white flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </main>
    )
  }

  if (!dashboardData) {
    return (
      <main className="min-h-screen bg-[#071a30] p-4 text-white flex items-center justify-center">
        <p className="text-xl">Failed to load dashboard data</p>
      </main>
    )
  }

  const { kpi, chart, accidents, startDate, endDate } = dashboardData

  const incidentStats = [
    {
      label: "LTIFR",
      value: kpi.ltifr.toFixed(2),
      color: "text-emerald-400",
      dot: "bg-emerald-400",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
    },
    {
      label: "Fatality",
      value: kpi.fatality.toString(),
      color: "text-red-500",
      dot: "bg-red-500",
      icon: Skull,
      iconColor: "text-red-500",
    },
    {
      label: "Medical Injury",
      value: kpi.medicalInjury.toString(),
      color: "text-red-500",
      dot: "bg-red-500",
      icon: Plus,
      iconColor: "text-red-500",
    },
    {
      label: "First Aid",
      value: kpi.firstAid.toString(),
      color: "text-amber-400",
      dot: "bg-amber-400",
      icon: Bandage,
      iconColor: "text-amber-400",
    },
    {
      label: "Near Miss",
      value: kpi.nearMiss.toString(),
      color: "text-amber-400",
      dot: "bg-amber-400",
      icon: TriangleAlert,
      iconColor: "text-amber-400",
    },
  ]
  return (
    <main className="min-h-screen bg-[#071a30] p-4 text-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-[#0b2545] px-6 py-4">
            <div className="grid grid-cols-3 gap-0.5">
              {["bg-blue-400", "bg-amber-400", "bg-emerald-400", "bg-amber-400", "bg-blue-500", "bg-blue-400", "bg-blue-500", "bg-emerald-400", "bg-amber-400"].map(
                (c, i) => (
                  <span key={i} className={`size-2.5 rounded-[2px] ${c}`} />
                ),
              )}
            </div>
            <span className="text-sm font-bold tracking-wide text-slate-200">PT. MULTI DAYA MITRA</span>
          </div>

          <h1 className="flex-1 text-balance text-center text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
            HSE PERFORMANCE DASHBOARD
          </h1>

          <div className="flex size-24 items-center justify-center rounded-2xl bg-[#0b2545]">
            <div className="flex flex-col items-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-500 text-[#071a30]">
                <Plus className="size-6" strokeWidth={3} />
              </div>
              <span className="mt-1 text-[6px] font-bold leading-tight text-green-500">
                UTAMAKAN KESELAMATAN
              </span>
            </div>
          </div>
        </header>

        {/* Sub header: date range + users */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#0b2545] px-6 py-4">
          <div className="flex items-center gap-3 text-2xl font-bold">
            <span className="rounded-lg bg-[#13355f] px-4 py-1.5 text-amber-400">{startDate || "N/A"}</span>
            <span className="text-slate-300">TO</span>
            <span className="rounded-lg bg-[#13355f] px-4 py-1.5 text-amber-400">{endDate || "N/A"}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#0e2c52] px-6 py-2.5">
              <span className="size-4 rounded-full bg-amber-400" />
              <div className="text-center">
                <p className="text-sm text-slate-300">Active User</p>
                <p className="text-2xl font-bold text-white">{kpi.activePerson}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#0e2c52] px-6 py-2.5">
              <span className="size-4 rounded-full bg-green-500" />
              <div className="text-center">
                <p className="text-sm text-slate-300">Total Current User</p>
                <p className="text-2xl font-bold text-green-500">{kpi.currentUsers}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Body grid */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <StatBlock
              title="TOTAL WORK TIME"
              value={kpi.totalHour.toLocaleString()}
              valueColor="text-amber-400"
              icon={<Clock className="size-7 text-amber-400" />}
            />
            <StatBlock
              title="TOTAL OVERTIME"
              value={kpi.totalOvertime.toLocaleString()}
              valueColor="text-cyan-400"
              icon={<TrendingUp className="size-7 text-cyan-400" />}
              ring
            />
            <StatBlock
              title="TOTAL HOURS"
              value={kpi.totalHoursOvertime.toLocaleString()}
              valueColor="text-white"
              icon={<BarChart3 className="size-7 text-white" />}
            />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Chart */}
            <div className="rounded-2xl bg-[#0b2545] p-4">
              <div className="mb-2 flex items-center justify-center gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-amber-400" /> Work Time
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-cyan-500" /> Overtime
                </span>
              </div>
              <div className="h-[300px] w-full">
                <WorkTimeChart data={chart} />
              </div>
            </div>

            {/* Incident stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {incidentStats.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="rounded-xl bg-[#0b2545] px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-200">{s.label}</p>
                      <Icon className={`size-5 ${s.iconColor}`} />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`size-3 rounded-full ${s.dot}`} />
                      <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Incident table */}
            <div className="overflow-hidden rounded-2xl bg-[#0b2545] p-3">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="text-slate-100">
                    {["Date", "Name", "Type", "Time Lost", "Remarks"].map((h) => (
                      <th key={h} className="border-b-2 border-amber-400 px-3 py-2 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white text-slate-900">
                  {Array.from({ length: 6 }).map((_, i) => {
                    const row = accidents[i]
                    return (
                      <tr key={i} className="h-11">
                        <td className="border border-amber-400 px-3 py-1.5">
                          {row?.date ? (
                            <span className="rounded-full bg-slate-200 px-3 py-0.5 text-slate-700">
                              {row.date}
                            </span>
                          ) : (
                            ""
                          )}
                        </td>
                        <td className="border border-amber-400 px-3 py-1.5">{row?.name}</td>
                        <td className="border border-amber-400 px-3 py-1.5">{row?.type}</td>
                        <td className="border border-amber-400 px-3 py-1.5">{row?.timeLost}</td>
                        <td className="border border-amber-400 px-3 py-1.5">{row?.remarks}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="rounded-2xl bg-[#0b2545] py-5 text-center">
          <p className="text-2xl font-extrabold tracking-wide">KESELAMATAN ADALAH PRIORITAS KAMI</p>
          <p className="mt-1 text-lg font-bold italic text-slate-200">{'"Safety is our priority"'}</p>
        </footer>
      </div>
    </main>
  )
}

function StatBlock({
  title,
  value,
  valueColor,
  icon,
  ring,
}: {
  title: string
  value: string
  valueColor: string
  icon: React.ReactNode
  ring?: boolean
}) {
  return (
    <div
      className={`flex flex-1 flex-col justify-center rounded-2xl bg-[#0b2545] px-6 py-6 ${
        ring ? "ring-2 ring-violet-500" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-wide text-slate-100">{title}</h2>
        {icon}
      </div>
      <p className={`mt-2 text-6xl font-extrabold tracking-tight ${valueColor} lg:text-7xl`}>{value}</p>
    </div>
  )
}
