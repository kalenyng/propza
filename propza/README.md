# Propza

Property management made simple - Track rent, tenants, and payments all in one place.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.21.

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NG_APP_SUPABASE_URL=https://your-project.supabase.co
NG_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Beta Access Configuration
NG_APP_BETA_ACCESS_CODE_HASH=your-beta-code-hash
NG_APP_REQUIRES_BETA_ACCESS=true
```

**Note**: You can also use the shorter variable names (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.) - the script will check both formats.

### Environment File Generation

The environment files (`src/environments/environment.ts` and `environment.prod.ts`) are auto-generated from your environment variables. Before building or running the app, generate these files:

```bash
npm run prebuild
```

This script:
1. Reads environment variables from `.env.local` (local) or system environment (Vercel)
2. Generates `environment.ts` and `environment.prod.ts` with hardcoded values
3. Eliminates browser errors related to `process.env` not being defined

The generated files are gitignored for security. Template files are provided in `src/environments/*.template.ts` for reference.

### Production Deployment (Vercel)

Set these environment variables in your Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add each variable with the `NG_APP_` prefix:
   - `NG_APP_SUPABASE_URL`
   - `NG_APP_SUPABASE_ANON_KEY`
   - `NG_APP_REQUIRES_BETA_ACCESS`
   - `NG_APP_BETA_ACCESS_CODE_HASH`
4. The build script (`npm run build:vercel`) automatically generates environment files before building

**Important**: Never commit `.env` files or generated environment files to version control.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Security Features

- Row Level Security (RLS) policies implemented in Supabase
- Input sanitization for all user inputs
- Environment variable protection for sensitive data
- Production build optimizations (no source maps)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
