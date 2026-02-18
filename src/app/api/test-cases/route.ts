import { NextResponse } from "next/server";
import { getAll, save } from "@/lib/storage";
import { testCaseSchema } from "@/lib/schemas";
import type { TestCase } from "@/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const tag = searchParams.get("tag");
    const priority = searchParams.get("priority");
    const type = searchParams.get("type");

    let testCases = await getAll();

    if (status) {
      testCases = testCases.filter((tc) => tc.status === status);
    }
    if (tag) {
      testCases = testCases.filter((tc) =>
        tc.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
      );
    }
    if (priority) {
      testCases = testCases.filter((tc) => tc.priority === priority);
    }
    if (type) {
      testCases = testCases.filter((tc) => tc.type === type);
    }

    return NextResponse.json({ testCases, total: testCases.length });
  } catch (error) {
    console.error("Error fetching test cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch test cases" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const schema = z.object({
      testCases: z.array(testCaseSchema),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid test cases", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const saved = await save(parsed.data.testCases);

    return NextResponse.json(
      { testCases: saved, count: saved.length },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving test cases:", error);
    return NextResponse.json(
      { error: "Failed to save test cases" },
      { status: 500 },
    );
  }
}
