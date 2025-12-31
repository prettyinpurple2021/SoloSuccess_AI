export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Validate environment variables on server startup
    try {
      // Dynamic import to avoid bundling issues in edge/browser
      const { validateEnv } = await import('./src/lib/env-validation')
      validateEnv()
    } catch (err) {
      console.error('Failed to validate environment:', err)
      // Rely on validation logic to throw if necessary
    }
  }
}
