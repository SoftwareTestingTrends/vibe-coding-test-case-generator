"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileJson, FileText } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  totalCount: number;
}

export function ExportDialog({
  open,
  onOpenChange,
  selectedIds,
  totalCount,
}: ExportDialogProps) {
  const hasSelection = selectedIds.length > 0;
  const count = hasSelection ? selectedIds.length : totalCount;

  function handleExport(format: "csv" | "xlsx" | "json") {
    const params = new URLSearchParams({ format });
    if (hasSelection) {
      params.set("ids", selectedIds.join(","));
    }
    window.open(`/api/export?${params.toString()}`, "_blank");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Test Cases</DialogTitle>
          <DialogDescription>
            Export {count} test case(s) in your preferred format.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => handleExport("csv")}
          >
            <FileText className="h-5 w-5 mr-3 text-green-600" />
            <div className="text-left">
              <p className="font-medium">CSV</p>
              <p className="text-xs text-muted-foreground">
                Comma-separated values, works with any spreadsheet app
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => handleExport("xlsx")}
          >
            <FileSpreadsheet className="h-5 w-5 mr-3 text-emerald-600" />
            <div className="text-left">
              <p className="font-medium">Excel (.xlsx)</p>
              <p className="text-xs text-muted-foreground">
                Native Excel format with auto-sized columns
              </p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => handleExport("json")}
          >
            <FileJson className="h-5 w-5 mr-3 text-blue-600" />
            <div className="text-left">
              <p className="font-medium">JSON</p>
              <p className="text-xs text-muted-foreground">
                Structured data format for programmatic use
              </p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
