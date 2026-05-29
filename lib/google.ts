import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!email || !key) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY environment variables"
    )
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: SCOPES,
  })
}

/**
 * Fetch multiple ranges from the configured spreadsheet in a single batch request.
 * Returns a map of requested-range -> 2D array of cell values.
 */
export async function batchGetSheetValues(
  ranges: string[]
): Promise<Map<string, string[][]>> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID environment variable")
  }

  const auth = getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    valueRenderOption: "FORMATTED_VALUE",
  })

  const result = new Map<string, string[][]>()

  response.data.valueRanges?.forEach((vr, index) => {
    // Map the returned data back to the requested range by index
    // This is the most reliable way since Google may normalize range names
    const requestedRange = ranges[index]
    if (requestedRange) {
      result.set(requestedRange, (vr.values as string[][]) || [])
    }
  })

  return result
}

/**
 * Get a single cell value from a range result.
 */
export function getCellValue(
  data: Map<string, string[][]>,
  range: string
): string {
  const values = data.get(range)
  return values?.[0]?.[0] || ""
}
