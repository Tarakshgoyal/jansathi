# Jansarthi Color Palette Guide

## Quick Reference

This guide provides quick access to all color tokens in the Jansarthi app theme.

---

## Brand Colors (Uttarakhand Green)

Primary brand color representing Uttarakhand's environmental heritage and government authority.

| Color         | Hex         | RGB           | Usage                           | Tailwind Class                    |
| ------------- | ----------- | ------------- | ------------------------------- | --------------------------------- |
| Brand 950     | N/A         | `202 255 232` | Lightest tint                   | `bg-brand-950` / `text-brand-950` |
| Brand 900     | N/A         | `162 241 192` | Very light tint                 | `bg-brand-900` / `text-brand-900` |
| Brand 800     | N/A         | `132 211 162` | Light tint                      | `bg-brand-800` / `text-brand-800` |
| Brand 700     | N/A         | `72 151 102`  | Light                           | `bg-brand-700` / `text-brand-700` |
| Brand 600     | #034A28     | `3 74 40`     | **Uttarakhand Green Dark**      | `bg-brand-600` / `text-brand-600` |
| **Brand 500** | **#046A38** | `4 106 56`    | **Uttarakhand Green (Primary)** | `bg-brand-500` / `text-brand-500` |
| **Brand 400** | **#198754** | `25 135 84`   | **Uttarakhand Green Light**     | `bg-brand-400` / `text-brand-400` |
| Brand 300     | N/A         | `72 151 102`  | Dark tint                       | `bg-brand-300` / `text-brand-300` |
| Brand 200     | N/A         | `132 211 162` | Darker tint                     | `bg-brand-200` / `text-brand-200` |
| Brand 100     | N/A         | `162 241 192` | Very dark                       | `bg-brand-100` / `text-brand-100` |
| Brand 50      | N/A         | `202 255 232` | Lightest backgrounds            | `bg-brand-50` / `text-brand-50`   |

**Use for:**

- Primary action buttons
- App header and navigation
- FAB buttons
- Active states
- Progress indicators
- Primary emphasis

---

## Text Colors

### Primary Text (Deep Earthy Brown)

AAA contrast ratio (20.6:1) - Highest readability

| Level              | Hex         | RGB      | Usage                              | Tailwind Class        |
| ------------------ | ----------- | -------- | ---------------------------------- | --------------------- |
| **Typography 900** | **#150202** | `21 2 2` | **Primary headings and body text** | `text-typography-900` |
| Typography 950     | #150202     | `21 2 2` | Darkest text                       | `text-typography-950` |

### Secondary Text (Grey 03)

AA contrast ratio (5.9:1) - Good readability

| Level             | Hex         | RGB        | Usage                            | Tailwind Class       |
| ----------------- | ----------- | ---------- | -------------------------------- | -------------------- |
| **Secondary 500** | **#606060** | `96 96 96` | **Secondary text, descriptions** | `text-secondary-500` |

### Disabled Text (Grey 02)

| Level            | Hex         | RGB           | Usage                          | Tailwind Class      |
| ---------------- | ----------- | ------------- | ------------------------------ | ------------------- |
| **Tertiary 500** | **#8E8E8E** | `142 142 142` | **Disabled/inactive elements** | `text-tertiary-500` |

### Text on Dark/Colored Backgrounds

| Level            | Hex     | RGB           | Usage                    | Tailwind Class          |
| ---------------- | ------- | ------------- | ------------------------ | ----------------------- |
| Typography White | #FFFFFF | `255 255 255` | Text on dark backgrounds | `text-typography-white` |

---

## Background Colors

| Color              | Hex         | RGB           | Usage                               | Tailwind Class      |
| ------------------ | ----------- | ------------- | ----------------------------------- | ------------------- |
| **Background 0**   | **#FFFFFF** | `255 255 255` | **Primary app background (White)**  | `bg-background-0`   |
| **Background 50**  | **#F8F9FA** | `248 249 250` | **Input fields, elevated surfaces** | `bg-background-50`  |
| **Background 100** | **#EBEAEA** | `235 234 234` | **Section dividers (Linen)**        | `bg-background-100` |

---

## Semantic Colors

### Success (Liberty Green)

Use for: Successfully submitted reports, completion states

