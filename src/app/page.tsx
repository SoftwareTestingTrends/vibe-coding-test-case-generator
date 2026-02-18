import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, ListChecks, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Test Case Generator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Generate comprehensive manual test cases from your requirements and
          user stories using AI. Save, manage, and export them in CSV, Excel, or
          JSON.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Link href="/generate" className="group">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <FlaskConical className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Generate Test Cases</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Paste a requirement or user story and let AI generate detailed
                test cases covering functional, edge-case, negative, and more
                scenarios.
              </p>
              <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto">
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/test-cases" className="group">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <ListChecks className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">View Test Cases</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Browse, filter, edit, and manage your saved test cases. Export
                them to CSV, Excel, or JSON for your test management workflow.
              </p>
              <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto">
                View all
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Features */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "AI-Powered",
            description:
              "Uses GPT-4o to generate context-aware test cases with proper coverage of edge cases and negative scenarios.",
          },
          {
            title: "Structured Output",
            description:
              "Each test case includes title, steps, expected results, priority, type, and tags — ready for your QA workflow.",
          },
          {
            title: "Export Anywhere",
            description:
              "Export your test cases to CSV, Excel (.xlsx), or JSON. Compatible with any test management tool.",
          },
        ].map((feature) => (
          <Card key={feature.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
