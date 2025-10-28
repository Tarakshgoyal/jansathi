# Typography Quick Reference

## Text Component Sizes

| Size  | Pixels | Use Case                            | Line Height | Letter Spacing |
| ----- | ------ | ----------------------------------- | ----------- | -------------- |
| `2xs` | 10px   | Captions, Timestamps                | 1.25x       | normal         |
| `xs`  | 12px   | Secondary Info (minimum accessible) | 1.25x       | normal         |
| `sm`  | 14px   | Body Text, Labels                   | 1.5x        | normal         |
| `md`  | 16px   | Primary Body Text (default)         | 1.5x        | normal         |
| `lg`  | 18px   | Emphasis, Lead Text                 | 1.5x        | tight          |
| `xl`  | 20px   | Small Headings                      | 1.25x       | tight          |
| `2xl` | 24px   | Headings                            | 1.25x       | tight          |
| `3xl` | 30px   | Large Headings                      | 1.25x       | tighter        |
| `4xl` | 36px   | Display                             | 1.25x       | tighter        |
| `5xl` | 48px   | Display Large                       | 1.25x       | tighter        |
| `6xl` | 60px   | Hero Display                        | 1.25x       | tighter        |

## Heading Component Sizes

| Size  | Pixels | Use Case      | Weight     |
| ----- | ------ | ------------- | ---------- |
| `5xl` | 60px   | Display Large | Bold (700) |
| `4xl` | 48px   | Display       | Bold (700) |
| `3xl` | 36px   | Display Small | Bold (700) |
| `2xl` | 30px   | H1            | Bold (700) |
| `xl`  | 24px   | H2            | Bold (700) |
| `lg`  | 20px   | H3            | Bold (700) |
| `md`  | 18px   | H4            | Bold (700) |
| `sm`  | 16px   | H5            | Bold (700) |
| `xs`  | 14px   | H6            | Bold (700) |

## Font Weights

```tsx
className = "font-body"; // Regular (400) - Default body text
className = "font-medium"; // Medium (500) - Subtle emphasis
className = "font-semibold"; // SemiBold (600) - Subheadings
className = "font-bold"; // Bold (700) - Strong emphasis
className = "font-heading"; // Bold (700) - Headings
```

## Common Patterns

### Section Heading with Description

```tsx
<Heading size="lg" className="text-typography-900 mb-2">
  Section Title
</Heading>
<Text size="sm" className="text-typography-600">
  Section description text
</Text>
```

### Card with Title and Meta

```tsx
<Heading size="md" className="text-typography-900 font-semibold">
  Card Title
</Heading>
<Text size="xs" className="text-typography-500 mt-1">
  Meta information • 2 mins ago
</Text>
```

### Form Label with Helper Text

```tsx
<Text size="sm" className="text-typography-900 font-medium mb-1">
  Field Label
</Text>
<Text size="xs" className="text-typography-500">
  Helper text or instructions
</Text>
```

### Button Text

```tsx
<Text size="md" className="text-typography-white font-semibold">
  Button Label
</Text>
```

### List Item

```tsx
<Text size="md" className="text-typography-900 font-medium">
  Primary Text
</Text>
<Text size="sm" className="text-typography-600 mt-1">
  Secondary text or description
</Text>
```

### Status/Badge Text

```tsx
<Text
  size="xs"
  className="text-success-700 font-semibold uppercase tracking-widest"
>
  COMPLETED
</Text>
```

## Accessibility Reminders

✅ Minimum body text: **14px (sm)** for comfortable reading  
✅ Line height: **1.5x** for body text, **1.25x** for headings  
✅ Color contrast: **4.5:1** minimum for normal text  
✅ Touch targets: **44x44px** minimum for interactive elements  
✅ ALL CAPS: Always use **wider letter spacing** (`tracking-widest`)

## Color Combinations (WCAG AA Compliant)

```tsx
// High contrast (AAA) - 20.6:1
text-typography-900 on bg-background-0

// Good contrast (AA) - 5.9:1
text-typography-500 on bg-background-0

// White on brand
text-typography-white on bg-brand-500

// Status colors
text-status-finished on bg-status-finished-bg
text-status-started on bg-status-started-bg
text-status-reported on bg-status-reported-bg
```
