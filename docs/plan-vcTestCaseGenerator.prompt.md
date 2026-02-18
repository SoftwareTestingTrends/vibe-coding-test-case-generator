## Plan: Next.js AI Test Case Generator

A full-stack Next.js app that generates structured manual test cases from requirements or user stories. Supports **OpenAI (GPT-4o)** and **local Ollama models** as AI providers. Uses shadcn/ui + Tailwind for the UI, file-based JSON storage, and supports CSV/Excel/JSON export. Input can be entered manually or uploaded via `.txt`, `.csv`, or `.xlsx` files for batch processing. The Vercel AI SDK handles structured generation via both providers.

**Steps**

1. **Scaffold the Next.js project**  
   Run `npx create-next-app@latest` with TypeScript, Tailwind, and App Router (with `src/` dir). Install dependencies: `openai`, `ai`, `@ai-sdk/openai`, `zod`, `papaparse`, `xlsx`, `uuid`, and their type definitions. Initialize shadcn/ui and add components: `button`, `card`, `input`, `textarea`, `table`, `dialog`, `select`, `badge`, `tabs`, `sonner`.

2. **Define the data model** in `src/types/index.ts`  
   Create `TestCase` interface with fields: `id`, `title`, `description`, `preconditions`, `steps` (string[]), `expectedResult`, `priority` (Critical/High/Medium/Low), `type` (Functional/Edge Case/Negative/Performance/Security/Usability), `status` (Draft/Review/Approved), `tags`, `sourceRequirement`, `createdAt`, `updatedAt`. Also define `TestCaseGenerationRequest` and `TestCaseGenerationResponse`.

3. **Create prompt templates** in `src/lib/prompts.ts`  
   Define a system prompt instructing the AI to act as a senior QA engineer, output structured test cases matching the Zod schema, and cover functional, edge-case, and negative scenarios. Define a user prompt template that accepts `requirements`, optional `context`, desired `count`, and test `types` filter.

4. **Set up AI clients** in `src/lib/openai.ts`  
   Create OpenAI client reading `OPENAI_API_KEY` from `.env.local`. Create an Ollama client using `@ai-sdk/openai`'s `createOpenAI` pointed at Ollama's OpenAI-compatible endpoint (`localhost:11434/v1`). Export a `getModel(provider, model)` dispatcher that returns the correct AI model instance. Add `.env.local` with a placeholder OpenAI key and optional `OLLAMA_BASE_URL`.

5. **Build the generation API route** at `src/app/api/generate/route.ts`  
   Accept a POST with `{ requirements, context?, count?, types?, provider?, model? }`. Route to OpenAI or Ollama based on `provider`/`model`. Use Vercel AI SDK's `generateObject` with a Zod schema to get structured JSON output. Only validate `OPENAI_API_KEY` when using the OpenAI provider. Return the parsed test cases array with provider/model metadata. Handle errors gracefully.

6. **Build file-based storage layer** in `src/lib/storage.ts`  
   Implement `getAll()`, `getById()`, `save()`, `update()`, `remove()` functions that read/write to `data/test-cases.json` using `fs/promises`. Create the `data/` directory automatically if missing.

7. **Build CRUD API routes** for test cases:
   - `src/app/api/test-cases/route.ts` — `GET` (list all, with optional tag/status filters) and `POST` (save new batch)
   - `src/app/api/test-cases/[id]/route.ts` — `GET`, `PUT` (edit), `DELETE` individual test cases
   - Mark all data routes with `export const dynamic = "force-dynamic"` to prevent caching

8. **Build export API route** at `src/app/api/export/route.ts`  
   Accept `?format=csv|xlsx|json` and optional `?ids=` for selective export. Create helpers in `src/lib/export.ts` using `papaparse` for CSV and `xlsx` (SheetJS) for Excel. Set proper `Content-Disposition` headers for file download.

9. **Build the generation page UI** at `src/app/generate/page.tsx`
   - Tabbed interface with **Manual Input** and **File Upload** tabs
   - **Manual Input tab**: A form component (`src/components/test-case-form.tsx`) with a large textarea for requirements, optional context field, count selector, type checkboxes, and an AI provider/model picker
   - **File Upload tab**: A file upload form (`src/components/file-upload-form.tsx`) with drag & drop zone supporting `.txt`, `.csv`, `.xlsx` files. Parses uploaded files to extract user stories, displays them with checkboxes for review/selection, and generates test cases for all selected stories with a progress bar
   - Both tabs include a reusable model picker component (`src/components/model-picker.tsx`) that auto-detects installed Ollama models and lets users choose between OpenAI and Ollama
   - A "Generate" button that calls `/api/generate` and shows a loading spinner
   - A results preview section (`src/components/test-case-card.tsx`) displaying the generated test cases in cards
   - "Save All" and "Save Selected" buttons to persist to storage via `/api/test-cases`

