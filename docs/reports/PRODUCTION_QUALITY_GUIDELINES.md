# 🎯 PRODUCTION QUALITY GUIDELINES

## SoloSuccess AI - Mandatory Standards for All Contributors

**STATUS**: MANDATORY - ALL CODE MUST ADHERE TO THESE STANDARDS  
**LAST UPDATED**: 2025-12-30  
**ENFORCEMENT**: Zero tolerance policy - violations block deployment

---

## 🚨 ZERO TOLERANCE POLICIES

### Absolutely Forbidden (Block Deployment If Found)

1. **Mock Data**
   - ❌ NO hardcoded fake data arrays
   - ❌ NO `mockData`, `sampleData`, `fakeData` variables
   - ❌ NO placeholder responses in API routes
   - ✅ ALL data must come from database, external APIs, or real calculations

2. **TODO Comments**
   - ❌ NO TODO comments in production code
   - ❌ NO FIXME comments
   - ❌ NO "future implementation" notes
   - ✅ Either implement immediately or create a GitHub issue and link it

3. **Placeholder Content**
   - ❌ NO "Coming soon" text
   - ❌ NO placeholder URLs or images
   - ❌ NO "Lorem ipsum" text
   - ✅ Real content or don't ship the feature

4. **Disabled Code**
   - ❌ NO commented-out feature implementations
   - ❌ NO `disabled={true}` for production features
   - ❌ NO feature flags disabling core functionality
   - ✅ Either enable it or remove it completely

5. **Console Statements**
   - ❌ NO `console.log()`, `console.warn()`, `console.error()` in production code
   - ❌ NO `console.debug()`, `console.info()`
   - ✅ Use structured logging via `lib/logger.ts` ONLY

6. **Simulated Implementations**
   - ❌ NO `simulate*()` methods
   - ❌ NO fake delays (`setTimeout` for demo purposes)
   - ❌ NO mock API responses
   - ✅ Real implementations or don't ship

---

## 📋 CODE QUALITY GATES

### Build Requirements

**MANDATORY**: All of these must pass before any code can be merged:

1. **TypeScript Compilation**
   - Zero errors
   - Zero warnings
   - Strict mode enabled
   - No `any` types (use `unknown` with type guards)

2. **ESLint**
   - Zero errors
   - Zero warnings
   - All rules must pass

3. **Build Process**
   - `npm run build` must complete successfully
   - No build-time warnings
   - All pages must compile

4. **Type Checking**
   - `npm run typecheck` must pass with zero errors
   - All types must be properly defined
   - No implicit `any`

### Testing Requirements

**MANDATORY FOR NEW FEATURES**: Integration tests required

1. **API Routes**
   - Must have integration tests
   - Test authentication requirements
   - Test input validation
   - Test error handling
   - Test rate limiting

2. **Critical User Flows**
   - Signup/login flow
   - Payment/subscription flow
   - Data creation/editing flows
   - Any feature handling user data

3. **Database Operations**
   - Test all CRUD operations
   - Test transaction rollbacks
   - Test constraint violations

---

## 🔒 SECURITY STANDARDS

### Authentication & Authorization

**REQUIRED PATTERN FOR ALL PROTECTED API ROUTES:**

```typescript
import { authenticateRequest } from '@/lib/auth-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // 1. Rate limiting (REQUIRED)
  const rateLimitResult = await rateLimitByIp(request, { requests: 100, window: 60 })
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // 2. Authentication (REQUIRED)
  const { user, error } = await authenticateRequest()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Authorization check (REQUIRED for resource operations)
  // Verify user owns resource or has permission
  const resource = await getResource(resourceId)
  if (resource.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ... rest of handler
}
```

### Input Validation

**REQUIRED**: All inputs must use Zod schemas

```typescript
import { z } from 'zod'

// Define strict schema
const RequestSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional()
})

// Validate ALL inputs
const body = await request.json()
const { data, error } = RequestSchema.safeParse(body)
if (error) {
  return NextResponse.json(
    { error: 'Invalid input', details: error.errors },
    { status: 400 }
  )
}

// Use validated data only
const { name, email, age } = data
```

### Database Security

**FORBIDDEN**:

- ❌ String interpolation in SQL: `` `SELECT * FROM users WHERE id = ${userId}` ``
- ❌ Concatenating SQL strings
- ❌ Raw SQL with user input

**REQUIRED**:

- ✅ Use Drizzle ORM for all queries
- ✅ Use parameterized queries for raw SQL
- ✅ Validate all input before database operations

```typescript
// ✅ CORRECT - Using Drizzle ORM
const user = await db.query.users.findFirst({
  where: eq(users.id, userId)
})

// ✅ CORRECT - Parameterized query
const result = await sql`SELECT * FROM users WHERE id = ${userId}`

// ❌ WRONG - String interpolation
const query = `SELECT * FROM users WHERE id = ${userId}`
```

---

