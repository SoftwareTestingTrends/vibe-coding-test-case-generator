import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parameter_size: string;
    quantization_level: string;
    family: string;
  };
}

interface OllamaTagsResponse {
  models: OllamaModel[];
}

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({
        available: false,
        models: [],
        error: "Ollama returned an error.",
      });
    }

    const data: OllamaTagsResponse = await res.json();

    const models = data.models.map((m) => ({
      id: m.name,
      name: m.name,
      size: m.details?.parameter_size || "unknown",
      family: m.details?.family || "unknown",
      quantization: m.details?.quantization_level || "",
    }));

    return NextResponse.json({ available: true, models });
  } catch {
    return NextResponse.json({
      available: false,
      models: [],
      error:
        "Could not connect to Ollama. Make sure it is running on " +
        OLLAMA_BASE_URL,
    });
  }
}
