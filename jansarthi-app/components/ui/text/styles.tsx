import { isWeb, tva } from "@gluestack-ui/utils/nativewind-utils";

const baseStyle = isWeb
  ? "font-sans tracking-normal my-0 bg-transparent border-0 box-border display-inline list-none margin-0 padding-0 position-relative text-start no-underline whitespace-pre-wrap word-wrap-break-word"
  : "";

export const textStyle = tva({
  base: `text-typography-700 font-body leading-normal ${baseStyle}`,

  variants: {
    isTruncated: {
      true: "web:truncate",
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
    size: {
      "2xs": "text-2xs leading-tight tracking-normal", // 10px
      xs: "text-xs leading-tight tracking-normal", // 12px - minimum accessible size
      sm: "text-sm leading-normal tracking-normal", // 14px - body text
      md: "text-base leading-normal tracking-normal", // 16px - body text
      lg: "text-lg leading-normal tracking-tight", // 18px - emphasis
      xl: "text-xl leading-tight tracking-tight", // 20px - headings
      "2xl": "text-2xl leading-tight tracking-tight", // 24px - headings
      "3xl": "text-3xl leading-tight tracking-tighter", // 30px - large headings
      "4xl": "text-4xl leading-tight tracking-tighter", // 36px - display
      "5xl": "text-5xl leading-tight tracking-tighter", // 48px - display
      "6xl": "text-6xl leading-tight tracking-tighter", // 60px - display
    },
    sub: {
      true: "text-xs leading-tight",
    },
    italic: {
      true: "italic",
    },
    highlight: {
      true: "bg-yellow-500",
    },
  },
});
