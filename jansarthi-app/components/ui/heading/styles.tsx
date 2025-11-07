import { isWeb, tva } from "@gluestack-ui/utils/nativewind-utils";
const baseStyle = isWeb
  ? "font-sans tracking-tight bg-transparent border-0 box-border display-inline list-none margin-0 padding-0 position-relative text-start no-underline whitespace-pre-wrap word-wrap-break-word"
  : "";

export const headingStyle = tva({
  base: `text-typography-900 font-bold font-heading tracking-tight leading-tight my-0 ${baseStyle}`,
  variants: {
    isTruncated: {
      true: "truncate",
    },
    bold: {
      true: "font-bold",
    },
    underline: {
      true: "underline",
    },
    strikeThrough: {
      true: "line-through",
    },
    sub: {
      true: "text-xs",
    },
    italic: {
      true: "italic",
    },
    highlight: {
      true: "bg-yellow-500",
    },
    size: {
      "5xl": "text-6xl leading-tight tracking-tighter", // 60px - Display Large
      "4xl": "text-5xl leading-tight tracking-tighter", // 48px - Display
      "3xl": "text-4xl leading-tight tracking-tighter", // 36px - Display Small
      "2xl": "text-3xl leading-tight tracking-tight", // 30px - Heading 1
      xl: "text-2xl leading-tight tracking-tight", // 24px - Heading 2
      lg: "text-xl leading-normal tracking-tight", // 20px - Heading 3
      md: "text-lg leading-normal tracking-normal", // 18px - Heading 4
      sm: "text-base leading-normal tracking-normal", // 16px - Heading 5
      xs: "text-sm leading-normal tracking-normal", // 14px - Heading 6
    },
  },
});
