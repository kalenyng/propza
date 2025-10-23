// Environment variables are injected via Vercel Environment Variables
export const environment = {
  production: true,
  supabaseUrl: process.env['NG_APP_SUPABASE_URL'] || '',
  supabaseAnonKey: process.env['NG_APP_SUPABASE_ANON_KEY'] || '',
  requiresBetaAccess: process.env['NG_APP_REQUIRES_BETA_ACCESS'] === 'true',
  betaAccessCodeHash: process.env['NG_APP_BETA_ACCESS_CODE_HASH'] || ''
};