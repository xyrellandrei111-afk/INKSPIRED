# INKSPIRED Deployment Guide

This project is a static frontend that connects to Supabase directly from the browser. It is ready for GitHub Pages deployment through `.github/workflows/pages.yml`.

## 1. Supabase Setup

1. Open your Supabase project.
2. Run `supabase-schema.sql` in the SQL editor if the database tables are not created yet.
3. Go to **Authentication > URL Configuration**.
4. Set **Site URL** to your production domain:

```text
https://your-domain.com
```

5. Add redirect URLs for production and local testing:

```text
https://your-domain.com/**
https://your-github-username.github.io/your-repo-name/**
http://localhost:3000/**
http://127.0.0.1:5500/**
```

6. Confirm the public values in `supabase-config.js` match your Supabase project:

```js
window.INKSPIRED_CONFIG = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabaseAnonKey: 'your-publishable-anon-key'
};
```

The anon key is expected to be public in browser apps. Keep service-role keys out of this repo.

## 2. GitHub Repository Setup

From the project folder:

```powershell
git init
git branch -M main
git add .
git commit -m "Prepare INKSPIRED for deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then in GitHub:

1. Open the repository.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Pushes to `main` will run `.github/workflows/pages.yml` and deploy the site.

## 3. Custom Domain

After you know the exact domain, create a file named `CNAME` at the repo root with only the domain inside:

```text
your-domain.com
```

Commit and push it:

```powershell
git add CNAME
git commit -m "Add custom domain"
git push
```

In GitHub, go to **Settings > Pages > Custom domain** and enter the same domain.

## 4. DNS Records

For a subdomain such as `www.your-domain.com`, add a DNS `CNAME` record:

```text
Name: www
Type: CNAME
Value: YOUR_USERNAME.github.io
```

For an apex/root domain such as `your-domain.com`, add GitHub Pages `A` records:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Also add the GitHub Pages `AAAA` records if your DNS provider supports IPv6:

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

After DNS verifies, enable **Enforce HTTPS** in GitHub Pages.

## 5. Local Smoke Test

```powershell
npm install
npm run serve
```

Open the local URL shown by `serve`, then check:

1. Storefront loads past the splash screen.
2. Demo fallback works if Supabase is unreachable.
3. Sign-in opens the auth modal.
4. Developer and admin dashboards can enter demo mode.
5. Cart and checkout work.
