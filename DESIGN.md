# DESIGN.md — Visual Design Specification

## Weather Dashboard · Version 1.0

---

## 1. Design Philosophy

The goal is a **clean, modern, and calm** interface. The dashboard should feel like a well-made productivity tool — nothing flashy, nothing distracting. White space does the heavy lifting. Every element on the screen must earn its place.

- **Minimal:** Show only what the user needs.
- **Readable:** Large, clear text for the most important data (temperature).
- **Calm:** A light, neutral palette with a single restrained blue accent.
- **Accessible:** High contrast, keyboard focus styles, and semantic HTML.

---

## 2. Colour Palette

```css
:root {
  /* Backgrounds */
  --color-bg-page:   #f5f7fa;   /* Very light grey — page background */
  --color-bg-card:   #ffffff;   /* Pure white — card surface */

  /* Borders & Shadows */
  --color-border:    #e2e8f0;   /* Subtle grey border */
  --shadow-card:     0 2px 8px rgba(0, 0, 0, 0.08);  /* Soft card shadow */

  /* Text */
  --color-text-primary:   #1a202c;  /* Near-black — headings and data */
  --color-text-secondary: #4a5568;  /* Medium grey — labels */
  --color-text-muted:     #718096;  /* Light grey — timestamps, hints */

  /* Accent */
  --color-accent:         #3182ce;  /* Blue — interactive elements */
  --color-accent-hover:   #2b6cb0;  /* Darker blue — hover state */

  /* Status */
  --color-error-bg:   #fff5f5;  /* Very light red */
  --color-error-text: #c53030;  /* Dark red */
  --color-error-border: #fc8181; /* Medium red border */
}
```

> **Contrast check (assumption, not yet verified):** `--color-text-primary` (#1a202c) on `--color-bg-card` (#ffffff) is expected to exceed the WCAG AA minimum ratio of 4.5:1. Verify with a contrast checker such as [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker) before publishing.

---

## 3. Typography

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                  Helvetica, Arial, sans-serif;
  /* Using the system font stack avoids loading an external font file. */

  --font-size-base:   1rem;     /* 16px — body text */
  --font-size-sm:     0.875rem; /* 14px — labels, captions */
  --font-size-lg:     1.25rem;  /* 20px — card headings */
  --font-size-xl:     2rem;     /* 32px — temperature value */
  --font-size-xxl:    3.5rem;   /* 56px — large temperature on desktop */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   700;

  --line-height-base: 1.5;
}
```

---

## 4. Spacing Scale

Use multiples of 4 px for all margins and paddings:

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4 px | Tiny gaps (icon to label) |
| `--space-2` | 8 px | Small internal padding |
| `--space-3` | 12 px | Compact card padding |
| `--space-4` | 16 px | Standard element spacing |
| `--space-6` | 24 px | Section gaps |
| `--space-8` | 32 px | Large section gaps |
| `--space-12` | 48 px | Page-level vertical padding |

---

## 5. Layout

### 5.1 Overall Page Structure

```
┌──────────────────────────────────┐
│           Page Header            │  ← App title: "Weather Dashboard"
├──────────────────────────────────┤
│         City Selector            │  ← <select> dropdown, centred
├──────────────────────────────────┤
│                                  │
│         Weather Card             │  ← Main content area (see below)
│                                  │
├──────────────────────────────────┤
│            Footer                │  ← "Data by Open-Meteo" attribution
└──────────────────────────────────┘
```

### 5.2 Weather Card Layout (Desktop, ≥ 768 px)

The weather card is a centred white card, max-width 640 px, with card shadow.

> **Note:** The numbers below (`18°C`, `76 %`, `18 km/h`) are **placeholder examples** used only to show the layout. In the real app, all values come from the API — never from the code.

```
┌─────────────────────────────────────────────────────┐
│  [Icon]   18°C                                      │
│           Partly Cloudy                             │
│─────────────────────────────────────────────────────│
│  💧 Humidity        │  💨 Wind Speed               │
│  76 %               │  18 km/h                    │
└─────────────────────────────────────────────────────┘
```

- The temperature is the visually dominant element (`--font-size-xxl`, bold).
- The weather icon sits to the left of the temperature, roughly 48–64 px in size (emoji or SVG).
- Below the temperature, the condition label is displayed in `--font-size-lg`, `--color-text-secondary`.
- Humidity and wind are shown as two side-by-side info cards beneath a divider line.

### 5.3 Mobile Layout (< 768 px)

On mobile, all elements stack vertically and the card spans the full width with reduced horizontal padding.

```
┌──────────────────┐
│  Weather Dashboard│  ← Page title (smaller)
├──────────────────┤
│  [City dropdown] │  ← Full-width dropdown
├──────────────────┤
│      [Icon]       │
│      18°C         │  ← Temperature, centred
│   Partly Cloudy   │
│──────────────────│
│  💧 Humidity      │  ← Stacked vertically
│  76 %             │
│──────────────────│
│  💨 Wind Speed    │
│  18 km/h          │
└──────────────────┘
```

---

## 6. Reusable UI Elements

### 6.1 City Dropdown

- Native `<select>` element for maximum accessibility and zero JS overhead.
- Full width of its container, capped at 320 px on desktop.
- Border: `1px solid var(--color-border)`, border-radius: 8 px.
- Padding: `var(--space-3)` vertical, `var(--space-4)` horizontal.
- Focus style: `outline: 2px solid var(--color-accent)` (do not remove the outline — it is required for keyboard accessibility).

### 6.2 Main Weather Card

- Background: `var(--color-bg-card)`.
- Border: `1px solid var(--color-border)`.
- Border-radius: 16 px.
- Box-shadow: `var(--shadow-card)`.
- Padding: `var(--space-8)` on desktop, `var(--space-4)` on mobile.

### 6.3 Info Cards (Humidity & Wind)

- Two smaller cards inside the main card.
- Same border and radius as the main card but smaller.
- A small icon (emoji) + label (`--color-text-secondary`, `--font-size-sm`) above the value (`--color-text-primary`, `--font-size-lg`, bold).
- On desktop: side by side in a two-column grid.
- On mobile: stacked vertically.

### 6.4 Retry Button

- Background: `var(--color-accent)`.
- Text: white, `--font-weight-medium`.
- Border: none; border-radius: 8 px.
- Padding: `var(--space-3)` vertical, `var(--space-6)` horizontal.
- Hover: background changes to `var(--color-accent-hover)`.
- Focus: `outline: 2px solid var(--color-accent)`.
- Cursor: `pointer`.

---

## 7. UI States

### 7.1 Empty State (before a city is selected)

- The weather card is hidden.
- A centred prompt text is shown: _"Select a city above to see the current weather."_
- Text colour: `--color-text-muted`.

### 7.2 Loading State

- The weather card is hidden (or dimmed with `opacity: 0.4`).
- A centred spinner is shown.
- Spinner: a CSS `@keyframes` animated rotating circle (no image needed).
- The spinner colour uses `--color-accent`.
- The dropdown is disabled during loading to prevent duplicate requests.

```css
/* Example spinner — implementation to be confirmed */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 7.3 Data State (success)

