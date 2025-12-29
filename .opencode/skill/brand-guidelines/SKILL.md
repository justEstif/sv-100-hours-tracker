---
name: brand-guidelines
description: Apply the 100 Hours Tracker brand styling to UI components, pages, and design elements. Use when creating or modifying any visual elements in the application.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: ui-development
---

# Brand Guidelines for 100 Hours Tracker

This skill ensures consistent visual styling across all UI components and pages in the 100 Hours Tracker application.

## When to Use This Skill

Use this skill when:

- Creating new Svelte components or pages
- Modifying existing UI elements
- Adding new visual features or layouts
- Reviewing code for brand consistency
- Building forms, buttons, cards, or any interactive elements

## Technology Stack

- **Framework**: SvelteKit with Svelte 5
- **Styling**: Tailwind CSS 4
- **Plugins**: @tailwindcss/forms, @tailwindcss/typography

---

## Color Palette

### Primary Colors

| Name          | Tailwind Class | Hex     | Usage                                |
| ------------- | -------------- | ------- | ------------------------------------ |
| Dark          | `slate-900`    | #0f172a | Primary text, dark backgrounds       |
| Light         | `slate-50`     | #f8fafc | Light backgrounds, text on dark      |
| Primary       | `indigo-600`   | #4f46e5 | Primary actions, links, focus states |
| Primary Hover | `indigo-700`   | #4338ca | Hover states for primary elements    |

### Accent Colors

| Name    | Tailwind Class | Hex     | Usage                                 |
| ------- | -------------- | ------- | ------------------------------------- |
| Success | `emerald-500`  | #10b981 | Completed hours, positive feedback    |
| Warning | `amber-500`    | #f59e0b | Approaching deadlines, caution states |
| Error   | `rose-500`     | #f43f5e | Errors, delete actions, overdue items |
| Info    | `sky-500`      | #0ea5e9 | Informational messages, tips          |

### Neutral Colors

| Name       | Tailwind Class | Usage                            |
| ---------- | -------------- | -------------------------------- |
| Background | `slate-50`     | Page backgrounds                 |
| Surface    | `white`        | Cards, modals, elevated surfaces |
| Border     | `slate-200`    | Borders, dividers                |
| Muted Text | `slate-500`    | Secondary text, placeholders     |

---

## Typography

### Font Stack

Use the default Tailwind sans-serif stack. No custom fonts required:

```
font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

### Text Sizes

| Element         | Tailwind Classes                       |
| --------------- | -------------------------------------- |
| Page Title      | `text-3xl font-bold text-slate-900`    |
| Section Heading | `text-xl font-semibold text-slate-800` |
| Card Title      | `text-lg font-medium text-slate-900`   |
| Body Text       | `text-base text-slate-700`             |
| Small/Caption   | `text-sm text-slate-500`               |
| Label           | `text-sm font-medium text-slate-700`   |

---

## Component Patterns

### Buttons

```svelte
<!-- Primary Button -->
<button class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="px-4 py-2 bg-white text-slate-700 font-medium rounded-lg border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
  Secondary Action
</button>

<!-- Danger Button -->
<button class="px-4 py-2 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors">
  Delete
</button>
```

### Cards

```svelte
<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  <h3 class="text-lg font-medium text-slate-900">Card Title</h3>
  <p class="mt-2 text-slate-600">Card content goes here.</p>
</div>
```

### Form Inputs

```svelte
<!-- Text Input -->
<div>
  <label for="input" class="block text-sm font-medium text-slate-700">Label</label>
  <input
    type="text"
    id="input"
    class="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
  />
</div>

<!-- With Error State -->
<div>
  <label for="error-input" class="block text-sm font-medium text-slate-700">Label</label>
  <input
    type="text"
    id="error-input"
    class="mt-1 block w-full rounded-lg border-rose-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
  />
  <p class="mt-1 text-sm text-rose-600">Error message here</p>
</div>
```

### Progress Indicators

For tracking hours progress:

```svelte
<!-- Progress Bar -->
<div class="w-full bg-slate-200 rounded-full h-2">
  <div
    class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
    style="width: 75%"
  ></div>
</div>

<!-- With Label -->
<div>
  <div class="flex justify-between text-sm mb-1">
    <span class="font-medium text-slate-700">Hours Completed</span>
    <span class="text-slate-500">75/100</span>
  </div>
  <div class="w-full bg-slate-200 rounded-full h-2">
    <div class="bg-emerald-500 h-2 rounded-full" style="width: 75%"></div>
  </div>
</div>
```

### Navigation

```svelte
<nav class="bg-white border-b border-slate-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <div class="flex-shrink-0">
        <span class="text-xl font-bold text-indigo-600">100 Hours</span>
      </div>
      <div class="flex space-x-4">
        <a href="/" class="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
          Dashboard
        </a>
        <a href="/log" class="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">
          Log Hours
        </a>
      </div>
    </div>
  </div>
</nav>
```

---

## Layout Guidelines

### Page Structure

```svelte
<div class="min-h-screen bg-slate-50">
  <!-- Navigation -->
  <nav>...</nav>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-slate-900">Page Title</h1>

    <div class="mt-8">
      <!-- Page content -->
    </div>
  </main>
</div>
```

### Spacing System

Use Tailwind's default spacing scale consistently:

- `space-y-4` or `gap-4` for form fields
- `space-y-6` or `gap-6` for sections
- `p-6` for card padding
- `py-8` for main content vertical padding

### Responsive Breakpoints

Follow mobile-first approach:

- Default: Mobile
- `sm:` (640px): Small tablets
- `md:` (768px): Tablets
- `lg:` (1024px): Desktops
- `xl:` (1280px): Large desktops

---

## State Indicators

### Loading States

```svelte
<div class="animate-pulse flex space-x-4">
  <div class="rounded-full bg-slate-200 h-10 w-10"></div>
  <div class="flex-1 space-y-4 py-1">
    <div class="h-4 bg-slate-200 rounded w-3/4"></div>
    <div class="h-4 bg-slate-200 rounded w-1/2"></div>
  </div>
</div>
```

### Empty States

```svelte
<div class="text-center py-12">
  <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <!-- Icon -->
  </svg>
  <h3 class="mt-2 text-sm font-medium text-slate-900">No hours logged</h3>
  <p class="mt-1 text-sm text-slate-500">Get started by logging your first hour.</p>
  <div class="mt-6">
    <button class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
      Log Hours
    </button>
  </div>
</div>
```

---

## Accessibility Guidelines

1. **Color Contrast**: Ensure text meets WCAG AA standards (4.5:1 for normal text)
2. **Focus States**: Always include visible focus rings using `focus:ring-2`
3. **Labels**: All form inputs must have associated labels
4. **Interactive Elements**: Minimum touch target of 44x44 pixels on mobile
5. **Semantic HTML**: Use proper heading hierarchy and ARIA attributes when needed

---

## Do's and Don'ts

### Do

- Use the established color palette consistently
- Maintain consistent spacing using Tailwind's scale
- Include hover and focus states on interactive elements
- Follow the mobile-first responsive approach
- Use semantic HTML elements

### Don't

- Use colors outside the defined palette
- Use inline styles (use Tailwind classes instead)
- Skip focus states on interactive elements
- Use fixed pixel values for spacing (use Tailwind scale)
- Nest too many wrapper divs unnecessarily
