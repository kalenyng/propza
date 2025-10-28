// Template for environment.prod.ts
// This file is a template and should not be edited directly.
// Run 'npm run prebuild' to generate the actual environment files.
// The actual environment.ts and environment.prod.ts files are auto-generated
// by scripts/generate-env.ts from your .env.local or environment variables.

export const environment = {
  production: true,
  supabaseUrl: '', // Set via NG_APP_SUPABASE_URL or SUPABASE_URL env var
  supabaseAnonKey: '', // Set via NG_APP_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY env var
  requiresBetaAccess: true, // Set via NG_APP_REQUIRES_BETA_ACCESS env var
  betaAccessCodeHash: '' // Set via NG_APP_BETA_ACCESS_CODE_HASH or BETA_ACCESS_CODE_HASH env var
};

