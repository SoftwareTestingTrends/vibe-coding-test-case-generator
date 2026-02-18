import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { TestCase } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "test-cases.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function getAll(): Promise<TestCase[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as TestCase[];
  } catch {
    return [];
  }
}

export async function getById(id: string): Promise<TestCase | undefined> {
  const all = await getAll();
  return all.find((tc) => tc.id === id);
}

export async function save(testCases: TestCase[]): Promise<TestCase[]> {
  await ensureDataDir();
  const existing = await getAll();
  const updated = [...existing, ...testCases];
  await writeFile(DATA_FILE, JSON.stringify(updated, null, 2));
  return testCases;
}

export async function update(
  id: string,
  data: Partial<Omit<TestCase, "id" | "createdAt">>,
): Promise<TestCase | null> {
  const all = await getAll();
  const index = all.findIndex((tc) => tc.id === id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await ensureDataDir();
  await writeFile(DATA_FILE, JSON.stringify(all, null, 2));
  return all[index];
}

export async function remove(id: string): Promise<boolean> {
  const all = await getAll();
  const filtered = all.filter((tc) => tc.id !== id);
  if (filtered.length === all.length) return false;

  await ensureDataDir();
  await writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
  return true;
}