## ♿ ACCESSIBILITY STANDARDS

### WCAG 2.1 AA Compliance (MANDATORY)

**Form Requirements**:

- All inputs MUST have associated `<label>` or `aria-label`
- Error messages MUST have `role="alert"` and `aria-describedby`
- Required fields MUST have `aria-required="true"`

```typescript
// ✅ CORRECT
<label htmlFor="email">
  Email Address
</label>
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid={errors.email ? 'true' : 'false'}
  aria-required="true"
/>
{errors.email && (
  <p id="email-error" role="alert" className="text-red-500">
    {errors.email.message}
  </p>
)}

// ❌ WRONG - No label
<input type="email" placeholder="Enter email" />
```

**Keyboard Navigation**:

- All interactive elements MUST be keyboard accessible
- Focus order MUST be logical
- Focus indicators MUST be visible
- Modal dialogs MUST trap focus

**Screen Reader Support**:

- Complex interactions MUST have ARIA labels
- Status changes MUST be announced
- Loading states MUST be communicated

---

## ⚡ PERFORMANCE STANDARDS

### Core Web Vitals (MANDATORY)

All pages MUST meet these thresholds:

1. **Largest Contentful Paint (LCP)**
   - Target: < 2.5 seconds
   - Acceptable: < 4.0 seconds

2. **First Input Delay (FID) / Interaction to Next Paint (INP)**
   - Target: < 100 milliseconds
   - Acceptable: < 300 milliseconds

3. **Cumulative Layout Shift (CLS)**
   - Target: < 0.1
   - Acceptable: < 0.25

**Optimization Requirements**:

- Images MUST be optimized (Next.js Image component)
- Code MUST be split (dynamic imports for large components)
- Database queries MUST be optimized (indexes, pagination)
- API responses MUST be cached where appropriate

---

## 📱 RESPONSIVE DESIGN STANDARDS

### Mobile-First Approach (MANDATORY)

**Breakpoints** (Tailwind CSS):

- `sm: 640px` - Small devices
- `md: 768px` - Tablets
- `lg: 1024px` - Desktops
- `xl: 1280px` - Large desktops
- `2xl: 1536px` - Extra large desktops

**Testing Requirements**:

- MUST test at 320px (minimum mobile)
- MUST test at 768px (tablet)
- MUST test at 1024px (desktop)
- MUST test at 1920px (large desktop)

**Requirements**:

- NO horizontal scrolling at any breakpoint
- Touch targets MUST be at least 44x44px
- Text MUST be readable without zooming
- Modals/dialogs MUST work on mobile
- Navigation MUST be mobile-friendly

**FORBIDDEN**:

- ❌ Inline styles (use Tailwind classes)
- ❌ Fixed widths without responsive alternatives
- ❌ Desktop-only layouts

---

## 🎨 DESIGN SYSTEM COMPLIANCE

### Holographic Design System (MANDATORY)

**Component Usage**:

- ✅ Use `HolographicButton` for all buttons
- ✅ Use `HolographicCard` for all cards
- ✅ Use `GradientText` for headings
- ✅ Use `HolographicLoader` for loading states

**Colors**:

- Primary: `#B621FF` (purple)
- Secondary: `#18FFFF` (cyan)
- Tertiary: `#FF1FAF` (pink)
- Text: `#000000` (black)

**Animations**:

- MUST use Framer Motion for all animations
- MUST respect `prefers-reduced-motion`
- MUST use hardware-accelerated transforms

---

## 🔄 AI SERVICE FALLBACKS

### Multi-Provider Fallback Chain (REQUIRED)

When using AI services, implement this fallback order:

1. **Primary**: OpenAI (GPT-4, DALL-E)
2. **Fallback 1**: Anthropic (Claude)
3. **Fallback 2**: Google (Gemini)
4. **Final Fallback**: Acceptable production fallback (e.g., SVG generation for logos)

**REQUIRED PATTERN**:

```typescript
async function generateContent(prompt: string) {
  // Try OpenAI first
  try {
    if (process.env.OPENAI_API_KEY) {
      return await generateWithOpenAI(prompt)
    }
  } catch (error) {
    logError('OpenAI generation failed', error)
  }

  // Fallback to Anthropic
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      return await generateWithAnthropic(prompt)
    }
  } catch (error) {
    logError('Anthropic generation failed', error)
  }

  // Fallback to Google
  try {
    if (process.env.GOOGLE_AI_API_KEY) {
      return await generateWithGoogle(prompt)
    }
  } catch (error) {
    logError('Google generation failed', error)
  }

  // Final acceptable fallback
  return generateAcceptableFallback(prompt)
}
```

**ACCEPTABLE FALLBACKS**:

- SVG generation for logos (programmatic, not mock)
- Template-based generation (using real templates)
- Cached previous results (if valid)

**UNACCEPTABLE FALLBACKS**:

