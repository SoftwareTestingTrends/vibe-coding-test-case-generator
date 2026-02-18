"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Save, X, Loader2, Trash2 } from "lucide-react";
import type { TestCase, Priority, Status, TestType } from "@/types";

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

const statusColors: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  Review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function TestCaseDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<TestCase>>({});

  const fetchTestCase = useCallback(async () => {
    try {
      const res = await fetch(`/api/test-cases/${params.id}`);
      if (!res.ok) {
        toast.error("Test case not found.");
        router.push("/test-cases");
        return;
      }
      const data = await res.json();
      setTestCase(data);
    } catch {
      toast.error("Failed to load test case.");
      router.push("/test-cases");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchTestCase();
  }, [fetchTestCase]);

  function startEditing() {
    if (!testCase) return;
    setEditData({
      title: testCase.title,
      description: testCase.description,
      preconditions: testCase.preconditions,
      steps: [...testCase.steps],
      expectedResult: testCase.expectedResult,
      priority: testCase.priority,
      type: testCase.type,
      status: testCase.status,
      tags: [...testCase.tags],
    });
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditData({});
  }

  function updateStep(index: number, value: string) {
    const steps = [...(editData.steps || [])];
    steps[index] = value;
    setEditData({ ...editData, steps });
  }

  function addStep() {
    setEditData({
      ...editData,
      steps: [...(editData.steps || []), ""],
    });
  }

  function removeStep(index: number) {
    const steps = [...(editData.steps || [])];
    steps.splice(index, 1);
    setEditData({ ...editData, steps });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // Clean up empty steps
      const cleanData = {
        ...editData,
        steps: editData.steps?.filter((s) => s.trim() !== ""),
      };

      const res = await fetch(`/api/test-cases/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update test case.");
        return;
      }

      const updated = await res.json();
      setTestCase(updated);
      setIsEditing(false);
      setEditData({});
      toast.success("Test case updated.");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this test case?")) return;

    try {
      const res = await fetch(`/api/test-cases/${params.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Failed to delete test case.");
        return;
      }
      toast.success("Test case deleted.");
      router.push("/test-cases");
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  async function handleStatusChange(newStatus: Status) {
    try {
      const res = await fetch(`/api/test-cases/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        toast.error("Failed to update status.");
        return;
      }

      const updated = await res.json();
      setTestCase(updated);
      toast.success(`Status changed to ${newStatus}.`);
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!testCase) return null;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/test-cases")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          {isEditing ? (
            <Input
              value={editData.title || ""}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="text-2xl font-bold h-auto py-1"
            />
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">
              {testCase.title}
            </h1>
          )}
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Select
                  value={editData.priority}
                  onValueChange={(val) =>
                    setEditData({ ...editData, priority: val as Priority })
                  }
                >
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={editData.type}
                  onValueChange={(val) =>
                    setEditData({ ...editData, type: val as TestType })
                  }
                >
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Functional">Functional</SelectItem>
                    <SelectItem value="Edge Case">Edge Case</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Usability">Usability</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Badge
                  variant="outline"
                  className={priorityColors[testCase.priority]}
                >
                  {testCase.priority}
                </Badge>
                <Badge variant="outline" className={typeColors[testCase.type]}>
                  {testCase.type}
                </Badge>
              </>
            )}
            {testCase.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Status:
              </span>
              <Badge
                variant="outline"
                className={statusColors[testCase.status]}
              >
                {testCase.status}
              </Badge>
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                {testCase.status !== "Draft" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange("Draft")}
                  >
                    Move to Draft
                  </Button>
                )}
                {testCase.status !== "Review" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange("Review")}
                  >
                    Move to Review
                  </Button>
                )}
                {testCase.status !== "Approved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange("Approved")}
                  >
                    Approve
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid gap-6">
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editData.description || ""}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                rows={3}
              />
            ) : (
              <p className="text-sm">{testCase.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Preconditions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preconditions</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editData.preconditions || ""}
                onChange={(e) =>
                  setEditData({ ...editData, preconditions: e.target.value })
                }
                rows={2}
              />
            ) : (
              <p className="text-sm">{testCase.preconditions || "None"}</p>
            )}
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test Steps</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                {editData.steps?.map((step, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-sm font-medium text-muted-foreground mt-2.5 min-w-[24px]">
                      {i + 1}.
                    </span>
                    <Input
                      value={step}
                      onChange={(e) => updateStep(i, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(i)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addStep}>
                  + Add Step
                </Button>
              </div>
            ) : (
              <ol className="list-decimal list-inside space-y-1.5 text-sm">
                {testCase.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Expected Result */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expected Result</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editData.expectedResult || ""}
                onChange={(e) =>
                  setEditData({ ...editData, expectedResult: e.target.value })
                }
                rows={3}
              />
            ) : (
              <p className="text-sm">{testCase.expectedResult}</p>
            )}
          </CardContent>
        </Card>

        {/* Source Requirement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source Requirement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {testCase.sourceRequirement}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Metadata */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>ID: {testCase.id}</span>
        <span>Created: {new Date(testCase.createdAt).toLocaleString()}</span>
        <span>Updated: {new Date(testCase.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}
