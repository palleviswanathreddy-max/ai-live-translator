# Deployment Guide - MV Live Translator & Academy

Step-by-step guide for deploying **MV Live Translator & Academy** to **GitHub** and **Vercel**.

---

## 1. Local Prerequisites & Build Verification

Before deploying, ensure local build succeeds with zero errors:

```bash
# Install dependencies
npm install

# Verify TypeScript compilation and production bundle
npm run build
```

---

## 2. Pushing Code to GitHub

1. Initialize Git repository (if not already initialized):

   ```bash
   git init
   git add .
   git commit -m "Initial commit: MV Live Translator & Academy"
   ```

2. Create a new repository on [GitHub](https://github.com/new).

3. Link local repository and push:

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mv-live-translator.git
   git branch -M main
   git push -u origin main
   ```

---

## 3. Deploying to Vercel

### Option A: Import via Vercel Dashboard (Recommended)

1. Log in to [Vercel](https://vercel.com).

2. Click **Add New** ➔ **Project**.

3. Select your **GitHub repository** (`mv-live-translator`).

4. Configure Project Settings:

   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Click **Deploy**. Vercel will automatically build and publish your live application.

---

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy to production
vercel --prod
```

---

## 4. Environment Variables Configuration

The application uses **Free-First Architecture**, meaning it operates **100% free with zero API keys required**.

If you wish to configure optional cloud environment variables in Vercel:

1. Go to Project **Settings** ➔ **Environment Variables**.

2. Add keys specified in `.env.example` (`VITE_APP_ENV`, `VITE_AI_PROVIDER_TYPE`).

---

## 5. Post-Deployment Verification

After Vercel deployment completes:

- Test navigating directly to routes (`/`, `/learning`, `/voice`) and refreshing page to confirm SPA rewrite rules (`vercel.json`) work.

- Test speech recognition (`te-IN` and `en-US`) and text-to-speech audio output.
