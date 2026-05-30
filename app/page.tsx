"use client"

import { MiniAreaChart } from "@/components/work-time-chart"
import { format, isValid, parse } from "date-fns"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bandage,
  BarChart3,
  Clock,
  Plus,
  Search,
  ShieldCheck,
  Skull,
  TrendingUp,
  TriangleAlert,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"

// ───────────────── Types ─────────────────

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

type SortField = "date" | "name" | "type" | "timeLost" | "remarks"
type SortDir = "asc" | "desc" | null

/** Try to parse a date string from various common spreadsheet formats */
function tryParseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const formats = [
    "dd/MM/yyyy",
    "MM/dd/yyyy",
    "yyyy-MM-dd",
    "dd-MM-yyyy",
    "d/M/yyyy",
    "M/d/yyyy",
    "dd MMM yyyy",
    "d MMM yyyy",
    "MMM dd, yyyy",
    "MMMM dd, yyyy",
  ]
  for (const fmt of formats) {
    try {
      const parsed = parse(dateStr.trim(), fmt, new Date())
      if (isValid(parsed)) return parsed
    } catch { /* try next */ }
  }
  // Fallback: native Date constructor
  const native = new Date(dateStr)
  return isValid(native) ? native : null
}

/** Format a date string for display */
function formatDate(dateStr: string): string {
  const d = tryParseDate(dateStr)
  if (!d) return dateStr
  return format(d, "dd MMM yyyy")
}

// ───────────────── Main Page ─────────────────

export default function Page() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // Table state
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

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

  // ── Loading state ──
  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#071a30] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-4 border-slate-600 border-t-amber-400" />
          <p className="text-lg text-slate-300">Loading dashboard…</p>
        </div>
      </main>
    )
  }

  if (!dashboardData) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#071a30] text-white">
        <p className="text-xl">Failed to load dashboard data</p>
      </main>
    )
  }

  const { kpi, chart, accidents, startDate, endDate } = dashboardData

  return (
    <DashboardLayout
      kpi={kpi}
      chart={chart}
      accidents={accidents}
      startDate={startDate}
      endDate={endDate}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filterCategory={filterCategory}
      setFilterCategory={setFilterCategory}
      sortField={sortField}
      setSortField={setSortField}
      sortDir={sortDir}
      setSortDir={setSortDir}
    />
  )
}

// ───────────────── Dashboard Layout ─────────────────

