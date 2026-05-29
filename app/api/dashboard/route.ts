import { batchGetSheetValues, getCellValue } from "@/lib/google"
import { NextResponse } from "next/server"

// All ranges needed from the spreadsheet, grouped by sheet
const RANGES = {
  // Dashboard sheet – single cells
  startDate: "Dashboard!C9",
  endDate: "Dashboard!C10",

  // Result sheet – KPI single cells
  totalHour: "Result!B2",
  activePerson: "Result!B3",
  currentUsers: "Result!B4",
  totalOvertime: "Result!B5",
  totalHoursOvertime: "Result!B6",
  fatality: "Result!B9",
  medicalInjury: "Result!B10",
  firstAid: "Result!B11",
  nearMiss: "Result!B12",
  ltifr: "Result!B13",

  // Sheet9 – chart column ranges
  weekNum: "Sheet9!A2:A",
  workTime: "Sheet9!B2:B",
  overtime: "Sheet9!C2:C",
  totalHours: "Sheet9!D2:D",

  // Accident sheet – table column ranges
  accidentDate: "Dashboard!B55:B65",
  accidentName: "Dashboard!C55:C65",
  accidentType: "Dashboard!D55:D65",
  accidentTimeLost: "Dashboard!E55:E65",
  accidentRemarks: "Dashboard!F55:F65",
}

function parseNumber(value: string): number {
  if (!value) return 0
  // Remove commas and other formatting, then parse
  const cleaned = value.replace(/[^0-9.\-]/g, "")
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export async function GET() {
  try {
    const allRanges = Object.values(RANGES)
    const data = await batchGetSheetValues(allRanges)

    // Build chart data from Sheet9 columns
    const weeks = data.get(RANGES.weekNum) || []
    const workTimes = data.get(RANGES.workTime) || []
    const overtimes = data.get(RANGES.overtime) || []
    const totals = data.get(RANGES.totalHours) || []

    const chart = weeks
      .map((row, i) => ({
        week: row[0] || "",
        workTime: parseNumber(workTimes[i]?.[0] || ""),
        overtime: parseNumber(overtimes[i]?.[0] || ""),
        total: parseNumber(totals[i]?.[0] || ""),
      }))
      .filter((item) => item.week !== "") // skip empty rows

    // Build accidents data
    const accDates = data.get(RANGES.accidentDate) || []
    const accNames = data.get(RANGES.accidentName) || []
    const accTypes = data.get(RANGES.accidentType) || []
    const accTimeLost = data.get(RANGES.accidentTimeLost) || []
    const accRemarks = data.get(RANGES.accidentRemarks) || []

    const accidents = accDates
      .map((row, i) => ({
        date: row[0] || "",
        name: accNames[i]?.[0] || "",
        type: accTypes[i]?.[0] || "",
        timeLost: accTimeLost[i]?.[0] || "",
        remarks: accRemarks[i]?.[0] || "",
      }))
      .filter((item) => item.date !== "" || item.name !== "") // skip fully empty rows

    const responseData = {
      startDate: getCellValue(data, RANGES.startDate),
      endDate: getCellValue(data, RANGES.endDate),
      kpi: {
        totalHour: parseNumber(getCellValue(data, RANGES.totalHour)),
        activePerson: parseNumber(getCellValue(data, RANGES.activePerson)),
        currentUsers: parseNumber(getCellValue(data, RANGES.currentUsers)),
        totalOvertime: parseNumber(getCellValue(data, RANGES.totalOvertime)),
        totalHoursOvertime: parseNumber(
          getCellValue(data, RANGES.totalHoursOvertime)
        ),
        fatality: parseNumber(getCellValue(data, RANGES.fatality)),
        medicalInjury: parseNumber(getCellValue(data, RANGES.medicalInjury)),
        firstAid: parseNumber(getCellValue(data, RANGES.firstAid)),
        nearMiss: parseNumber(getCellValue(data, RANGES.nearMiss)),
        ltifr: parseNumber(getCellValue(data, RANGES.ltifr)),
      },
      chart,
      accidents,
    }

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    })
  } catch (error) {
    console.error("Dashboard API error:", error)

    const message =
      error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      { error: "Failed to fetch dashboard data", details: message },
      { status: 500 }
    )
  }
}
