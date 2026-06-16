# Question Renderer

A reusable React form renderer driven entirely by a JSON config file. Built with Vite, React, and TypeScript.

---

## How to run the app

```bash
git clone https://github.com/YOUR_USERNAME/question-renderer.git
cd question-renderer
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How to run tests

```bash
npx vitest
```

To run tests once without watch mode:

```bash
npx vitest run
```

---

## Example question data

Questions live in `src/config/questions.json`. Each question object follows this shape:

```json
{
  "id": "fullName",
  "type": "text",
  "label": "Full Name",
  "placeholder": "Enter your full name",
  "validation": {
    "required": true,
    "minLength": 3,
    "maxLength": 100
  }
}
```

---

## How each question type works

| Type | Rendered element | Answer value |
|---|---|---|
| `text` | `<input type="text" />` | string |
| `textarea` | `<textarea />` | string |
| `select` | `<select />` with options | string |
| `radio` | One radio input per option | string |
| `checkbox` | One checkbox per option | string[] |

---

## How to change the form

Open `src/config/questions.json` and add, remove, or edit questions. The form updates automatically. No code changes needed.

To add a new question:

```json
{
  "id": "city",
  "type": "text",
  "label": "City",
  "placeholder": "Enter your city",
  "validation": {
    "required": true,
    "minLength": 2
  }
}
```

---

## Validation rules

Each question supports these optional validation rules:

| Rule | Applies to | Description |
|---|---|---|
| `required` | all types | Field must not be empty |
| `minLength` | text, textarea | Minimum number of characters |
| `maxLength` | text, textarea | Maximum number of characters |
| `pattern` | text | Regex pattern the value must match |

---

## How allowPasting works

The `QuestionRenderer` component accepts an `allowPasting` prop.

```tsx
<QuestionRenderer
  questions={questions}
  allowPasting={false}
  onSubmit={handleSubmit}
/>
```

- `allowPasting={false}` — blocks paste into all text and textarea fields
- `allowPasting={true}` — allows paste normally

This is useful for assessments where you want students to type their own answers.

---

## Submitted answer format

On submit, `onSubmit` is called with an object where each key is the question `id`:

```json
{
  "fullName": "levi monda",
  "motivation": "I want to join because...",
  "educationLevel": "bachelors",
  "preferredTrack": "fullstack",
  "skills": ["html", "css", "javascript"]
}
```

Checkbox answers are always arrays. All other types are strings.

---

## Project structure
src/
  components/
    QuestionRenderer.tsx   — the reusable form component
  config/
    questions.json         — edit this to change the form
  types/
    question.ts            — TypeScript type definitions
  tests/
    QuestionRenderer.test.tsx  — automated tests
    setup.ts               — test environment setup
  App.tsx                  — demo page
  main.tsx                 — app entry point
