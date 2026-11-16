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
- `src/hooks/`, `src/lib/` — language, theme, routing, scroll and sound helpers
