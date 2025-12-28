# Deploying KaraOkay

## 1. Firebase Setup (Required)
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Realtime Database** (Start in Test Mode or set rules to allow read/write).
3. Go to **Project Settings** > **General** and scroll to "Your apps".
4. Create a "Web" app and copy the `firebaseConfig` keys.

## 2. Deploy to Vercel (Recommended)
1. Push this code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and "Add New Project".
3. Import your repository.
4. **Environment Variables**: Add the following variables using your Firebase keys:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_DATABASE_URL`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
5. Click **Deploy**. Vercel will detect Nuxt automatically.

## 3. Deploy to GitHub Pages
1. Push code to GitHub.
2. Go to **Settings** > **Pages**.
3. Source: **GitHub Actions**.
4. Create a `.github/workflows/deploy.yml` file (see below).
5. Add your Firebase keys as **Repository Secrets** (Settings > Secrets and variables > Actions).
   - Prefix them with `NUXT_PUBLIC_` if needed, or mapped in the workflow. 
   - *Note*: Since this is a static build, keys will be baked into the public JS files. This is normal for Firebase client keys.

### GitHub Actions Workflow Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: corepack enable
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm run generate
        env:
          FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          FIREBASE_DATABASE_URL: ${{ secrets.FIREBASE_DATABASE_URL }}
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
          FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
          FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
      - uses: actions/upload-pages-artifact@v1
        with:
          path: .output/public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    permissions:
      pages: write
      id-token: write
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```
