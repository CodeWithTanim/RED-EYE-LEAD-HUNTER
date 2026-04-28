# Hosting Guide for RED-EYE LEAD-HUNTER

This project is built using **Vite + React**. Below are the step-by-step instructions to host your website on popular platforms.

---

## 1. Vercel (Recommended)
Vercel is the easiest platform for React/Vite projects.

1.  **Push your code** to a GitHub, GitLab, or Bitbucket repository.
2.  Go to [Vercel](https://vercel.com/) and sign in with your Git provider.
3.  Click **"Add New"** > **"Project"**.
4.  Import your `RED-EYE-LEAD-HUNTER` repository.
5.  Vercel will automatically detect Vite. Ensure the settings are:
    *   **Framework Preset:** `Vite`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
6.  Click **"Deploy"**. Your site will be live in seconds!

---

## 2. Netlify
Netlify is another excellent choice for static site hosting.

1.  Push your code to GitHub.
2.  Login to [Netlify](https://www.netlify.com/).
3.  Click **"Add new site"** > **"Import an existing project"**.
4.  Choose your Git provider and select your repository.
5.  Set the following build settings:
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
6.  Click **"Deploy site"**.
7.  *(Optional)* To fix React Router 404 issues on page refresh, create a `public/_redirects` file with:
    ```text
    /*  /index.html  200
    ```

---

## 3. GitHub Pages
GitHub Pages is free and integrated directly into your repository.

### Option A: Using GitHub Actions (Easiest)
1.  Go to your repository on GitHub.
2.  Click **Settings** > **Pages**.
3.  Under **Build and deployment** > **Source**, select **"GitHub Actions"**.
4.  GitHub will suggest a "Static HTML" or "Vite" workflow. Search for "Vite" or use the official Vite starter workflow.

### Option B: Manual Deploy (gh-pages branch)
1.  Install the `gh-pages` package:
    ```bash
    npm install gh-pages --save-dev
    ```
2.  Add these scripts to your `package.json`:
    ```json
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
    ```
3.  Run `npm run deploy`.
4.  In GitHub Settings > Pages, set the source to the `gh-pages` branch.

---

## 4. Hostinger / Shared Hosting (cPanel)
If you are using Hostinger or any shared hosting with a File Manager/FTP.

1.  **Install dependencies and build your project locally:**
    Open your terminal in the project folder and run:
    ```bash
    npm install
    npm run build
    ```
2.  **Locate the build folder:**
    This will create a `dist` folder in your project directory.
3.  **Upload to Hostinger:**
    *   Log in to your **hPanel** (Hostinger Control Panel).
    *   Go to **File Manager**.
    *   Open the `public_html` folder.
    *   **Upload all contents** from your local `dist` folder directly into `public_html`.
4.  **Fix React Router (404 on refresh):**
    If your app has multiple pages/routes, create a file named `.htaccess` in the `public_html` folder and paste this:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule . /index.html [L]
    </IfModule>
    ```


---

## Important Build Notes
*   **Build Command:** `npm run build`
*   **Output Folder:** `dist`
*   **Environment Variables:** If you have an `.env` file, make sure to add those variables in the Hosting Provider's dashboard (e.g., Vercel Project Settings > Environment Variables).

---

## Premium Custom Domain
If you have a custom domain (e.g., `www.redeye-leads.com`):
1.  Go to the **Domain Settings** of your hosting provider (Vercel/Netlify).
2.  Add your domain.
3.  Update your domain's **DNS records** (A record or CNAME) as instructed by the provider.
