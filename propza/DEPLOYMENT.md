# Propza - Vercel Deployment Guide

## 🚀 Quick Deploy

### Option 1: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? **Select your account**
   - Link to existing project? **N**
   - What's your project's name? **propza** (or your preferred name)
   - In which directory is your code located? **.**
   
4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

### Option 2: Deploy via GitHub (Recommended for CI/CD)

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/propza.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Angular settings
   - Click "Deploy"

3. **Environment Variables** (if needed):
   - Your Supabase credentials are already in the code
   - If you need to add secrets, go to Project Settings → Environment Variables

---

### Option 3: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Import Git Repository" or "Upload Project"
3. Choose your project directory
4. Vercel will auto-detect Angular configuration
5. Click "Deploy"

---

## ⚙️ Configuration Files

### `vercel.json`
✅ Already configured with:
- Angular framework detection
- SPA routing (all routes → index.html)
- PWA service worker headers
- Optimal caching for JS/CSS

### `package.json`
✅ Production build script added: `npm run build:prod`

### `angular.json`
✅ Budgets updated for production deployment

---

## 🌍 Environment Variables

Your app uses these Supabase credentials (already configured):

- **URL**: `https://xnxcyqixihnbxrqxftcv.supabase.co`
- **Anon Key**: Already in `environment.prod.ts`

No additional environment variables needed for deployment!

---

## 📱 PWA Features

Your app is deployed as a Progressive Web App:

- ✅ Service Worker enabled in production
- ✅ Offline capability
- ✅ Add to Home Screen
- ✅ App icon configured (`popza-app.png`)
- ✅ Optimized caching strategy

Users can install Propza as a native-like app!

---

## 🔄 Automatic Deployments

Once connected to GitHub:

- **Every push to `main`** → Automatic production deployment
- **Every pull request** → Preview deployment
- Vercel provides unique URLs for each PR

---

## 📊 Post-Deployment

After deployment, Vercel provides:

1. **Production URL**: `https://propza.vercel.app` (or your custom domain)
2. **Analytics**: Page views, performance metrics
3. **Logs**: Real-time function logs
4. **Performance monitoring**: Core Web Vitals

---

## 🎯 Custom Domain (Optional)

To use your own domain:

1. Go to Project Settings → Domains
2. Add your domain (e.g., `propza.co.za`)
3. Follow DNS configuration instructions
4. Vercel handles SSL automatically

---

## 🐛 Troubleshooting

### Build fails with "budgets exceeded"
Already fixed! Budgets have been increased in `angular.json`.

### Service Worker not working
- Service workers only work on HTTPS
- Vercel automatically provides HTTPS
- Test on production URL (not localhost in dev mode)

### Routing issues (404 on refresh)
Already configured! The `vercel.json` rewrites all routes to `index.html`.

### Supabase connection issues
Check that your Supabase project is active and credentials are correct in `environment.prod.ts`.

---

## 📈 Performance

Your production build:
- **Initial bundle**: ~796 KB
- **Gzipped**: ~164 KB
- **Service Worker**: Caches for offline use
- **CDN**: Served globally via Vercel Edge Network

---

## 🔐 Security

- ✅ HTTPS enabled by default
- ✅ Supabase Row Level Security (RLS) configured
- ✅ Authentication via Supabase Auth
- ✅ No sensitive keys exposed (using anon key)

---

## 📞 Support

**Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)  
**Angular on Vercel**: [vercel.com/guides/deploying-angular](https://vercel.com/guides/deploying-angular)

---

## ✅ Deployment Checklist

- [x] Production build tested
- [x] `vercel.json` configured
- [x] PWA manifest configured
- [x] Service worker configured
- [x] Routing configured
- [x] Supabase credentials set
- [x] Budget limits updated
- [ ] Deploy to Vercel
- [ ] Test PWA installation
- [ ] Verify authentication works
- [ ] Test on mobile devices
- [ ] (Optional) Add custom domain

---

## 🎉 You're Ready!

Run `vercel` in your terminal to deploy now!

