import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { TestCase } from "@/types";

interface FlatTestCase {
  ID: string;
  Title: string;
  Description: string;
  Preconditions: string;
  Steps: string;
  "Expected Result": string;
  Priority: string;
  Type: string;
  Status: string;
  Tags: string;
  "Source Requirement": string;
  "Created At": string;
  "Updated At": string;
}

function flatten(testCases: TestCase[]): FlatTestCase[] {
  return testCases.map((tc) => ({
    ID: tc.id,
    Title: tc.title,
    Description: tc.description,
    Preconditions: tc.preconditions,
    Steps: tc.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    "Expected Result": tc.expectedResult,
    Priority: tc.priority,
    Type: tc.type,
    Status: tc.status,
    Tags: tc.tags.join(", "),
    "Source Requirement": tc.sourceRequirement,
    "Created At": tc.createdAt,
    "Updated At": tc.updatedAt,
  }));
}

export function toCSV(testCases: TestCase[]): string {
  return Papa.unparse(flatten(testCases));
}

export function toExcel(testCases: TestCase[]): Uint8Array {
  const flat = flatten(testCases);
  const ws = XLSX.utils.json_to_sheet(flat);

  // Auto-size columns based on header widths
  ws["!cols"] = Object.keys(flat[0] || {}).map((key) => ({
    wch: Math.max(key.length, 20),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Test Cases");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
}

export function toJSON(testCases: TestCase[]): string {
  return JSON.stringify(testCases, null, 2);
}
