#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Check if this is development mode
const isDev = process.argv.includes('dev');

// Environment variables to replace
const envVars = {
  'NG_APP_SUPABASE_URL': process.env.NG_APP_SUPABASE_URL || (isDev ? 'https://szmsslujuqdrsgogzaaw.supabase.co' : ''),
  'NG_APP_SUPABASE_ANON_KEY': process.env.NG_APP_SUPABASE_ANON_KEY || (isDev ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bXNzbHVqdXFkcnNnb2d6YWF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NzY2NDEsImV4cCI6MjA3NjA1MjY0MX0.qLN2t7glHvuVwxgwiMAFTsFiWL2n4gei3DdwVf4J9WQ' : ''),
  'NG_APP_REQUIRES_BETA_ACCESS': process.env.NG_APP_REQUIRES_BETA_ACCESS || 'true',
  'NG_APP_BETA_ACCESS_CODE_HASH': process.env.NG_APP_BETA_ACCESS_CODE_HASH || (isDev ? 'MzcyODQ3' : '')
};

// Directory containing built files
const distDir = path.join(__dirname, '..', 'dist', 'propza', 'browser');

console.log(`🔧 Replacing environment variables in built files (${isDev ? 'development' : 'production'} mode)...`);

// Function to replace environment variables in a file
function replaceEnvVars(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace process.env['VARIABLE_NAME'] and process.env["VARIABLE_NAME"] with actual values
    Object.entries(envVars).forEach(([key, value]) => {
      // Handle both single and double quotes
      const regexSingle = new RegExp(`process\\.env\\['${key}'\\]`, 'g');
      const regexDouble = new RegExp(`process\\.env\\["${key}"\\]`, 'g');
      const replacement = `"${value}"`;
      
      if (content.includes(`process.env['${key}']`) || content.includes(`process.env["${key}"]`)) {
        content = content.replace(regexSingle, replacement);
        content = content.replace(regexDouble, replacement);
        modified = true;
        console.log(`✅ Replaced ${key} with ${value ? '***' : 'empty string'}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`📝 Updated: ${path.relative(distDir, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively process files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      replaceEnvVars(filePath);
    }
  });
}

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Dist directory not found:', distDir);
  process.exit(1);
}

// Process all files in the dist directory
processDirectory(distDir);

console.log('🎉 Environment variable replacement complete!');
