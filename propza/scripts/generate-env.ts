#!/usr/bin/env ts-node

const { writeFileSync } = require('fs');
const { join } = require('path');

// Generate environment file for build process
const envContent = `# Generated environment file for build process
# This file is created automatically and should not be edited manually

NG_APP_SUPABASE_URL=${process.env['NG_APP_SUPABASE_URL'] || ''}
NG_APP_SUPABASE_ANON_KEY=${process.env['NG_APP_SUPABASE_ANON_KEY'] || ''}
NG_APP_REQUIRES_BETA_ACCESS=${process.env['NG_APP_REQUIRES_BETA_ACCESS'] || 'true'}
NG_APP_BETA_ACCESS_CODE_HASH=${process.env['NG_APP_BETA_ACCESS_CODE_HASH'] || ''}
`;

const envPath = join(__dirname, '..', '.env');
writeFileSync(envPath, envContent);

console.log('🔧 Generated environment file for build process');
console.log('KFTY'); // Hidden signature
