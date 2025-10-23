// Environment variables are injected via .env.local (local) or Vercel (production)
export const environment = {
  production: false,
  supabaseUrl: process.env['NG_APP_SUPABASE_URL'] || '',
  supabaseAnonKey: process.env['NG_APP_SUPABASE_ANON_KEY'] || '',
  requiresBetaAccess: process.env['NG_APP_REQUIRES_BETA_ACCESS'] === 'true' || true,
  betaAccessCodeHash: process.env['NG_APP_BETA_ACCESS_CODE_HASH'] || ''
};