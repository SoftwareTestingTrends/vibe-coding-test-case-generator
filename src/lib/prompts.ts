import { TestType } from "@/types";

export const SYSTEM_PROMPT = `You are a senior QA engineer with 15+ years of experience in software testing. Your task is to generate comprehensive manual test cases from the provided requirements or user stories.

For each test case, you must provide:
- A clear, concise title
- A description of what is being tested and why
- Any preconditions or setup required before execution
- Step-by-step instructions to execute the test
- The expected result after executing the steps
- A priority level (Critical, High, Medium, or Low)
- A test type (Functional, Edge Case, Negative, Performance, Security, or Usability)
- Relevant tags for categorization

Guidelines:
1. Cover the happy path (functional tests) as well as edge cases and negative scenarios.
2. Each test case must be independent and self-contained.
3. Steps should be specific and actionable — avoid vague instructions.
4. Expected results must be observable and verifiable.
5. Assign priority based on business impact: Critical for core functionality, High for important features, Medium for standard behavior, Low for nice-to-have validations.
6. Include boundary value tests where numeric inputs are involved.
7. Consider security implications (e.g., injection, unauthorized access) when relevant.
8. Consider usability aspects (e.g., error messages, loading states, accessibility).
9. Do not repeat test cases — each must test a distinct scenario.`;

export function buildUserPrompt(
  requirements: string,
  context?: string,
  count?: number,
  types?: TestType[],
): string {
  const parts: string[] = [];

  parts.push(
    `Generate test cases for the following requirement:\n\n${requirements}`,
  );

  if (context) {
    parts.push(`\nAdditional context:\n${context}`);
  }

  if (count && count > 0) {
    parts.push(`\nGenerate exactly ${count} test cases.`);
  } else {
    parts.push(
      `\nGenerate between 5 and 10 test cases to provide thorough coverage.`,
    );
  }

  if (types && types.length > 0) {
    parts.push(`\nFocus on the following test types: ${types.join(", ")}.`);
  } else {
    parts.push(
      `\nInclude a mix of test types: Functional, Edge Case, Negative, and where relevant, Performance, Security, and Usability.`,
    );
  }

  return parts.join("");
}
