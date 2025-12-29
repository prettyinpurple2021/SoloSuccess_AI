# Vercel Environment Variables Setup

This document outlines the required environment variables that must be set in Vercel for successful deployment.

## Required Environment Variables

### DevCycle Feature Flags

For the build to succeed, you **must** set the following DevCycle SDK keys in Vercel.

**Vercel Environment Mapping:**
- **Production** → Use Production keys (live site)
- **Preview** → Use Staging keys (branch/PR deployments)
- **Development** → Use Development keys (local development)

**For Production Environment:**
```
NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY=dvc_client_6f82bf53_fda0_44af_93aa_17b5adf5edd5_5b5d2d3
DEVCYCLE_SERVER_SDK_KEY=dvc_server_438f3cb9_e1ad_4744_8184_91656e0fe5fe_8f65f72
```

**For Preview Environment (branch/PR deployments):**
```
NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY=dvc_client_2609d0fb_c765_4498_a7b9_11c92cca631a_e5b6208
DEVCYCLE_SERVER_SDK_KEY=dvc_server_44fc5b0b_378d_4166_b4a9_1672655703c6_393f2a7
```

**For Development Environment (local development):**
```
NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY=dvc_client_df89671e_e2ed_46dd_b132_9bbe87613ff4_fd13c04
DEVCYCLE_SERVER_SDK_KEY=dvc_server_befe6851_a17e_4fb3_ab69_cfdcbc450b62_d60d0e2
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the appropriate value
4. Select which environments it applies to (Production, Preview, Development)
5. Click **Save**

## Important Notes

- **Build Failure**: If these keys are not set, the build will fail with: `Error: Missing server SDK key! Provide a valid SDK key to DevCycleServersideProvider`
- **Environment-Specific**: Make sure to set the correct keys for each environment (Production, Preview, Development)
- **Client vs Server**: 
  - `NEXT_PUBLIC_*` variables are exposed to the browser
  - Non-prefixed variables are server-only

## Other Required Environment Variables

Refer to `env.example` for a complete list of all environment variables needed for the application.

