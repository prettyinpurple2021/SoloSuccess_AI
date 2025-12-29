# Component Library

**Version:** 3.0  
**Last Updated:** December 21, 2025

---

## Overview

11 semantic components covering all UI needs:

1. **Heading** - All heading elements (h1-h6)
2. **Button** - Interactive actions
3. **Alert** - Notifications and status messages
4. **Text** - Body text and labels
5. **Badge** - Status indicators and tags
6. **Loading** - Loading states and spinners
7. **Modal** - Dialogs and overlays
8. **ProgressBar** - Progress tracking
9. **CodeBlock** - Code display
10. **Breadcrumb** - Navigation hierarchy
11. **ThemeToggle** - Theme switching

---

## 1. Heading Component

**Purpose**: All heading elements (h1-h6)  
**Location**: `src/components/ui/Heading.tsx`

```typescript
interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  children: React.ReactNode
  color?: 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange' | 'white' | 
          'roxy' | 'blaze' | 'echo' | 'lumi' | 'vex' | 'lexi' | 'nova' | 'glitch'
  glitch?: boolean
  className?: string
}

// Usage
<Heading level={1} color="cyan" glitch>Welcome to the Future</Heading>
<Heading level={2} color="roxy">Executive Dashboard</Heading>
<Heading level={3} color="blaze">Growth Metrics</Heading>
```

**Features**: Glitch effect, 5 neon + 8 agent colors, semantic HTML

---

## 2. Button Component

**Purpose**: All interactive actions  
**Location**: `src/components/ui/Button.tsx`

```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange' |
            'roxy' | 'blaze' | 'echo' | 'lumi' | 'vex' | 'lexi' | 'nova' | 'glitch'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

// Usage
<Button variant="cyan" size="md">Amplify Now</Button>
<Button variant="blaze" size="lg">Accelerate Growth</Button>
<Button variant="roxy" size="sm">Execute</Button>
```

**Sizes**: sm (4px 12px), md (6px 16px), lg (8px 20px)  
**Features**: Theme-aware shadows, hover scale, proper focus states

---

## 3. Alert Component

**Purpose**: Notifications and status messages  
**Location**: `src/components/ui/Alert.tsx`

```typescript
interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  description?: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

// Usage
<Alert variant="success" title="Success!" description="Operation completed" />
<Alert variant="error" title="Error" description="Something went wrong" dismissible />
```

**Variants**: success (Lime), error (Magenta), warning (Orange), info (Cyan)

---

## 4. Text Component

**Purpose**: Body text and labels  
**Location**: `src/components/ui/Text.tsx`

```typescript
interface TextProps {
  size?: 'xs' | 'sm' | 'base' | 'lg'
  color?: 'white' | 'secondary' | 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange' |
          'roxy' | 'blaze' | 'echo' | 'lumi' | 'vex' | 'lexi' | 'nova' | 'glitch'
  mono?: boolean
  uppercase?: boolean
  children: React.ReactNode
  className?: string
}

// Usage
<Text size="base" color="white">Standard description</Text>
<Text size="sm" color="secondary">Secondary information</Text>
```

---

## 5. Badge Component

**Purpose**: Status indicators and tags  
**Location**: `src/components/ui/Badge.tsx`

```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange' |
            'roxy' | 'blaze' | 'echo' | 'lumi' | 'vex' | 'lexi' | 'nova' | 'glitch'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Usage
<Badge variant="cyan" size="md">Active</Badge>
<Badge variant="lime" size="sm">Success</Badge>
```

---

## 6. Loading Component

**Purpose**: Loading states and spinners  
**Location**: `src/components/ui/Loading.tsx`

```typescript
interface LoadingProps {
  variant?: 'pulse' | 'shimmer' | 'flicker' | 'bounce'
  size?: 'sm' | 'md' | 'lg'
  color?: 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange' |
          'roxy' | 'blaze' | 'echo' | 'lumi' | 'vex' | 'lexi' | 'nova' | 'glitch'
  className?: string
}

// Usage
<Loading variant="pulse" size="md" color="cyan" />
<Loading variant="shimmer" size="lg" color="blaze" />
```

---

## 7. Modal Component

**Purpose**: Dialogs and overlays  
**Location**: `src/components/ui/Modal.tsx`

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  actions?: {
    label: string
    onClick: () => void
    variant?: string
  }[]
}

// Usage
<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm Action">
  <Text>Are you sure you want to proceed?</Text>
  <div className="flex gap-4 mt-6">
    <Button variant="cyan" onClick={confirm}>Yes</Button>
    <Button variant="magenta" onClick={cancel}>Cancel</Button>
  </div>
</Modal>
```

---

## 8. ProgressBar Component

**Purpose**: Progress tracking and measurement  
**Location**: `src/components/ui/ProgressBar.tsx`

```typescript
interface ProgressBarProps {
  value: number // 0-100
  color?: 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange' |
          'roxy' | 'blaze' | 'echo' | 'lumi' | 'vex' | 'lexi' | 'nova' | 'glitch'
  animated?: boolean
  label?: string
  className?: string
}

// Usage
<ProgressBar value={65} color="lime" label="65%" animated />
<ProgressBar value={100} color="cyan" />
```

---

## 9. CodeBlock Component

**Purpose**: Code display and syntax highlighting  
**Location**: `src/components/ui/CodeBlock.tsx`

```typescript
interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  copyable?: boolean
  className?: string
}

// Usage
<CodeBlock 
  code="const future = await accelerate(growth)"
  language="javascript"
  copyable
/>
```

---

## 10. Breadcrumb Component

**Purpose**: Navigation hierarchy  
**Location**: `src/components/ui/Breadcrumb.tsx`

```typescript
interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

// Usage
<Breadcrumb items={[
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Growth Metrics' }
]} />
```

---

## 11. ThemeToggle Component

**Purpose**: Theme switching (dark/light)  
**Location**: `src/components/navigation/ThemeToggle.tsx`

**Placement**: Top navigation bar, right side  
**Always Visible**: Yes  
**Functionality**: Toggles between dark and light themes

---

**Back to [Design System Overview](README.md)**
