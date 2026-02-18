"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TestCaseForm } from "@/components/test-case-form";
import { FileUploadForm } from "@/components/file-upload-form";
import { TestCaseCard } from "@/components/test-case-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckSquare, Save, Loader2, PenLine, Upload } from "lucide-react";
import type { TestCase } from "@/types";

export default function GeneratePage() {
  const router = useRouter();
  const [generatedCases, setGeneratedCases] = useState<TestCase[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [metadata, setMetadata] = useState<{
    model: string;
    tokensUsed: number;
    generatedAt: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleGenerated(
    testCases: TestCase[],
    meta: { model: string; tokensUsed: number; generatedAt: string },
  ) {
    setGeneratedCases(testCases);
    setSelectedIds(new Set(testCases.map((tc) => tc.id)));
    setMetadata(meta);
  }

  function handleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === generatedCases.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(generatedCases.map((tc) => tc.id)));
    }
  }

  async function handleSave(saveAll: boolean) {
    const toSave = saveAll
      ? generatedCases
      : generatedCases.filter((tc) => selectedIds.has(tc.id));

    if (toSave.length === 0) {
      toast.error("No test cases selected to save.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCases: toSave }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save test cases.");
        return;
      }

      toast.success(`${toSave.length} test case(s) saved successfully.`);
      router.push("/test-cases");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Generate Test Cases
        </h1>
        <p className="text-muted-foreground mt-1">
          Provide a requirement or user story and let AI generate comprehensive
          manual test cases.
        </p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="gap-2">
            <PenLine className="h-4 w-4" />
            Manual Input
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            File Upload
          </TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6">
          <TestCaseForm onGenerated={handleGenerated} />
        </TabsContent>
        <TabsContent value="upload" className="mt-6">
          <FileUploadForm onGenerated={handleGenerated} />
        </TabsContent>
      </Tabs>

      {/* Results */}
      {generatedCases.length > 0 && (
        <div className="space-y-6">
          <Separator />

          {/* Results header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">
                Generated Test Cases
                <Badge variant="secondary" className="ml-2">
                  {generatedCases.length}
                </Badge>
              </h2>
              {metadata && (
                <p className="text-xs text-muted-foreground">
                  Model: {metadata.model} &middot; Tokens:{" "}
                  {metadata.tokensUsed.toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                <CheckSquare className="h-4 w-4" />
                {selectedIds.size === generatedCases.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(false)}
                disabled={isSaving || selectedIds.size === 0}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Selected ({selectedIds.size})
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save All
              </Button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-4">
            {generatedCases.map((tc) => (
              <TestCaseCard
                key={tc.id}
                testCase={tc}
                selected={selectedIds.has(tc.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
