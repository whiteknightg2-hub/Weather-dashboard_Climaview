# AGENTS.md — AI Agent Instructions for Weather Dashboard

This file tells any AI coding agent how to behave while working on this project.
**Read this file before making any changes.**

---

## Golden Rules

1. **Make small, incremental changes.** Do not rewrite large sections of code in a single step. Change one thing at a time, explain what you changed, then stop and wait for review.
2. **Explain every file you touch — in beginner language.** Before editing a file, state which file it is, what you are changing, and why. After making the change, describe *what the code now does* and *why it is needed*, as if explaining to someone learning web development for the first time.
3. **Reuse existing files.** Do not create a new file if the task can be done by editing an existing one.
4. **Never invent weather data.** All displayed weather values must come from the live Open-Meteo API response. Do not hardcode temperatures, conditions, humidity, or wind speeds.
5. **Test before claiming success.** Only say "this works" after you have actually verified it in a browser or with a real API call. If you cannot test something, say so clearly.
6. **Ask before big changes.** If a task would require adding a new file, changing the folder structure, adding a library, or rewriting a major section of code, stop and ask for approval first.
7. **No automatic Git actions.** Do not run `git commit`, `git push`, `git init`, or any other command that modifies the repository — including deploying to GitHub Pages — without explicit approval from the developer.
8. **Protect all documentation files.** Do not modify `AGENTS.md`, `PROJECT.md`, `PRD.md`, `TKD.md`, `DESIGN.md`, or `README.md` without explicit approval. These files are the source of truth for the project.

---

## Beginner-Friendly Communication

- Write explanations as if the reader is learning web development for the first time.
- Define technical terms the first time you use them (e.g., explain what an API, fetch, or callback is).
- Prefer simple, readable code over clever or compact code.
- Add a short comment above every non-obvious line of JavaScript so the developer can follow the logic.
- If there is a simpler way to accomplish a task, prefer it over the advanced approach.

---

## Code Style

- **HTML:** Use semantic elements (`<header>`, `<main>`, `<section>`, `<button>`, etc.). Include `alt` attributes on all images.
- **CSS:** Use clear class names that describe purpose (e.g., `.weather-card`, `.loading-spinner`). Avoid deeply nested selectors. Use CSS custom properties (variables) for colours and font sizes.
- **JavaScript:** Use `const` and `let`; never `var`. Use `async/await` for all asynchronous code (no `.then()` chains). Add a `try/catch` block around every `fetch` call.

---

## Dependency Policy

- Do not install npm packages, CDN libraries, or any external dependency without explicit approval.
- Do not add a `package.json`, `node_modules`, or any build configuration file.
- The only permitted external resource is the Open-Meteo API endpoint.

---

## File Change Reporting Format

Every time you modify files, begin your response with a summary like this:

```
### Files changed
- `index.html` — Added the city dropdown element and loading spinner placeholder.
- `style.css` — Added styles for the dropdown and spinner.
```

Then explain what each change does and why it is needed.

---

## Things That Require Explicit Approval

The following actions must **not** happen without the developer saying "go ahead" or "approved":

- Adding any new file not already listed in `PROJECT.md`.
- Installing or importing any external library.
- Changing the folder structure.
- Rewriting more than ~20 lines of existing code in a single step.
- Running any `git` command (`git init`, `git add`, `git commit`, `git push`, etc.).
- Deploying to GitHub Pages.
- Modifying any documentation file: `AGENTS.md`, `PROJECT.md`, `PRD.md`, `TKD.md`, `DESIGN.md`, or `README.md`.

---

## What to Do When Uncertain

If you are unsure whether an API field exists, whether a browser feature is supported, or whether a design decision is correct:

1. State your uncertainty clearly.
2. Document your assumption in the relevant code comment.
3. Flag the assumption for the developer to verify.

Do not guess silently or invent an answer.
