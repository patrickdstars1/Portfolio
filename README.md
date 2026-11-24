# BANK.DEV — Patcharapon Khongmod

Single-page personal portfolio with an 8-bit theme and parallax pixel scenery: React + Vite + Tailwind CSS, with a lazy-loaded 3D lab (Three.js, React Three Fiber, GSAP).

```bash
npm install
npm run dev      # local development
npm run build    # production build in dist/
```

## Editing content

All content lives in `src/data/`:

| File | What it holds |
| --- | --- |
| `profile.js` | Name, roles, email, links, resume path |
| `experience.js` | Work history |
| `skills.js` | Skill groups (add `{ name, icon }`) |
| `projects.js` | Projects. Set `url`, `repo`, `image` when real links and screenshots are ready |
| `translations.js` | All UI copy in English and Thai |
| `labComponents.js` | Part descriptions for the 3D lab |

The resume PDF is `public/resume/Patcharapon_Khongmod_Resume.pdf`.

## Structure

- `src/components/` — portfolio sections, terminal, theme and language switchers
- `src/lab/` — the BK-8 console in the Interactive Lab section (assemble, take apart, view parts)
- `src/lib/pixelScene.js`, `src/lib/parallax.js` — procedural pixel-art scenery and the parallax engine
- `src/lib/achievements.js`, `src/components/Achievements.jsx` — achievements unlocked by exploring the site (list and rules are in the first file)
- `src/components/Mascot.jsx` — "Byte", the mascot that follows the pointer (sprite in `src/lib/pixel.js`)
- `demos/`, `src/demos/` — two stand-alone demo tools (PromptPay QR Maker, Line Stop Analyzer), each its own page in the build
- `src/hooks/`, `src/lib/` — language, theme, routing, scroll and sound helpers

## Follower counts

The AI clip pages card shows follower counts that refresh automatically.

- `src/data/socials.js` lists the accounts (platform, ID, and the name of the secret that holds its token).
- `scripts/fetch-stats.mjs` calls each platform's API and writes `public/stats.json`.
- `.github/workflows/deploy.yml` runs that script before every build, and also on a schedule (every 30 minutes), then redeploys the site. The page re-reads `stats.json` every 5 minutes while it is open.
- Accounts without a token (or whose API call fails) keep their previous number, so the page never shows zeros. With no data at all the box is hidden.

Add the tokens in the repository: Settings, Secrets and variables, Actions, New repository secret.

| Secret | Used for |
| --- | --- |
| `FB_TOKEN_ABYSS` | Page access token for Abyss Files |
| `FB_TOKEN_XENO` | Page access token for Xeno Atlas |

To show TikTok, YouTube or Instagram too, add an entry to `socials.js` (platform, ID, a new `tokenEnv`) and pass that secret to the "Refresh follower counts" step in the workflow.

## Demo tools

`demos/promptpay` and `demos/linestop` are separate pages (see `build.rollupOptions.input` in `vite.config.js`) that share the site's theme, language and fonts through `src/demos/shared/`.

- The logic lives in plain functions you can test without a browser: `src/demos/promptpay/emv.js` (Thai QR Payment payload and CRC-16) and `src/demos/linestop/analyze.js` (CSV parsing and statistics).
- Both run entirely in the browser with sample data. Nothing is uploaded or stored.
