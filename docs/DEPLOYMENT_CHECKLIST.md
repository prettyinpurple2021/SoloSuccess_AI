# 🚀 SoloSuccess AI V1 - Deployment Checklist

**Target Date**: December 31, 2025
**Status**: Ready for Launch

---

## 1. PRE-DEPLOYMENT VERIFICATION

### Environment Variables
Ensure the following variables are set in your deployment environment (Vercel/Railway/etc.):
- [ ] `NODE_ENV=production`
- [ ] `Usage: VALIDATE_ENV=true` (Recommended for startup checks)
- [ ] `DATABASE_URL` (Neon Postgres)
- [ ] `UPSTASH_REDIS_REST_URL` & `TOKEN`
- [ ] `NEXTAUTH_SECRET` & `NEXTAUTH_URL`
- [ ] `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`
- [ ] `OPENAI_API_KEY`
- [ ] `RESEND_API_KEY`

### Application Build
Run these commands locally to ensure clean build:
```bash
npm run type-check   # Verify no TypeScript errors
npm run lint         # Verify no linting errors
npm run build        # Verify successful production build
```

### Database Migration
- [ ] Ensure database schema is pushed: `npm run db:push`

---

## 2. DEPLOYMENT STEPS

1.  **Push to `main` branch**:
    ```bash
    git push origin main
    ```
2.  **Monitor Build Logs**:
    - Watch for "Environment validation failed" (means you missed a variable).
    - Watch for "Prerendering" errors (means dynamic routes need `export const dynamic = 'force-dynamic'`).

---

## 3. POST-DEPLOYMENT SMOKE TEST (MANUAL)

Perform these actions on the **Live URL** to verify core functionality:

### 🔑 Authentication
- [ ] **Sign Up**: Create a new account.
- [ ] **Login**: Log in with that account.
- [ ] **Session**: Refresh page; ensure you stay logged in.

### 💳 Payments (Stripe Test Mode)
- [ ] **Subscription**: Go to `/pricing`, select "Pro".
- [ ] **Checkout**: Complete purchase with Stripe Test Card (`4242...`).
- [ ] **Access**: Verify you now have "Professional" tier access in Dashboard.

### 🧠 Core Features
- [ ] **Intelligence**: Run a competitor analysis (e.g., "Tesla"). Check result appears.
- [ ] **Notifications**: Go to Settings -> Notifications. Toggle a switch and Click "Save". Verify "Settings Saved" toast.
- [ ] **Favorites**: Go to Templates. Click "Heart" on a template. Refresh. Verify it stays hearted.

### 🛡️ Admin
- [ ] **Access**: Attempt to access `/admin`. Should be denied (403) or redirect.
- [ ] **Suspension**: (Optional) Use Admin API/Patch to suspend the test user. Verify they cannot log in.

---

## 4. ROLLBACK PLAN

If critical errors occur:
1.  Revert `main` to previous commit tag.
2.  Redeploy.
3.  Check application logs in Vercel/Provider dashboard.

---

**🎉 GOOD LUCK!**