| Level                  | Hex         | RGB           | Usage                          | Tailwind Class                        |
| ---------------------- | ----------- | ------------- | ------------------------------ | ------------------------------------- |
| Success 0              | N/A         | `228 255 244` | Light background               | `bg-success-0`                        |
| **Success 500**        | **#198754** | `25 135 84`   | **Success state color**        | `bg-success-500` / `text-success-500` |
| Success 950            | N/A         | `27 50 36`    | Darkest                        | `bg-success-950`                      |
| **Background Success** | **#E8F5E9** | `232 245 233` | **Success message background** | `bg-background-success`               |

### Error (Coral Red)

Use for: Failed actions, critical alerts, validation errors

| Level                | Hex         | RGB           | Usage                        | Tailwind Class                    |
| -------------------- | ----------- | ------------- | ---------------------------- | --------------------------------- |
| Error 0              | #FEE2E2     | `254 226 226` | Light background             | `bg-error-0`                      |
| **Error 500**        | **#DC3545** | `220 53 69`   | **Error state color**        | `bg-error-500` / `text-error-500` |
| Error 950            | N/A         | `83 19 19`    | Darkest                      | `bg-error-950`                    |
| **Background Error** | **#FEE2E2** | `254 226 226` | **Error message background** | `bg-background-error`             |

### Warning (Mustard Yellow)

Use for: Pending reviews, caution messages, important notices

| Level                  | Hex         | RGB           | Usage                          | Tailwind Class                        |
| ---------------------- | ----------- | ------------- | ------------------------------ | ------------------------------------- |
| Warning 0              | N/A         | `255 252 245` | Light background               | `bg-warning-0`                        |
| **Warning 500**        | **#FFC107** | `255 193 7`   | **Warning state color**        | `bg-warning-500` / `text-warning-500` |
| Warning 950            | N/A         | `128 96 4`    | Darkest                        | `bg-warning-950`                      |
| **Background Warning** | **#FFF8E1** | `255 248 225` | **Warning message background** | `bg-background-warning`               |

### Info (Blue)

Use for: Information messages, help text, hyperlinks

| Level               | Hex         | RGB           | Usage                       | Tailwind Class                  |
| ------------------- | ----------- | ------------- | --------------------------- | ------------------------------- |
| Info 0              | #E3F2FD     | `227 242 253` | Light background            | `bg-info-0`                     |
| **Info 500**        | **#0D6EFD** | `13 110 253`  | **Info state color**        | `bg-info-500` / `text-info-500` |
| Info 950            | N/A         | `3 38 56`     | Darkest                     | `bg-info-950`                   |
| **Background Info** | **#E3F2FD** | `227 242 253` | **Info message background** | `bg-background-info`            |

---

## Issue Type Colors

Distinct colors for each problem category. Use consistently across the app.

| Issue Type           | Color Name | Hex         | RGB          | Meaning                            | Tailwind Class                              |
| -------------------- | ---------- | ----------- | ------------ | ---------------------------------- | ------------------------------------------- |
| **Jal Samasya**      | Cyan       | **#0DCAF0** | `13 202 240` | Water - Cool, flowing, clear       | `bg-issue-jal` / `text-issue-jal`           |
| **Bijli Samasya**    | Yellow     | **#FFC107** | `255 193 7`  | Electricity - Bright, energy       | `bg-issue-bijli` / `text-issue-bijli`       |
| **Sadak Samasya**    | Grey       | **#606060** | `96 96 96`   | Roads - Solid, infrastructure      | `bg-issue-sadak` / `text-issue-sadak`       |
| **Kachra Samasya**   | Green      | **#198754** | `25 135 84`  | Garbage - Cleanliness, environment | `bg-issue-kachra` / `text-issue-kachra`     |
| **Severage Samasya** | Brown      | **#8B4513** | `139 69 19`  | Sewerage - Earthy, underground     | `bg-issue-severage` / `text-issue-severage` |

**Apply to:**

- Issue selection cards
- Report detail badges
- Map markers
- Analytics charts
- Filter badges

---

## Report Status Workflow Colors

Visual progression of report lifecycle. Each status has text and background colors.

### Reported (Initial)

Color: Red - Indicates new, unaddressed issue

| Element        | Hex         | RGB           | Tailwind Class          |
| -------------- | ----------- | ------------- | ----------------------- |
| **Text Color** | **#DC3545** | `220 53 69`   | `text-status-reported`  |
| **Background** | **#FEE2E2** | `254 226 226` | `bg-status-reported-bg` |

### Pradhan (Forwarded)

Color: Yellow - Pending action from authority

