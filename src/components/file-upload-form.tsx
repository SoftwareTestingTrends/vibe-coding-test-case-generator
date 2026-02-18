"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
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

const ACCEPTED_TYPES = ".txt,.csv,.xlsx,.xls";

interface ParsedStory {
  id: number;
  content: string;
  source: string;
}

interface FileUploadFormProps {
  onGenerated: (
    testCases: TestCase[],
    metadata: { model: string; tokensUsed: number; generatedAt: string },
  ) => void;
}

export function FileUploadForm({ onGenerated }: FileUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stories, setStories] = useState<ParsedStory[]>([]);
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<number>>(
    new Set(),
  );
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Options
  const [context, setContext] = useState("");
  const [count, setCount] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<TestType[]>([]);
  const [modelSelection, setModelSelection] = useState<ModelSelection>({
    provider: "openai",
    model: "gpt-4o",
  });

  function toggleType(type: TestType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  const handleFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setStories([]);
    setSelectedStoryIds(new Set());
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/parse-file", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to parse file.");
        setFile(null);
        return;
      }

      setStories(data.stories);
      setSelectedStoryIds(new Set(data.stories.map((s: ParsedStory) => s.id)));
    } catch {
      setError("Network error. Please try again.");
      setFile(null);
    } finally {
      setIsParsing(false);
    }
  }, []);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  }

  function clearFile() {
    setFile(null);
    setStories([]);
    setSelectedStoryIds(new Set());
    setError(null);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function toggleStory(id: number) {
    setSelectedStoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAllStories() {
    if (selectedStoryIds.size === stories.length) {
      setSelectedStoryIds(new Set());
    } else {
      setSelectedStoryIds(new Set(stories.map((s) => s.id)));
    }
  }

  async function handleGenerate() {
    const selected = stories.filter((s) => selectedStoryIds.has(s.id));
    if (selected.length === 0) {
      setError("Please select at least one user story.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setProgress({ current: 0, total: selected.length });

    const allTestCases: TestCase[] = [];
    let totalTokens = 0;

    try {
      for (let i = 0; i < selected.length; i++) {
        setProgress({ current: i + 1, total: selected.length });

        const body: Record<string, unknown> = {
          requirements: selected[i].content,
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
          setError(
            `Error generating for story ${i + 1}: ${data.error || "Unknown error"}`,
          );
          // Continue with remaining stories
          continue;
        }

        allTestCases.push(...data.testCases);
        totalTokens += data.metadata?.tokensUsed || 0;
      }

      if (allTestCases.length > 0) {
        onGenerated(allTestCases, {
          model: `${modelSelection.provider}/${modelSelection.model}`,
          tokensUsed: totalTokens,
          generatedAt: new Date().toISOString(),
        });
      } else {
        setError("No test cases were generated. Please check the errors above.");
      }
    } catch {
      setError("Network error during generation. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }

  const fileIcon =
    file?.name.endsWith(".csv") ||
    file?.name.endsWith(".xlsx") ||
    file?.name.endsWith(".xls") ? (
      <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
    ) : (
      <FileText className="h-5 w-5 text-blue-600" />
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop zone */}
        {!file && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop a file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .txt, .csv, .xlsx, .xls (max 5 MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        )}

        {/* File info */}
        {file && (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            {fileIcon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              disabled={isGenerating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Parsing spinner */}
        {isParsing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing file...
          </div>
        )}

        {/* Extracted stories */}
        {stories.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Extracted User Stories
                <Badge variant="secondary" className="ml-2">
                  {stories.length}
                </Badge>
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllStories}
                className="text-xs"
              >
                {selectedStoryIds.size === stories.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 rounded-md border p-3">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="flex items-start gap-2 rounded-md p-2 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedStoryIds.has(story.id)}
                    onCheckedChange={() => toggleStory(story.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{story.content}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {story.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Options (shown when stories are loaded) */}
        {stories.length > 0 && (
          <>
            {/* Additional Context */}
            <div className="space-y-2">
              <Label htmlFor="file-context">
                Additional Context (optional)
              </Label>
              <Input
                id="file-context"
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
              idPrefix="file"
            />

            {/* Count and Types */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="file-count">
                  Test Cases per Story
                </Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger id="file-count" className="w-full">
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

              <div className="space-y-2">
                <Label>Test Types (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TEST_TYPES.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`file-type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                      />
                      <Label
                        htmlFor={`file-type-${type}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Progress */}
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating test cases for story {progress.current} of{" "}
              {progress.total}...
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Generate button */}
        {stories.length > 0 && (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || selectedStoryIds.size === 0}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" />
                Generating ({progress?.current}/{progress?.total})...
              </>
            ) : (
              `Generate Test Cases for ${selectedStoryIds.size} Story${selectedStoryIds.size !== 1 ? "s" : ""}`
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
