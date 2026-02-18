import { NextResponse } from "next/server";
import { getById, update, remove } from "@/lib/storage";
import { testCaseUpdateSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const testCase = await getById(id);

    if (!testCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(testCase);
  } catch (error) {
    console.error("Error fetching test case:", error);
    return NextResponse.json(
      { error: "Failed to fetch test case" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = testCaseUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid update data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const updated = await update(id, parsed.data);

    if (!updated) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating test case:", error);
    return NextResponse.json(
      { error: "Failed to update test case" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const deleted = await remove(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting test case:", error);
    return NextResponse.json(
      { error: "Failed to delete test case" },
      { status: 500 },
    );
  }
}
