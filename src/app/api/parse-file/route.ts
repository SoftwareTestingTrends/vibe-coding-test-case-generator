import { NextResponse } from "next/server";
import { parseFile } from "@/lib/file-parser";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 },
      );
    }

    const allowedExtensions = ["txt", "csv", "xlsx", "xls"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: .${ext}. Supported: .txt, .csv, .xlsx, .xls`,
        },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await parseFile(buffer, file.name);

    if (result.stories.length === 0) {
      return NextResponse.json(
        {
          error:
            "No user stories found in the file. Ensure the file contains text with at least 10 characters per story.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("File parse error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to parse file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
