# GRWM — Get Ready With Me

> Your closet. Your style. Your moment.

A Next.js (TypeScript) + Tailwind CSS site with email sign-up and log-in powered by **Supabase Auth**.

What's built so far:

- **Home page** (`/`): branding plus **Sign up** and **Log in** buttons
- **Sign up** (`/signup`) and **Log in** (`/login`) with email and password
- **My wardrobe** (`/wardrobe`) and **Outfit** (`/outfit`): empty pages, only for logged-in users
- Light and dark mode (follows your device; the moon/sun button switches it)

---

## 1. Run it on your computer

You need **Node.js 20 or newer** ([download](https://nodejs.org)).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The site works straight away, but sign-up and log-in won't
work until you connect Supabase (next step). Until then the forms say "Supabase isn't connected yet".

---

## 2. Connect your Supabase project

### a) Create a project (skip if you already have one)

1. Go to <https://supabase.com/dashboard> and sign in.
2. Click **New project**, give it a name (e.g. `grwm`), set a database password, pick a region near you, and click **Create new project**.
3. Wait a minute or two while it sets up.

### b) Copy your two keys

In your project in the Supabase dashboard:

| What to copy | Where to find it | What it looks like |
| --- | --- | --- |
| **Project URL** | Click **Connect** at the top of the page (or **Project Settings → Data API**) | `https://abcdefghijklmnop.supabase.co` |
| **Publishable key** | **Project Settings → API Keys**. Copy the **publishable** key | `sb_publishable_...` |

> If your project only shows the older **anon public** key (under **API Keys → Legacy API keys**), you can use that instead. It goes in the same place.
>
> ⚠️ **Never** copy the **secret** key or the **service_role** key into this project. Those are admin keys; this app doesn't need them.

### c) Paste them into `.env.local`

1. In the project folder, make a copy of `.env.example` and name it **`.env.local`**:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill it in:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Restart** the dev server (press `Ctrl + C`, then run `npm run dev` again). Next.js only reads `.env.local` when it starts.

`.env.local` is in `.gitignore`, so it will never be committed to git.

### d) Tell Supabase where your site lives

So the link in the confirmation email comes back to your site:

1. In the Supabase dashboard go to **Authentication → URL Configuration**.
2. Set **Site URL** to `http://localhost:3000`.
3. Under **Redirect URLs**, click **Add URL** and add `http://localhost:3000/**`.
4. Click **Save**.

### e) Try it

1. Go to <http://localhost:3000> and click **Sign up**.
2. Enter an email and a password (8+ characters).
3. Check your inbox and click the confirmation link. It logs you in and takes you to **My wardrobe**. Open the link **in the same browser** you signed up in.
4. Next time, just use **Log in**.

You can see everyone who has signed up under **Authentication → Users** in the Supabase dashboard.

### Optional: skip the confirmation email while testing

**Authentication → Sign In / Providers → Email**: turn off **Confirm email** and save.
New sign-ups are then logged in straight away. Turn it back on before you go live.

> Supabase's built-in email service only sends a few emails per hour. That's fine for testing; for a real launch, set up your own email provider under **Authentication → Emails → SMTP Settings**.

---

## 3. Going live later (e.g. on Vercel)

1. Add the same three variables in your host's settings (on Vercel: **Project → Settings → Environment Variables**), with `NEXT_PUBLIC_SITE_URL` set to your real address, e.g. `https://grwm.vercel.app`.
2. In Supabase **Authentication → URL Configuration**, change **Site URL** to your real address and add `https://your-address/**` to **Redirect URLs**.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Supabase isn't connected yet" | `.env.local` is missing, misnamed, or empty. Fix it, then restart `npm run dev`. |
| "Check your inbox and confirm your email first" | Click the link in the confirmation email (check spam), or turn off **Confirm email** (see above). |
| Confirmation link says it didn't work | Open the link in the same browser you signed up in, and make sure step 2d is done. Links expire after a while; sign up again for a fresh one. |
| Not getting emails | Supabase's built-in email is rate-limited. Wait a bit, or turn off **Confirm email** while testing. |

---

## Where things live

```
src/
  app/
    page.tsx                 Home page
    (auth)/login, signup     Log-in and sign-up pages
    (auth)/actions.ts        Sign up / log in / log out (talks to Supabase)
    (app)/wardrobe, outfit   Logged-in pages
    auth/confirm/route.ts    Handles the link in the confirmation email
    globals.css              Brand colours and light/dark theme
  lib/supabase/              Supabase connection helpers
  lib/auth.ts                Checks who is logged in
  proxy.ts                   Keeps the login fresh; sends logged-out visitors to /login
```

Brand colours: cream `#FAF7F2`, charcoal `#2A2622`, terracotta `#B5543A`, blush `#F2D5CB`,
gold `#C9A24B`, dark background `#1C1917`. Fonts: Playfair Display (headings), Inter (text).
