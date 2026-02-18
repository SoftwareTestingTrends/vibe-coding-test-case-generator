import { z } from "zod";

// --- Enums ---

export const priorityEnum = z.enum(["Critical", "High", "Medium", "Low"]);

export const testTypeEnum = z.enum([
  "Functional",
  "Edge Case",
  "Negative",
  "Performance",
  "Security",
  "Usability",
]);

export const statusEnum = z.enum(["Draft", "Review", "Approved"]);

// --- Generation request (client → API) ---

export const generateRequestSchema = z.object({
  requirements: z
    .string()
    .min(10, "Requirements must be at least 10 characters")
    .max(10000, "Requirements must be at most 10,000 characters"),
  context: z.string().max(5000).optional(),
  count: z.number().int().min(1).max(30).optional(),
  types: z.array(testTypeEnum).optional(),
  provider: z.enum(["openai", "ollama"]).optional().default("openai"),
  model: z.string().optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

// --- AI-generated test case (what the model returns) ---

export const generatedTestCaseSchema = z.object({
  title: z.string(),
  description: z.string(),
  preconditions: z.string(),
  steps: z.array(z.string()),
  expectedResult: z.string(),
  priority: priorityEnum,
  type: testTypeEnum,
  tags: z.array(z.string()),
});

export const generatedTestCasesSchema = z.object({
  testCases: z.array(generatedTestCaseSchema),
});

// --- Stored test case (full record with id, status, timestamps) ---

export const testCaseSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  preconditions: z.string(),
  steps: z.array(z.string()).min(1),
  expectedResult: z.string().min(1),
  priority: priorityEnum,
  type: testTypeEnum,
  status: statusEnum,
  tags: z.array(z.string()),
  sourceRequirement: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const testCaseUpdateSchema = testCaseSchema
  .omit({ id: true, createdAt: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
