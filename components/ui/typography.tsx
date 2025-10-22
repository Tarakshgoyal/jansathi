import React from 'react';
import { Text, TextProps } from 'react-native';
import { cn } from '@/lib/utils';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'muted' | 'small';
  className?: string;
}

export function Typography({ variant = 'p', className, children, ...props }: TypographyProps) {
  const baseClasses = {
    h1: 'text-4xl font-extrabold tracking-tight',
    h2: 'text-3xl font-semibold tracking-tight',
    h3: 'text-2xl font-semibold tracking-tight',
    h4: 'text-xl font-semibold tracking-tight',
    p: 'leading-7',
    muted: 'text-sm text-muted-foreground',
    small: 'text-sm font-medium leading-none'
  };

  return (
    <Text 
      className={cn(baseClasses[variant], className)}
      {...props}
    >
      {children}
    </Text>
  );
}