- Spinner is hidden.
- Weather card is fully visible.
- All weather values are populated from the API response.

### 7.4 Error State

- Spinner is hidden.
- Weather card is hidden.
- Error panel is shown with:
  - A ⚠️ icon or similar warning symbol.
  - An error message in `--color-error-text` on `--color-error-bg`.
  - A thin border: `1px solid var(--color-error-border)`.
  - A "Try Again" button (styled as the Retry Button in Section 6.4).

---

## 8. Accessibility Requirements

| Requirement | Implementation |
|-------------|---------------|
| Keyboard navigation | All interactive elements (dropdown, retry button) must be reachable and operable with Tab and Enter/Space. |
| Focus styles | Never use `outline: none` without providing a custom visible focus style. |
| ARIA labels | The city `<select>` must have an associated `<label>` element. The loading spinner must have `aria-live="polite"` and an `aria-label` or visually hidden text. |
| Error announcements | The error message container must use `role="alert"` so screen readers announce it automatically. |
| Colour alone | Never use colour as the only way to convey information (e.g., the error state uses both a red colour and a text message + icon). |
| Image alt text | If SVG icons are used, each must have a `<title>` or `aria-label`. Emoji icons used decoratively should have `aria-hidden="true"`. |
| Contrast | All body text must meet WCAG AA (4.5:1 ratio). Verify with a tool before publishing. |

---

## 9. Things to Avoid

- No gradients on backgrounds (they add visual noise without value).
- No more than two font weights on a single screen.
- No full-width, full-bleed hero images.
- No animations other than the loading spinner and (optionally) a simple data fade-in.
- No dark mode in Version 1.0 (can be added later with a media query).
- No external icon libraries (use emoji or a single local SVG file if needed).
