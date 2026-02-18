import { NextResponse } from "next/server";
import { getAll, getById } from "@/lib/storage";
import { toCSV, toExcel, toJSON } from "@/lib/export";
import type { TestCase } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") ?? "json";
    const ids = searchParams.get("ids");

    let testCases: TestCase[];

    if (ids) {
      const idList = ids.split(",").map((id) => id.trim());
      const results = await Promise.all(idList.map(getById));
      testCases = results.filter((tc): tc is TestCase => tc !== undefined);

      if (testCases.length === 0) {
        return NextResponse.json(
          { error: "No test cases found for the provided IDs" },
          { status: 404 },
        );
      }
    } else {
      testCases = await getAll();
    }

    if (testCases.length === 0) {
      return NextResponse.json(
        { error: "No test cases available to export" },
        { status: 404 },
      );
    }

    switch (format) {
      case "csv": {
        const csv = toCSV(testCases);
        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=test-cases.csv",
          },
        });
      }

      case "xlsx": {
        const data = toExcel(testCases);
        return new Response(data.buffer as ArrayBuffer, {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": "attachment; filename=test-cases.xlsx",
          },
        });
      }

      case "json": {
        const json = toJSON(testCases);
        return new Response(json, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Disposition": "attachment; filename=test-cases.json",
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unsupported format: ${format}. Use csv, xlsx, or json.` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export test cases" },
      { status: 500 },
    );
  }
}
