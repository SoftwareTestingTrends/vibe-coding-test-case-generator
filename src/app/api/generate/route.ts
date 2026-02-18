import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { v4 as uuidv4 } from "uuid";
import { getModel } from "@/lib/openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { generateRequestSchema, generatedTestCasesSchema } from "@/lib/schemas";
import type { TestCase } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = generateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { requirements, context, count, types, provider, model } =
      parsed.data;

    // Validate OpenAI key only when using OpenAI provider
    if (
      provider === "openai" &&
      (!process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === "your-openai-api-key-here")
    ) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key is not configured. Set OPENAI_API_KEY in .env.local.",
        },
        { status: 500 },
      );
    }

    // Validate Ollama model is specified
    if (provider === "ollama" && !model) {
      return NextResponse.json(
        { error: "Please select an Ollama model." },
        { status: 400 },
      );
    }

    const resolvedModel = model || "gpt-4o";
    const aiModel = getModel(provider ?? "openai", resolvedModel);

    const userPrompt = buildUserPrompt(requirements, context, count, types);

    const { object, usage } = await generateObject({
      model: aiModel,
      schema: generatedTestCasesSchema,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    const now = new Date().toISOString();
    const testCases: TestCase[] = object.testCases.map((tc) => ({
      ...tc,
      id: uuidv4(),
      status: "Draft" as const,
      sourceRequirement: requirements,
      createdAt: now,
      updatedAt: now,
    }));

    return NextResponse.json({
      testCases,
      metadata: {
        model: resolvedModel,
        provider: provider ?? "openai",
        tokensUsed: usage?.totalTokens ?? 0,
        generatedAt: now,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
