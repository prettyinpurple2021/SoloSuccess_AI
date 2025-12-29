# Typography & Fonts

**Version:** 3.0  
**Last Updated:** December 21, 2025

---

## Font Stack

### Orbitron (Headings Only)

```
Import: @import 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap'
Usage: All heading elements (h1-h6)
Weight: 400 (rare), 700 (standard), 900 (bold)
Character: Geometric, futuristic, technical
```

### JetBrains Mono (Body & UI)

```
Import: @import 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap'
Usage: Body text, UI elements, buttons, labels, code
Weight: 400 (body), 500 (emphasis), 600 (labels), 700 (buttons)
Character: Clean, readable, technical, monospaced
```

---

## Heading Sizes & Styles

```
H1  font-orbitron text-4xl font-900 uppercase tracking-wide leading-tight
    Letter Spacing: 0.06em
    Usage: Page titles, major sections

H2  font-orbitron text-3xl font-900 uppercase tracking-wide leading-tight
    Letter Spacing: 0.05em
    Usage: Section headers, agent names

H3  font-orbitron text-2xl font-700 uppercase tracking-wide leading-tight
    Letter Spacing: 0.04em
    Usage: Subsections, feature titles

H4  font-orbitron text-xl font-700 uppercase tracking-wider
    Letter Spacing: 0.03em
    Usage: Card titles, module headers

H5  font-orbitron text-lg font-700 uppercase tracking-wider
    Letter Spacing: 0.02em
    Usage: Smaller headers, labels

H6  font-orbitron text-base font-700 uppercase tracking-wider
    Letter Spacing: 0.02em
    Usage: Field labels, component labels
```

---

## Body Text Sizes

```
Large   font-mono text-lg
        Usage: Lead paragraphs, callouts

Base    font-mono text-base
        Usage: Standard body text, descriptions

Small   font-mono text-sm
        Usage: Secondary text, hints, captions

XSmall  font-mono text-xs
        Usage: Timestamps, metadata, fine print
```

---

## Font Rules (CRITICAL)

⚠️ **NEVER** use Orbitron for body text  
⚠️ **NEVER** use other fonts for headings  
⚠️ **ALWAYS** use uppercase for headings  
⚠️ **ALWAYS** use tracking-wide or tracking-wider for headings

---

## Next.js Setup

```typescript
import { Orbitron, JetBrains_Mono } from 'next/font/google'

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
```

---

## Tailwind Config

```typescript
fontFamily: {
  orbitron: 'var(--font-orbitron)',
  mono: 'var(--font-mono)',
},
```

---

**Back to [Design System Overview](README.md)**
