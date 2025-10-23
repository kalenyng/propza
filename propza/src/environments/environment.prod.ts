export const environment = {
  production: true,
  supabaseUrl: process.env['SUPABASE_URL'] || '',
  supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] || '',
  requiresBetaAccess: process.env['REQUIRES_BETA_ACCESS'] === 'true',
  betaAccessCodeHash: process.env['BETA_ACCESS_CODE_HASH'] || ''
};
