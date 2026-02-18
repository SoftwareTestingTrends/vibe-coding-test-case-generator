import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedStory {
  id: number;
  content: string;
  source: string;
}

export interface ParseResult {
  stories: ParsedStory[];
  fileName: string;
  totalFound: number;
}

/**
 * Parse an uploaded file and extract user stories.
 *
 * Supported formats:
 * - .txt  — stories separated by blank lines or "---"
 * - .csv  — each row is a story; uses the first text-heavy column or a column named
 *           "story", "user story", "requirement", "description"
 * - .xlsx — same heuristic as CSV, applied to the first sheet
 */
export async function parseFile(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<ParseResult> {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "txt":
      return parseTextFile(buffer, fileName);
    case "csv":
      return parseCsvFile(buffer, fileName);
    case "xlsx":
    case "xls":
      return parseExcelFile(buffer, fileName);
    default:
      throw new Error(
        `Unsupported file type: .${ext}. Supported: .txt, .csv, .xlsx, .xls`,
      );
  }
}

// ---------------------------------------------------------------------------
// Text file: split on blank lines or "---" separators
// ---------------------------------------------------------------------------

function parseTextFile(buffer: ArrayBuffer, fileName: string): ParseResult {
  const text = new TextDecoder("utf-8").decode(buffer);

  // Split on two+ newlines or a line that is just dashes/equals
  const blocks = text
    .split(/\n\s*\n|^-{3,}$|^={3,}$/m)
    .map((b) => b.trim())
    .filter((b) => b.length >= 10);

  const stories: ParsedStory[] = blocks.map((content, i) => ({
    id: i + 1,
    content,
    source: `${fileName} (block ${i + 1})`,
  }));

  return { stories, fileName, totalFound: stories.length };
}

// ---------------------------------------------------------------------------
// CSV file: detect the story column, extract one story per row
// ---------------------------------------------------------------------------

const STORY_COLUMN_NAMES = [
  "story",
  "user story",
  "user_story",
  "userstory",
  "requirement",
  "requirements",
  "description",
  "acceptance criteria",
  "feature",
  "scenario",
];

function findStoryColumn(headers: string[]): string | null {
  // Exact match (case-insensitive)
  for (const h of headers) {
    if (STORY_COLUMN_NAMES.includes(h.toLowerCase().trim())) {
      return h;
    }
  }
  // Partial match
  for (const h of headers) {
    const lower = h.toLowerCase().trim();
    if (STORY_COLUMN_NAMES.some((name) => lower.includes(name))) {
      return h;
    }
  }
  return null;
}

function extractStoriesFromRows(
  rows: Record<string, string>[],
  fileName: string,
): ParseResult {
  if (rows.length === 0) {
    return { stories: [], fileName, totalFound: 0 };
  }

  const headers = Object.keys(rows[0]);
  let storyColumn = findStoryColumn(headers);

  // Fallback: pick the column with the longest average text
  if (!storyColumn) {
    let bestCol = headers[0];
    let bestAvg = 0;
    for (const col of headers) {
      const avg =
        rows.reduce((sum, r) => sum + (r[col]?.length || 0), 0) / rows.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestCol = col;
      }
    }
    storyColumn = bestCol;
  }

  const stories: ParsedStory[] = rows
    .map((row, i) => ({
      id: i + 1,
      content: (row[storyColumn!] || "").trim(),
      source: `${fileName} (row ${i + 2})`, // +2 for 1-index + header
    }))
    .filter((s) => s.content.length >= 10);

  return { stories, fileName, totalFound: stories.length };
}

function parseCsvFile(buffer: ArrayBuffer, fileName: string): ParseResult {
  const text = new TextDecoder("utf-8").decode(buffer);
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return extractStoriesFromRows(result.data, fileName);
}

// ---------------------------------------------------------------------------
// Excel file: read the first sheet, same logic as CSV
// ---------------------------------------------------------------------------

function parseExcelFile(buffer: ArrayBuffer, fileName: string): ParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Excel file has no sheets.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
  });

  return extractStoriesFromRows(
    rows.map((r) =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, String(v)]),
      ),
    ),
    fileName,
  );
}
