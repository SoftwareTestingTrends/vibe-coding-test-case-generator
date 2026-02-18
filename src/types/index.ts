export type Priority = "Critical" | "High" | "Medium" | "Low";

export type TestType =
  | "Functional"
  | "Edge Case"
  | "Negative"
  | "Performance"
  | "Security"
  | "Usability";

export type Status = "Draft" | "Review" | "Approved";

export interface TestCase {
  id: string;
  title: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: Priority;
  type: TestType;
  status: Status;
  tags: string[];
  sourceRequirement: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseGenerationRequest {
  requirements: string;
  context?: string;
  count?: number;
  types?: TestType[];
}

export interface TestCaseGenerationResponse {
  testCases: TestCase[];
  metadata: {
    model: string;
    tokensUsed: number;
    generatedAt: string;
  };
}
