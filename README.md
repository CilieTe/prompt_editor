# System Prompt Viewer

A simple, elegant text editor that highlights and formats system prompts for AI agents. Features syntax highlighting for steps, functions, control flow, negative constraints, quotes, and logical operators.

## Features

- **Syntax Highlighting**: Color-coded highlighting for different prompt elements:
  - Flow Control (if/then/else)
  - Strong Negative constraints
  - Weak Negative language
  - Steps (numbered processes)
  - Functions (snake_case function names)
  - Quotes
  - Logical operators
- **Split View**: Raw editor on the left, rich preview on the right
- **Filter Toggle**: Enable/disable specific highlight types
- **Copy/Clear**: Quick actions for clipboard and reset

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## No API Keys Required

This is a pure frontend application. No API keys or backend services are needed - just open and use!