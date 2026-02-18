# AI Test Case Generator

A full-stack Next.js application that generates structured manual test cases from requirements or user stories using AI. Supports **OpenAI** and **local Ollama models**, with manual input or batch file upload.

> **Built entirely with vibe coding** — every component, API route, and type definition was driven by natural language prompts in a single session.

[![Watch the Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-red?logo=youtube)](https://www.youtube.com/watch?v=Hib4E-I9gec)

## Features

- **AI-Powered Generation** — Generate comprehensive manual test cases from requirements or user stories
- **Dual AI Provider Support** — Choose between OpenAI (GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo) or local Ollama models with auto-detection
- **File Upload & Batch Processing** — Upload `.txt`, `.csv`, or `.xlsx` files containing multiple user stories and generate test cases for all of them at once
- **Smart Column Detection** — CSV/Excel parser auto-detects the story column by name or content length
- **Full CRUD Management** — View, edit, delete, and manage test cases with status workflows (Draft → Review → Approved)
- **Export** — Download test cases as CSV, Excel, or JSON
- **Structured Output** — Uses Zod schemas with Vercel AI SDK's `generateObject` for reliable, parseable results
- **Modern UI** — Built with shadcn/ui, Tailwind CSS, and Radix UI primitives

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, TypeScript) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) + [OpenAI](https://openai.com/) + [Ollama](https://ollama.ai/) |
| UI | [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/) |
| Validation | [Zod](https://zod.dev/) |
| Data Table | [@tanstack/react-table](https://tanstack.com/table) |
| File Parsing | [PapaParse](https://www.papaparse.com/) (CSV) + [SheetJS](https://sheetjs.com/) (Excel) |
| Storage | File-based JSON (`data/test-cases.json`) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- An [OpenAI API key](https://platform.openai.com/api-keys) (for OpenAI provider)
- [Ollama](https://ollama.ai/) installed locally (optional, for local models)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/vc-test-case-generator.git
cd vc-test-case-generator

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# OpenAI (required for OpenAI provider)
OPENAI_API_KEY=your-openai-api-key-here

# Ollama (optional — defaults to http://localhost:11434)
# OLLAMA_BASE_URL=http://localhost:11434
```

### Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Ollama (Optional)

To use local AI models instead of OpenAI:

1. [Install Ollama](https://ollama.ai/download)
2. Pull a model: `ollama pull llama3`
3. Start Ollama (it runs on `localhost:11434` by default)
4. In the app, select **Ollama (Local)** as the AI provider — installed models are auto-detected

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/       # AI test case generation endpoint
│   │   ├── models/         # Ollama model detection endpoint
│   │   ├── parse-file/     # File upload & parsing endpoint
│   │   ├── test-cases/     # CRUD API routes
│   │   └── export/         # CSV/Excel/JSON export endpoint
│   ├── generate/           # Generation page (Manual + File Upload tabs)
│   ├── test-cases/         # List & detail/edit pages
│   └── page.tsx            # Dashboard
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── test-case-form.tsx  # Manual input form
│   ├── file-upload-form.tsx # File upload with batch processing
│   ├── model-picker.tsx    # AI provider & model selector
│   ├── test-case-card.tsx  # Test case result card
│   ├── test-case-table.tsx # Data table with filters
│   ├── export-dialog.tsx   # Export format selector
│   └── navbar.tsx          # Top navigation
├── lib/
│   ├── openai.ts           # OpenAI + Ollama AI clients
│   ├── prompts.ts          # System & user prompt templates
│   ├── schemas.ts          # Zod validation schemas
│   ├── storage.ts          # File-based CRUD storage
│   ├── export.ts           # CSV/Excel/JSON export helpers
│   └── file-parser.ts      # .txt/.csv/.xlsx file parsers
└── types/
    └── index.ts            # TypeScript type definitions
```

## Usage

### Manual Input
1. Go to **Generate** → **Manual Input** tab
2. Select an AI Provider (OpenAI or Ollama) and model
3. Enter a requirement or user story
4. Optionally set context, count, and test types
5. Click **Generate Test Cases**
6. Review the results and click **Save All** or **Save Selected**

### File Upload (Batch)
1. Go to **Generate** → **File Upload** tab
2. Drag & drop or browse for a `.txt`, `.csv`, or `.xlsx` file
3. Review extracted stories — deselect any you don't want
4. Select provider/model and options
5. Click **Generate** — progress bar tracks each story
6. Save the results

### Managing Test Cases
- View all saved test cases in the **Test Cases** tab
- Click a test case to view details, edit, or change status
- Use bulk selection to export or delete multiple test cases

## Demo

📺 **[Watch the full build video on YouTube](https://www.youtube.com/watch?v=Hib4E-I9gec)**

## License

This project is open source and available under the [MIT License](LICENSE).
