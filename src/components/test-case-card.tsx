"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { TestCase } from "@/types";

const priorityColors: Record<string, string> = {
  Critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const typeColors: Record<string, string> = {
  Functional: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "Edge Case":
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Performance: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  Security: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Usability:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
};

interface TestCaseCardProps {
  testCase: TestCase;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function TestCaseCard({
  testCase,
  selected,
  onSelect,
}: TestCaseCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {onSelect && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(testCase.id, !!checked)}
              className="mt-1"
            />
          )}
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base leading-snug">
              {testCase.title}
            </CardTitle>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                variant="outline"
                className={priorityColors[testCase.priority]}
              >
                {testCase.priority}
              </Badge>
              <Badge variant="outline" className={typeColors[testCase.type]}>
                {testCase.type}
              </Badge>
              {testCase.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Description */}
        <div>
          <p className="font-medium text-muted-foreground mb-1">Description</p>
          <p>{testCase.description}</p>
        </div>

        {/* Preconditions */}
        {testCase.preconditions && (
          <div>
            <p className="font-medium text-muted-foreground mb-1">
              Preconditions
            </p>
            <p>{testCase.preconditions}</p>
          </div>
        )}

        {/* Steps */}
        <div>
          <p className="font-medium text-muted-foreground mb-1">Steps</p>
          <ol className="list-decimal list-inside space-y-1">
            {testCase.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Expected Result */}
        <div>
          <p className="font-medium text-muted-foreground mb-1">
            Expected Result
          </p>
          <p>{testCase.expectedResult}</p>
        </div>
      </CardContent>
    </Card>
  );
}