function DashboardLayout({
  kpi,
  chart,
  accidents,
  startDate,
  endDate,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  sortField,
  setSortField,
  sortDir,
  setSortDir,
}: {
  kpi: DashboardData["kpi"]
  chart: DashboardData["chart"]
  accidents: DashboardData["accidents"]
  startDate: string
  endDate: string
  searchQuery: string
  setSearchQuery: (v: string) => void
  filterCategory: string
  setFilterCategory: (v: string) => void
  sortField: SortField | null
  setSortField: (v: SortField | null) => void
  sortDir: SortDir
  setSortDir: (v: SortDir) => void
}) {
  // ── Prepare chart data for 3 separate charts ──
  const workTimeChartData = chart.map((d) => ({ label: d.week, value: d.workTime }))
  const overtimeChartData = chart.map((d) => ({ label: d.week, value: d.overtime }))
  const totalChartData = chart.map((d) => ({ label: d.week, value: d.total }))

  // ── Accident categories (for filter dropdown) ──
  const categories = useMemo(() => {
    const types = new Set(accidents.map((a) => a.type).filter(Boolean))
    return Array.from(types).sort()
  }, [accidents])

  // ── Filter, search, sort accidents ──
  const processedAccidents = useMemo(() => {
    let result = [...accidents]

    // Filter by category
    if (filterCategory) {
      result = result.filter((a) => a.type === filterCategory)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.remarks.toLowerCase().includes(q) ||
          a.date.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortField && sortDir) {
      result.sort((a, b) => {
        if (sortField === "date") {
          const aDate = tryParseDate(a.date)
          const bDate = tryParseDate(b.date)
          const aTime = aDate ? aDate.getTime() : 0
          const bTime = bDate ? bDate.getTime() : 0
          return sortDir === "asc" ? aTime - bTime : bTime - aTime
        }
        const aVal = a[sortField] || ""
        const bVal = b[sortField] || ""
        const cmp = aVal.localeCompare(bVal)
        return sortDir === "asc" ? cmp : -cmp
      })
    }

    return result
  }, [accidents, filterCategory, searchQuery, sortField, sortDir])

  // ── Toggle sort ──
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDir === "asc") setSortDir("desc")
      else if (sortDir === "desc") {
        setSortField(null)
        setSortDir(null)
      }
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="size-3 opacity-40" />
    if (sortDir === "asc") return <ArrowUp className="size-3 sort-active" />
    return <ArrowDown className="size-3 sort-active" />
  }

  // ── Incident stats config ──
  const incidentStats = [
    {
      label: "LTIFR",
      value: kpi.ltifr.toFixed(2),
      color: "text-emerald-400",
      bg: "from-emerald-500/10 to-emerald-500/5",
      borderColor: "border-emerald-500/20",
      icon: ShieldCheck,
      iconColor: "text-emerald-400",
    },
    {
      label: "Fatality",
      value: kpi.fatality.toString(),
      color: "text-red-400",
      bg: "from-red-500/10 to-red-500/5",
      borderColor: "border-red-500/20",
      icon: Skull,
      iconColor: "text-red-400",
    },
    {
      label: "Medical Injury",
      value: kpi.medicalInjury.toString(),
      color: "text-rose-400",
      bg: "from-rose-500/10 to-rose-500/5",
      borderColor: "border-rose-500/20",
      icon: Plus,
      iconColor: "text-rose-400",
    },
    {
      label: "First Aid",
      value: kpi.firstAid.toString(),
      color: "text-amber-400",
      bg: "from-amber-500/10 to-amber-500/5",
      borderColor: "border-amber-500/20",
      icon: Bandage,
      iconColor: "text-amber-400",
    },
    {
      label: "Near Miss",
      value: kpi.nearMiss.toString(),
      color: "text-orange-400",
      bg: "from-orange-500/10 to-orange-500/5",
      borderColor: "border-orange-500/20",
      icon: TriangleAlert,
      iconColor: "text-orange-400",
    },
  ]

  return (
    <main className="flex h-screen flex-col bg-[#071a30] text-white overflow-hidden">
      {/* ════════ HEADER (fixed) ════════ */}
      <header className="shrink-0 px-4 pt-3 pb-2">
        <div className="mx-auto flex max-w-[1800px] flex-col md:flex-row items-center gap-3 md:gap-4">
          {/* Mobile Logos Bar (shown only on mobile) */}
          <div className="flex w-full justify-between items-center md:hidden mb-1">
            <div className="relative h-10 w-28 overflow-hidden rounded-lg glass-card p-1">
              <Image
                src="/logo mdm new.png"
                alt="MDM Logo"
                fill
                priority
                className="object-contain p-1"
              />
            </div>
            <div className="relative h-10 w-28 overflow-hidden rounded-lg glass-card p-1">
              <Image
                src="/logo k3.png"
                alt="K3 Logo"
                fill
                priority
                className="object-contain p-1"
              />
            </div>
          </div>

          {/* MDM Logo (hidden on mobile) */}
          <div className="hidden md:block relative h-20 w-56 shrink-0 overflow-hidden rounded-xl glass-card p-2">
            <Image
              src="/logo mdm new.png"
              alt="MDM Logo"
              fill
              priority
              className="object-contain p-2"
            />
          </div>

          {/* Title + Date Range */}
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-center">
              HSE PERFORMANCE DASHBOARD
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm md:text-base">
              <span className="rounded-md bg-[#13355f]/80 px-2 py-0.5 md:px-3 md:py-0.5 font-semibold text-amber-400">
                {startDate ? formatDate(startDate) : "N/A"}
              </span>
              <span className="text-xs font-medium text-slate-400">TO</span>
              <span className="rounded-md bg-[#13355f]/80 px-2 py-0.5 md:px-3 md:py-0.5 font-semibold text-amber-400">
                {endDate ? formatDate(endDate) : "N/A"}
              </span>
              <span className="hidden sm:inline mx-1 h-4 w-px bg-slate-600" />
              <div className="flex items-center gap-1 md:gap-1.5">
                <span className="size-2 md:size-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-300">
                  Active <span className="font-bold text-white">{kpi.activePerson}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5">
                <span className="size-2 md:size-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">
                  Current <span className="font-bold text-emerald-400">{kpi.currentUsers}</span>
                </span>
              </div>
            </div>
          </div>

          {/* K3 Logo (hidden on mobile) */}
          <div className="hidden md:block relative h-20 w-56 shrink-0 overflow-hidden rounded-xl glass-card p-2">
            <Image
              src="/logo k3.png"
              alt="K3 Logo"
              fill
              priority
              className="object-contain p-2"
            />
          </div>
        </div>
      </header>

      {/* ════════ BODY (fills remaining space) ════════ */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-2">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3">
          {/* ── Row 1: 3 Chart Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0 stagger-children">
            <ChartCard
              title="TOTAL WORK TIME"
              value={kpi.totalHour.toLocaleString()}
              unit="Hours"
              icon={<Clock className="size-5" />}
              color="#fbbf24"
              gradientId="grad-worktime"
              data={workTimeChartData}
              accentClass="text-amber-400"
              borderAccent="border-amber-400/20"
            />
            <ChartCard
              title="TOTAL OVERTIME"
              value={kpi.totalOvertime.toLocaleString()}
              unit="Hours"
              icon={<TrendingUp className="size-5" />}
              color="#22d3ee"
              gradientId="grad-overtime"
              data={overtimeChartData}
              accentClass="text-cyan-400"
              borderAccent="border-cyan-400/20"
            />
            <ChartCard
              title="TOTAL HOURS"
              value={kpi.totalHoursOvertime.toLocaleString()}
              unit="Hours"
              icon={<BarChart3 className="size-5" />}
              color="#a78bfa"
              gradientId="grad-total"
              data={totalChartData}
              accentClass="text-violet-400"
              borderAccent="border-violet-400/20"
            />
          </div>

          {/* ── Row 2: Incident Stats (5 cards) ── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0 stagger-children">
            {incidentStats.map((s, idx) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className={`flex items-center gap-3 rounded-xl bg-gradient-to-br ${s.bg} border ${
                    s.borderColor
                  } px-4 py-2.5 hover-lift glass-card animate-fade-in-up ${
                    idx === 4 ? "col-span-2 md:col-span-1" : ""
                  }`}
                >
                  <div className={`rounded-lg bg-white/5 p-2 ${s.iconColor}`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      {s.label}
                    </p>
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Row 3: Accident Table (fills remaining) ── */}
          <div className="flex flex-col rounded-xl glass-card-strong overflow-hidden">
            {/* Table header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/50 px-4 py-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Accident / Incident Log
              </h2>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-full sm:w-48 rounded-lg border border-slate-600/50 bg-[#071a30]/60 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-colors"
                  />
                </div>

                {/* Category filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-8 flex-1 sm:flex-none rounded-lg border border-slate-600/50 bg-[#071a30]/60 px-3 text-xs text-slate-200 outline-none focus:border-amber-400/50 cursor-pointer appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto overflow-y-visible dark-scrollbar">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[#0d2d52]">
                  <tr>
                    {(
                      [
                        { field: "date" as SortField, label: "Date", width: "w-36" },
                        { field: "name" as SortField, label: "Name", width: "" },
                        { field: "type" as SortField, label: "Type", width: "w-40" },
                        { field: "timeLost" as SortField, label: "Time Lost", width: "w-32" },
                        { field: "remarks" as SortField, label: "Remarks", width: "" },
                      ] as const
                    ).map((col) => (
                      <th
                        key={col.field}
                        className={`border-b-2 border-amber-400/60 px-4 py-2 font-semibold text-slate-200 cursor-pointer select-none hover:text-amber-300 transition-colors ${col.width}`}
                        onClick={() => toggleSort(col.field)}
                      >
                        <span className="flex items-center gap-1.5">
                          {col.label}
                          <SortIcon field={col.field} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedAccidents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-slate-500"
                      >
                        No incidents found
                      </td>
                    </tr>
                  ) : (
                    processedAccidents.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-700/30 transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-2 text-slate-300">
                          {row.date && (
                            <span className="rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs font-medium text-slate-200">
                              {formatDate(row.date)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 font-medium text-slate-100">{row.name}</td>
                        <td className="px-4 py-2">
                          {row.type && (
                            <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                              {row.type}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-slate-300">{row.timeLost}</td>
                        <td className="px-4 py-2 text-slate-400">{row.remarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ FOOTER (fixed) ════════ */}
      <footer className="shrink-0 px-4 pb-3 pt-1">
        <div className="mx-auto max-w-[1800px] rounded-xl glass-card py-2.5 md:py-3 text-center">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold tracking-wide">
            KESELAMATAN ADALAH PRIORITAS KAMI
          </p>
          <p className="mt-0.5 text-xs sm:text-sm font-semibold italic text-slate-300">
            {'"Safety is our priority"'}
          </p>
        </div>
      </footer>
    </main>
  )
}

// ───────────────── Chart Card Component ─────────────────

function ChartCard({
  title,
  value,
  unit,
  icon,
  color,
  gradientId,
  data,
  accentClass,
  borderAccent,
}: {
  title: string
  value: string
  unit: string
  icon: React.ReactNode
  color: string
  gradientId: string
  data: Array<{ label: string; value: number }>
  accentClass: string
  borderAccent: string
}) {
  return (
    <div
      className={`flex flex-col rounded-xl glass-card border ${borderAccent} overflow-hidden hover-lift animate-fade-in-up`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className={`text-3xl font-extrabold tracking-tight ${accentClass}`}>
              {value}
            </span>
            <span className="text-xs font-medium text-slate-500">{unit}</span>
          </div>
        </div>
        <div className={`rounded-lg bg-white/5 p-2 ${accentClass}`}>{icon}</div>
      </div>

      {/* Chart area */}
      <div className="h-[100px] w-full px-1">
        <MiniAreaChart data={data} color={color} gradientId={gradientId} />
      </div>
    </div>
  )
}
