# Typography Guide - Jansarthi App

## Font Family: Noto Sans

The application uses **Noto Sans** as the primary typeface, which provides:

- Excellent readability on mobile devices
- Support for multiple languages including Hindi (Devanagari script)
- Professional and accessible design
- High contrast and legibility

### Font Weights Available

- **Regular (400)**: `NotoSans_400Regular` - Body text
- **Medium (500)**: `NotoSans_500Medium` - Emphasis
- **SemiBold (600)**: `NotoSans_600SemiBold` - Subheadings
- **Bold (700)**: `NotoSans_700Bold` - Headings

## Typography Hierarchy

### Display Text (Large Screens)

```tsx
<Heading size="5xl">Display Large</Heading>  // 60px, Bold, Line Height: 1.25x
<Heading size="4xl">Display</Heading>        // 48px, Bold, Line Height: 1.25x
<Heading size="3xl">Display Small</Heading>  // 36px, Bold, Line Height: 1.25x
```

### Headings

```tsx
<Heading size="2xl">Heading 1</Heading>  // 30px, Bold, Line Height: 1.25x
<Heading size="xl">Heading 2</Heading>   // 24px, Bold, Line Height: 1.25x
<Heading size="lg">Heading 3</Heading>   // 20px, Bold, Line Height: 1.5x
<Heading size="md">Heading 4</Heading>   // 18px, Bold, Line Height: 1.5x
<Heading size="sm">Heading 5</Heading>   // 16px, Bold, Line Height: 1.5x
<Heading size="xs">Heading 6</Heading>   // 14px, Bold, Line Height: 1.5x
```

### Body Text

```tsx
<Text size="md">Body Large</Text>   // 16px, Regular, Line Height: 1.5x (Default)
<Text size="sm">Body</Text>         // 14px, Regular, Line Height: 1.5x
<Text size="xs">Body Small</Text>   // 12px, Regular, Line Height: 1.25x (Minimum accessible)
<Text size="2xs">Caption</Text>     // 10px, Regular, Line Height: 1.25x (Use sparingly)
```

## Accessibility Guidelines (WCAG 2.1 AA Compliant)

### Font Size Requirements

- **Minimum Body Text**: 12px (xs) - Only for secondary information
- **Recommended Body Text**: 14-16px (sm-md) - Primary content
- **Large Text**: 18px+ (md-lg) - Enhanced readability

### Line Height Standards

- **Body Text**: 1.5x font size (optimal readability)
- **Headings**: 1.25x font size (tighter for hierarchy)
- **Captions**: 1.25x font size (compact)

### Letter Spacing

- **Display/Large Headings**: `-0.02em` (tighter tracking)
- **Regular Headings**: `-0.01em` (slight tightening)
- **Body Text**: `0` (normal)
- **ALL CAPS**: `0.05em` (wider for readability)

### Color Contrast

All text colors meet WCAG AA standards:

- **Primary Text** (`typography-900`): 20.6:1 contrast ratio (AAA)
- **Secondary Text** (`typography-500`): 5.9:1 contrast ratio (AA)
- **Disabled Text** (`typography-400`): For non-essential information only

## Usage Examples

### Header Component

```tsx
<Heading size="2xl" className="text-typography-white font-bold">
  Jansarthi
</Heading>
<Text size="sm" className="text-typography-white/90">
  Report and track issues in your area
</Text>
```

### Card Titles

```tsx
<Heading size="lg" className="text-typography-900 font-semibold">
  Create New Report
</Heading>
<Text size="sm" className="text-typography-600">
  Report an issue in your area
</Text>
```

### Body Content

```tsx
<Text size="md" className="text-typography-700 leading-normal">
  This is the main body text with optimal 16px size and 1.5x line height.
</Text>
```

### Emphasis Techniques

```tsx
{
  /* Bold for emphasis */
}
<Text size="md" className="font-bold text-typography-900">
  Important Information
</Text>;

{
  /* Medium weight for subtle emphasis */
}
<Text size="sm" className="font-medium text-typography-700">
  Emphasized text
</Text>;

{
  /* Italic for quotes or special terms */
}
<Text size="md" className="italic text-typography-600">
  "Quoted text or special terms"
</Text>;
```

### ALL CAPS Usage

```tsx
{
  /* Wide letter spacing for ALL CAPS */
}
<Text size="xs" className="uppercase tracking-widest text-typography-500">
  SECTION LABEL
</Text>;
```

## Best Practices

### ✅ DO:

- Use 14-16px (sm-md) for primary body text
- Maintain 1.5x line height for body content
- Use bold sparingly for emphasis
- Ensure sufficient color contrast (min 4.5:1 for normal text)
- Keep clear hierarchy with size and weight differences
- Use Noto Sans for all text (supports Hindi + English)

### ❌ DON'T:

- Don't use text smaller than 12px for essential information
- Don't use too many font weights in one screen
- Don't use tight line heights for long paragraphs
- Don't use tight letter spacing for ALL CAPS text
- Don't mix multiple font families
- Don't rely on color alone to convey information

## Tailwind Classes Reference

### Font Families

- `font-body` - Regular (400)
- `font-medium` - Medium (500)
- `font-semibold` - SemiBold (600)
- `font-bold` - Bold (700)
- `font-heading` - Bold (700) for headings

### Line Heights

- `leading-tight` - 1.25x (headings)
- `leading-normal` - 1.5x (body text)
- `leading-relaxed` - 1.75x (long-form content)

### Letter Spacing

- `tracking-tighter` - -0.02em (large displays)
- `tracking-tight` - -0.01em (headings)
- `tracking-normal` - 0 (body text)
- `tracking-wide` - 0.01em
- `tracking-wider` - 0.02em
- `tracking-widest` - 0.05em (ALL CAPS)

## Mobile Optimization

### Touch Target Sizes

- Minimum: 44x44 pixels for interactive elements
- Recommended: 48x48 pixels for primary actions

### Responsive Considerations

- Font sizes are optimized for mobile-first approach
- Text remains legible at default zoom levels
- Adequate padding around text for comfortable reading
- Support for system font size adjustments

## Hindi Language Support

Noto Sans includes full Devanagari script support:

- All Hindi characters render correctly
- Proper diacritic positioning
- Consistent weight across Latin and Devanagari
- Professional appearance in both languages

### Example

```tsx
<Heading size="xl" className="text-typography-900">
  जनसारथी {/* Hindi renders beautifully */}
</Heading>
```

## Testing Checklist

- [ ] Text is readable at arm's length on mobile devices
- [ ] Color contrast meets WCAG AA standards (4.5:1 minimum)
- [ ] Headings create clear visual hierarchy
- [ ] Line heights prevent text from feeling cramped
- [ ] Letter spacing is appropriate for text style
- [ ] Hindi text renders correctly with proper spacing
- [ ] Text scales properly with system font size settings
- [ ] Interactive text elements have adequate touch targets