10. **Build the test cases list page** at `src/app/test-cases/page.tsx`
    - A data table (`src/components/test-case-table.tsx`) using `@tanstack/react-table` + shadcn DataTable
    - Columns: title, type, priority, status, tags, created date
    - Row actions: view, edit, delete
    - Bulk selection with export button
    - Filter/search bar for tags, status, priority

11. **Build the detail/edit view** at `src/app/test-cases/[id]/page.tsx`  
    Display full test case details with inline editing capability. Allow status changes (Draft → Review → Approved).

12. **Build the export dialog** (`src/components/export-dialog.tsx`)  
    A modal triggered from the list page allowing format selection (CSV, Excel, JSON) and initiating download via the export API route.

13. **Build the home/dashboard page** at `src/app/page.tsx`  
    A landing page with a brief description, quick-action cards ("Generate Test Cases", "View Saved Test Cases"), and summary stats (total cases, by priority, by status).

14. **Add root layout and navigation** in `src/app/layout.tsx`  
    Sidebar or top nav with links: Home, Generate, Test Cases. Apply global fonts and Tailwind styles via `src/app/globals.css`.

15. **Add Zod validation schemas** in `src/lib/schemas.ts`  
    Validation for API inputs (generation request with `provider`/`model` fields, test case create/update) shared between client and server.

16. **Add `.gitignore` entries**  
    Ensure `data/test-cases.json`, `.env.local`, and `node_modules/` are gitignored.

17. **Build file upload support**
    - Create `src/lib/file-parser.ts` with parsers for `.txt` (split on blank lines / `---` separators), `.csv` (papaparse with smart column detection), and `.xlsx` (SheetJS with column detection). Returns `ParseResult { stories: ParsedStory[], fileName, totalFound }`.
    - Create `src/app/api/parse-file/route.ts` — POST endpoint accepting multipart FormData, validates file size (5 MB max) and extension, calls `parseFile()`, returns parsed stories.
    - Create `src/components/file-upload-form.tsx` — Drag & drop upload zone with file type validation, story review with checkboxes, generation options, and batch progress bar.

18. **Add Ollama support**
    - Create `src/app/api/models/route.ts` — GET endpoint that queries Ollama's `/api/tags` (3-second timeout), returns `{ available, models[] }` with name, size, family, and quantization details. Shows "Offline" when Ollama isn't running.
    - Create `src/components/model-picker.tsx` — Reusable AI provider/model selector. Shows OpenAI models (GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo) and auto-detected Ollama models in a dropdown. Includes a Refresh button to re-detect models.
    - Update `src/lib/openai.ts` to export both `openai` and `ollama` clients plus `getModel()` dispatcher.
    - Update `src/lib/schemas.ts` to add `provider` (openai/ollama) and `model` fields to the generation request schema.
    - Update `src/app/api/generate/route.ts` to route between providers based on request fields.

**Verification**

- Run `npm run dev` and visit `http://localhost:3000` — verify the home page loads
- Navigate to `/generate`, enter a sample user story (e.g., "As a user, I want to log in with email and password"), click Generate, and verify test cases appear
- **Test OpenAI**: Select OpenAI provider with GPT-4o model, generate test cases, verify structured output
- **Test Ollama**: Start Ollama locally, verify models appear in the dropdown, select one, generate test cases
- **Test File Upload**: Switch to the File Upload tab, upload a `.txt`/`.csv`/`.xlsx` file with multiple user stories, verify stories are extracted and displayed, generate batch test cases with progress bar
- Save the generated test cases, navigate to `/test-cases`, and verify they appear in the table
- Click Export → CSV and Export → Excel, verify files download with correct content
- Delete a test case from the list and verify it's removed
- Edit a test case's status from Draft to Approved and verify persistence
- Test with `OPENAI_API_KEY` unset to verify proper error messaging (only when using OpenAI provider)
- Test with Ollama not running to verify the "Offline" badge appears and the option is disabled

**Decisions**

- **Structured output over streaming**: Use `generateObject` for reliable structured test cases rather than streaming free text. This trades real-time token display for guaranteed parseable output.
- **Route Handlers over Server Actions**: Route Handlers give explicit control over response headers (needed for file downloads) and are easier to test independently.
- **File-based storage over SQLite**: Per your preference; keeps the app simple with no DB setup. Can migrate to SQLite later if scale demands it.
- **shadcn/ui**: Copy-paste component model with zero lock-in, Tailwind-native, accessible (Radix UI under the hood).
- **`@tanstack/react-table`**: Headless table for maximum flexibility with shadcn DataTable pattern.
- **Ollama via OpenAI-compatible API**: Reuses the existing `@ai-sdk/openai` package by pointing it at Ollama's `/v1` endpoint — no extra dependencies needed.
- **File upload with smart column detection**: The CSV/Excel parser auto-detects the "story" column by looking for common names (story, requirement, description, etc.) and falls back to the column with the longest average text content.