| Element        | Hex         | RGB           | Tailwind Class         |
| -------------- | ----------- | ------------- | ---------------------- |
| **Text Color** | **#FFC107** | `255 193 7`   | `text-status-pradhan`  |
| **Background** | **#FFF8E1** | `255 248 225` | `bg-status-pradhan-bg` |

### PWD/Clerk Started

Color: Green - Work in progress

| Element        | Hex         | RGB           | Tailwind Class         |
| -------------- | ----------- | ------------- | ---------------------- |
| **Text Color** | **#198754** | `25 135 84`   | `text-status-started`  |
| **Background** | **#E8F5E9** | `232 245 233` | `bg-status-started-bg` |

### Finished/Sent

Color: Blue - Completed and closed

| Element        | Hex         | RGB           | Tailwind Class          |
| -------------- | ----------- | ------------- | ----------------------- |
| **Text Color** | **#0D6EFD** | `13 110 253`  | `text-status-finished`  |
| **Background** | **#E3F2FD** | `227 242 253` | `bg-status-finished-bg` |

---

## Outline/Border Colors

| Level           | Usage                    | Tailwind Class       |
| --------------- | ------------------------ | -------------------- |
| Outline 50      | Very light borders       | `border-outline-50`  |
| **Outline 100** | **Default card borders** | `border-outline-100` |
| **Outline 200** | **Stronger borders**     | `border-outline-200` |
| Outline 300     | Emphasized borders       | `border-outline-300` |

---

## Focus Indicators

For keyboard navigation and accessibility

| Element         | Color     | Hex         | RGB          | Tailwind Class           |
| --------------- | --------- | ----------- | ------------ | ------------------------ |
| Primary Focus   | Brown     | #150202     | `21 2 2`     | `ring-indicator-primary` |
| Info Focus      | Blue      | #0D6EFD     | `13 110 253` | `ring-indicator-info`    |
| Error Focus     | Red       | #DC3545     | `220 53 69`  | `ring-indicator-error`   |
| **Brand Focus** | **Green** | **#046A38** | `4 106 56`   | `ring-indicator-brand`   |

---

## Color Usage Patterns

### Primary Actions

```tsx
// Submit button
<Button className="bg-brand-500 active:bg-brand-600">
  <ButtonText className="text-typography-white">Submit Report</ButtonText>
</Button>
```

### Secondary Actions

```tsx
// View button
<Button variant="outline" className="border-info-500">
  <ButtonText className="text-info-500">View Details</ButtonText>
</Button>
```

### Issue Type Badge

```tsx
// Water issue badge
<View className="bg-issue-jal px-3 py-1 rounded-full">
  <Text className="text-typography-white text-xs">Jal Samasya</Text>
</View>
```

### Status Indicator

```tsx
// Report status
<View className="bg-status-started-bg px-4 py-2 rounded-lg">
  <Text className="text-status-started font-semibold">Work Started</Text>
</View>
```

### Text Hierarchy

```tsx
// Heading
<Heading className="text-typography-900 text-2xl font-bold">
  Report Details
</Heading>

// Body text
<Text className="text-typography-900 text-base">
  Description of the issue...
</Text>

// Secondary text
<Text className="text-secondary-500 text-sm">
  Submitted on: 28 Oct 2024
</Text>

// Disabled text
<Text className="text-tertiary-500 text-sm">
  This field is disabled
</Text>
```

---

## Accessibility Notes

✅ **AAA Contrast**: Primary text (#150202) on white background = 20.6:1
✅ **AA+ Contrast**: Secondary text (#606060) on white background = 5.9:1
✅ **Touch Targets**: Minimum 44×44px for all interactive elements
✅ **Color Independence**: Always pair colors with icons and labels
✅ **Focus Indicators**: 3:1 minimum contrast ratio
✅ **Colorblind Safe**: Tested with various color vision deficiencies

---

## Design Tokens Location

All color tokens are defined in:

- `/components/ui/gluestack-ui-provider/config.ts` - CSS variables
- `/tailwind.config.js` - Tailwind theme extension

Never hardcode hex values directly in components. Always use theme classes.

---

## Related Documentation

- [THEME_CHANGES.md](../THEME_CHANGES.md) - Implementation details and migration guide
- [Customizing Theme Guide](./gluestack-ui-v3/customizing-themes.md) - How to modify theme
- [Translations](../config/translations.ts) - Multilingual text configuration