- ❌ Mock data
- ❌ Placeholder responses
- ❌ Empty results
- ❌ Error responses without fallback

---

## 📝 ERROR HANDLING STANDARDS

### Structured Logging (REQUIRED)

**MANDATORY**: Use `lib/logger.ts` for all logging

```typescript
import { logError, logWarn, logInfo, logDebug } from '@/lib/logger'

// ✅ CORRECT
try {
  await operation()
  logInfo('Operation successful', { userId, operationId })
} catch (error) {
  logError('Operation failed', error, { userId, operationId })
  throw error
}

// ❌ WRONG
try {
  await operation()
  console.log('Success')
} catch (error) {
  console.error('Failed', error)
}
```

**Error Response Pattern**:

```typescript
// ✅ CORRECT - Structured error response
catch (error) {
  logError('API operation failed', error, { userId, operation })
  
  // Don't expose internal errors to client
  return NextResponse.json(
    { 
      error: 'Operation failed',
      code: 'OPERATION_FAILED',
      requestId: generateRequestId()
    },
    { status: 500 }
  )
}
```

---

## 🗄️ DATA INTEGRITY STANDARDS

### Database Operations (MANDATORY)

**REQUIRED**:

- ✅ All queries MUST use parameterized statements
- ✅ All transactions MUST have rollback handling
- ✅ All foreign key constraints MUST be respected
- ✅ All unique constraints MUST be checked

**FORBIDDEN**:

- ❌ Direct SQL string concatenation
- ❌ Raw queries without validation
- ❌ Bypassing ORM for convenience

### Data Validation

**REQUIRED**: Validate data at multiple layers

1. **Input Layer**: Zod schema validation
2. **Business Logic Layer**: Type checking and constraints
3. **Database Layer**: Schema constraints

---

## 🧪 TESTING REQUIREMENTS

### Integration Tests (MANDATORY FOR NEW FEATURES)

**REQUIRED COVERAGE**:

- All API routes
- Critical user flows
- Database operations
- Authentication flows

**Test File Location**: `tests/` directory

**Test Pattern**:

```typescript
import { describe, it, expect, beforeAll } from '@testing-library/react'

describe('API Route: /api/users', () => {
  it('should require authentication', async () => {
    const response = await fetch('/api/users')
    expect(response.status).toBe(401)
  })

  it('should return user data for authenticated requests', async () => {
    const token = await getAuthToken()
    const response = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('users')
  })
})
```

---

## 🚀 DEPLOYMENT STANDARDS

### Vercel Configuration (MANDATORY)

**Build Requirements**:

- `npm run build` MUST succeed
- Environment variables MUST be configured
- Database migrations MUST be run
- All API routes MUST be accessible

**Pre-Deployment Checklist**:

- [ ] All tests pass
- [ ] Build succeeds
- [ ] TypeScript compiles
- [ ] No console.log statements
- [ ] No mock data
- [ ] No TODOs
- [ ] Security scan passes
- [ ] Performance audit passes
- [ ] Accessibility audit passes

---

## ✅ CODE REVIEW CHECKLIST

Before submitting code for review, verify:

- [ ] Zero TypeScript errors
- [ ] Zero ESLint warnings
- [ ] All tests pass
- [ ] No mock data
- [ ] No TODO comments
- [ ] No console.log statements
- [ ] Proper authentication on all routes
- [ ] Input validation on all inputs
- [ ] Error handling implemented
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Responsive (tested at all breakpoints)
- [ ] Performance optimized
- [ ] Uses holographic design system
- [ ] Follows naming conventions
- [ ] Documented if complex

---

## 🎯 SUCCESS CRITERIA

### Technical Metrics

- **Build**: Zero errors, zero warnings
- **Tests**: 100% pass rate
- **Type Coverage**: 100% (no `any`)
- **Lint Score**: Zero violations
- **Security**: Zero vulnerabilities
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Core Web Vitals all green

### Business Metrics

- **User Value**: All features deliver real value
- **Data Integrity**: No mock/simulated data
- **Reliability**: 99.9% uptime
- **User Experience**: Sub-3 second loads

---

## 🚫 VIOLATION CONSEQUENCES

**If any of these are found in code review or deployment**:

1. **Block merge/deployment immediately**
2. **Require immediate fix**
3. **No exceptions for "quick fixes" or "temporary code"**

**Zero tolerance means zero tolerance.**

---

## 📚 REFERENCE DOCUMENTS

- `SOLOSUCCESS_AI_RULES.md` - Original rules document
- `COMPREHENSIVE_AUDIT_REPORT.md` - Current issues and fixes
- `HOLOGRAPHIC_DESIGN_SYSTEM.md` - Design system specifications
- `.cursor/rules/` - Additional workspace rules

---

**REMEMBER**: This is a production application serving real users paying real money. Every line of code must meet these standards. No compromises. No shortcuts. No exceptions.

**Build with integrity. Ship with confidence. Serve users with excellence.**
