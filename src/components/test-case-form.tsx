"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ModelPicker, type ModelSelection } from "@/components/model-picker";
import type { TestType, TestCase } from "@/types";

const TEST_TYPES: TestType[] = [
  "Functional",
  "Edge Case",
  "Negative",
  "Performance",
  "Security",
  "Usability",
];

interface TestCaseFormProps {
  onGenerated: (
    testCases: TestCase[],
    metadata: { model: string; tokensUsed: number; generatedAt: string },
  ) => void;
}

export function TestCaseForm({ onGenerated }: TestCaseFormProps) {
  const [requirements, setRequirements] = useState("");
  const [context, setContext] = useState("");
  const [count, setCount] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<TestType[]>([]);
  const [modelSelection, setModelSelection] = useState<ModelSelection>({
    provider: "openai",
    model: "gpt-4o",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleType(type: TestType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const body: Record<string, unknown> = {
        requirements,
        provider: modelSelection.provider,
        model: modelSelection.model,
      };
      if (context.trim()) body.context = context.trim();
      if (count && count !== "auto") body.count = parseInt(count, 10);
      if (selectedTypes.length > 0) body.types = selectedTypes;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate test cases");
        return;
      }

      onGenerated(data.testCases, data.metadata);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Test Cases</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">
              Requirements / User Story{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="requirements"
              placeholder="As a user, I want to log in with my email and password so that I can access my account..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={6}
              required
              minLength={10}
              maxLength={10000}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Paste a user story, requirement, or feature description. The more
              detail you provide, the better the test cases.
            </p>
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="context">Additional Context (optional)</Label>
            <Input
              id="context"
              placeholder="e.g., React frontend, REST API, PostgreSQL database..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              maxLength={5000}
            />
          </div>

          {/* AI Provider / Model */}
          <ModelPicker
            value={modelSelection}
            onChange={setModelSelection}
            idPrefix="manual"
          />

          {/* Count and Types row */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Count */}
            <div className="space-y-2">
              <Label htmlFor="count">Number of Test Cases</Label>
              <Select value={count} onValueChange={setCount}>
                <SelectTrigger id="count" className="w-full">
                  <SelectValue placeholder="Auto (5–10)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (5–10)</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Types */}
            <div className="space-y-2">
              <Label>Test Types (optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {TEST_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                    />
                    <Label
                      htmlFor={`type-${type}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading || requirements.length < 10}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Test Cases"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
