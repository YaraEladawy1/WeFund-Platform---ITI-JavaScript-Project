# WeFund

Crowdfunding-style demo: static frontend, **Express** + **json-server** API, data in `db.json`.

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000/pages/index.html](http://localhost:3000/pages/index.html).

Default admin (seed data): `admin@site.com` / `123456` — change or remove before any real deployment.

## Put this project on GitHub

1. Install [Git for Windows](https://git-scm.com/download/win) (or finish the installer if you started one). Restart the terminal after install.
2. Create a **new repository** on GitHub (no README/license if you already have this folder).
3. In this project folder, run (replace `YOUR_USER` and `YOUR_REPO`):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

**Security:** `db.json` stores passwords in **plain text** for learning/demo. Use a **private** GitHub repository, or replace `db.json` with a sanitized copy before making the repo public.

### Alternative: GitHub Desktop

Install [GitHub Desktop](https://desktop.github.com/), **File → Add local repository**, choose this folder, publish to GitHub from the app.
