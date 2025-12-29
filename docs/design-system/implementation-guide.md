# Implementation Guide

**Version:** 3.0  
**Last Updated:** December 21, 2025

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install next-themes
npm install @tailwindcss/forms  # optional, for form components
```

### 2. Update `app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Orbitron, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme/provider'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '700', '900'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'SoloSuccess - Architect Your Digital Future',
  description: 'Intelligent AI agents for exponential growth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${orbitron.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 3. Create `lib/theme/provider.tsx`

```typescript
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="solosuccess-theme"
    >
      {children}
    </NextThemesProvider>
  )
}
```

### 4. Update `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#0be4ec',
        'neon-magenta': '#ff006e',
        'neon-lime': '#39ff14',
        'neon-purple': '#b300ff',
        'neon-orange': '#ff6600',
        'dark-bg': '#0a0e27',
        'dark-card': '#0f1535',
        'dark-hover': '#151d3a',
        'light-bg': '#f8f9fa',
        'light-card': '#ffffff',
        'light-hover': '#f0f1f3',
      },
      fontFamily: {
        orbitron: 'var(--font-orbitron)',
        mono: 'var(--font-mono)',
      },
      boxShadow: {
        'glow-cyan-dark': '0 0 20px rgba(11, 228, 236, 0.5), 0 0 40px rgba(11, 228, 236, 0.2)',
        'glow-cyan-light': '0 0 15px rgba(11, 228, 236, 0.3), 0 0 25px rgba(11, 228, 236, 0.1)',
        // ... add all other glow shadows here
      },
    },
  },
  plugins: [],
}

export default config
```

### 5. Create `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  @apply bg-dark-bg text-white;
}

.dark {
  color-scheme: dark;
}

.dark body {
  @apply bg-dark-bg text-white;
}

.light {
  color-scheme: light;
}

.light body {
  @apply bg-light-bg text-gray-900;
}

/* Glitch Effect for Headings */
.glitch-hover {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease-out;
}

.glitch-hover:hover {
  color: #0be4ec;
  font-weight: 900;
}

/* Add all keyframes and animations here */
```

---

## Safe Theme Hook Pattern (CRITICAL)

```typescript
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export const MyComponent = () => {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = mounted && theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={isDark ? 'dark-styles' : 'light-styles'}>
      {children}
    </div>
  )
}
```

---

## Component Directory Structure

```
src/components/
├── ui/
│   ├── Heading.tsx
│   ├── Button.tsx
│   ├── Alert.tsx
│   ├── Text.tsx
│   ├── Badge.tsx
│   ├── Loading.tsx
│   ├── Modal.tsx
│   ├── ProgressBar.tsx
│   ├── CodeBlock.tsx
│   ├── Breadcrumb.tsx
│   └── index.ts (exports)
├── navigation/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── ThemeToggle.tsx
│   └── index.ts
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── analytics/
│   └── agents/
└── layouts/
    ├── DashboardLayout.tsx
    └── AuthLayout.tsx
```

---

## Key Points

✅ **Use safe mounted check** - Prevents Next.js build errors  
✅ **All components use design system colors** - No hardcoded hex codes  
✅ **Test in both themes** - Always verify dark AND light  
✅ **Follow spacing scale** - 8px base unit  
✅ **Use theme-aware animations** - 200ms dark, 300ms light

---

**Back to [Main README](../../README.md)**
