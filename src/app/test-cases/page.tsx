"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TestCaseTable } from "@/components/test-case-table";
import { ExportDialog } from "@/components/export-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Download, Trash2, Loader2 } from "lucide-react";
import type { TestCase } from "@/types";

export default function TestCasesPage() {
  const router = useRouter();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const fetchTestCases = useCallback(async () => {
    try {
      const res = await fetch("/api/test-cases");
      const data = await res.json();
      setTestCases(data.testCases || []);
    } catch {
      toast.error("Failed to load test cases.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestCases();
  }, [fetchTestCases]);

  function handleView(id: string) {
    router.push(`/test-cases/${id}`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this test case?")) return;

    try {
      const res = await fetch(`/api/test-cases/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete test case.");
        return;
      }
      setTestCases((prev) => prev.filter((tc) => tc.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("Test case deleted.");
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} test case(s)?`,
      )
    )
      return;

    setIsDeleting(true);
    try {
      const results = await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch(`/api/test-cases/${id}`, { method: "DELETE" }),
        ),
      );

      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        toast.error(`Failed to delete ${failed} test case(s).`);
      }

      setTestCases((prev) => prev.filter((tc) => !selectedIds.has(tc.id)));
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size - failed} test case(s) deleted.`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl py-8 px-4 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Cases</h1>
          <p className="text-muted-foreground mt-1">
            Browse, filter, and manage your saved test cases.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete ({selectedIds.size})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExport(true)}
              >
                <Download className="h-4 w-4" />
                Export ({selectedIds.size})
              </Button>
            </>
          )}
          {testCases.length > 0 && selectedIds.size === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExport(true)}
            >
              <Download className="h-4 w-4" />
              Export All
            </Button>
          )}
          <Button size="sm" onClick={() => router.push("/generate")}>
            <Plus className="h-4 w-4" />
            Generate New
          </Button>
        </div>
      </div>

      {/* Table */}
      {testCases.length > 0 ? (
        <TestCaseTable
          data={testCases}
          onView={handleView}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No test cases yet. Generate your first set!
          </p>
          <Button onClick={() => router.push("/generate")}>
            <Plus className="h-4 w-4" />
            Generate Test Cases
          </Button>
        </div>
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        selectedIds={Array.from(selectedIds)}
        totalCount={testCases.length}
      />
    </div>
  );
}
