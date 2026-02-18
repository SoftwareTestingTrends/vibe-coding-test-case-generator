"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Server, Cloud } from "lucide-react";

interface OllamaModel {
  id: string;
  name: string;
  size: string;
  family: string;
  quantization: string;
}

export interface ModelSelection {
  provider: "openai" | "ollama";
  model: string;
}

interface ModelPickerProps {
  value: ModelSelection;
  onChange: (selection: ModelSelection) => void;
  /** HTML id prefix for form labels */
  idPrefix?: string;
}

const OPENAI_MODELS = [
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

export function ModelPicker({
  value,
  onChange,
  idPrefix = "model",
}: ModelPickerProps) {
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const [isLoadingOllama, setIsLoadingOllama] = useState(false);

  const fetchOllamaModels = useCallback(async () => {
    setIsLoadingOllama(true);
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      setOllamaAvailable(data.available);
      setOllamaModels(data.models || []);
    } catch {
      setOllamaAvailable(false);
      setOllamaModels([]);
    } finally {
      setIsLoadingOllama(false);
    }
  }, []);

  useEffect(() => {
    fetchOllamaModels();
  }, [fetchOllamaModels]);

  function handleProviderChange(provider: string) {
    if (provider === "openai") {
      onChange({ provider: "openai", model: "gpt-4o" });
    } else {
      onChange({
        provider: "ollama",
        model: ollamaModels[0]?.id || "",
      });
    }
  }

  function handleModelChange(model: string) {
    onChange({ ...value, model });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Provider */}
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-provider`}>AI Provider</Label>
        <Select value={value.provider} onValueChange={handleProviderChange}>
          <SelectTrigger id={`${idPrefix}-provider`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">
              <span className="flex items-center gap-2">
                <Cloud className="h-3.5 w-3.5" />
                OpenAI
              </span>
            </SelectItem>
            <SelectItem value="ollama" disabled={ollamaAvailable === false}>
              <span className="flex items-center gap-2">
                <Server className="h-3.5 w-3.5" />
                Ollama (Local)
                {ollamaAvailable === false && (
                  <Badge variant="outline" className="ml-1 text-[10px]">
                    Offline
                  </Badge>
                )}
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${idPrefix}-model`}>Model</Label>
          {value.provider === "ollama" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={fetchOllamaModels}
              disabled={isLoadingOllama}
            >
              {isLoadingOllama ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh
            </Button>
          )}
        </div>

        {value.provider === "openai" ? (
          <Select value={value.model} onValueChange={handleModelChange}>
            <SelectTrigger id={`${idPrefix}-model`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPENAI_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : isLoadingOllama ? (
          <div className="flex items-center gap-2 h-9 px-3 border rounded-md text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Detecting models...
          </div>
        ) : ollamaModels.length === 0 ? (
          <div className="flex items-center h-9 px-3 border rounded-md text-sm text-muted-foreground">
            No models found. Run{" "}
            <code className="mx-1 text-xs bg-muted px-1 rounded">
              ollama pull llama3
            </code>
          </div>
        ) : (
          <Select value={value.model} onValueChange={handleModelChange}>
            <SelectTrigger id={`${idPrefix}-model`} className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {ollamaModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="flex items-center gap-2">
                    {m.name}
                    <span className="text-[10px] text-muted-foreground">
                      {m.size}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
