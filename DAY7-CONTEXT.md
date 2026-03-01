# Day 7 Launch Context

You are building Payday Kingdom Day 7: Full launch.

## Current State

**MVP is complete and tested:**
- Onboarding flow working (PK-015 ✅)
- Kingdom naming working (PK-014 ✅)
- Screenshot/share system working (PK-013 ✅)
- Core game loop: income → bills → payday → hero fights → island grows → level up ✅
- Mobile responsive ✅
- Audio (9 synth sounds) ✅
- All data persists to localStorage ✅

**What's left:**
- Git repo initialization + README
- Vercel deployment (live URL)
- Testing checklist

## Day 7 Tasks

### TASK 1: Initialize Git Repo & Create README

**Current state:** Likely already a git repo from earlier days. Verify it exists.

```bash
git status  # Should show git repo already initialized
```

If NOT a repo:
```bash
git init
git config user.email "beefy@paydaykingdom.app"
git config user.name "Beefy Dan"
```

**Add .gitignore** (if missing):
```
node_modules/
dist/
.env
.DS_Store
*.log
```

**Commit if needed:**
```bash
git add .
git commit -m "Day 7: Ready for launch"
```

### TASK 2: Create README.md

File: `README.md` at project root

Content structure:
```markdown
# 🏰 Payday Kingdom

Gamify your finances. Turn bills into battles. Watch your kingdom grow.

## What Is This?

Payday Kingdom makes budgeting fun. Each bill becomes a voxel monster. On payday, your hero spawns and fights them all. Win, and your island grows. Level up from peasant → recruit → soldier → knight → champion → legend.

It's Animal Crossing meets personal finance. No anxiety. Just gameplay.

## Features

- **Gamified Budget Tracking:** Enter income and bills. Monsters spawn on your island.
- **Hero Battle System:** Click payday. Your hero fights each monster. Monsters explode with particles.
- **Island Growth:** 6 stages (barren → thriving kingdom). Grows as you level up.
- **Armor Progression:** Level up → unlock new armor tiers. Visual progression.
- **Sound Design:** 9 procedural synth sounds. Mute toggle included.
- **Mobile Responsive:** Works on desktop, tablet, phone. Drag budget panel on mobile.
- **Local Persistence:** All data saved to localStorage. No server. No sign-ups.
- **Screenshot & Share:** Capture your kingdom. Download, copy, or share to social media.
- **Onboarding:** First-time flow names your kingdom and sets up your first month.

## Tech Stack

- **React 18** + Vite (blazing fast build)
- **Three.js** (3D voxel rendering at 60fps)
- **Zustand** (state management)
- **Web Audio API** (procedural synth sounds)
- **CSS Grid** (mobile-first responsive layout)
- **localStorage** (persistence, zero backend)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and start building your kingdom.

### Build for Production

```bash
npm run build
npm run preview  # Test production build locally
```

## How to Play

1. **First visit:** Name your kingdom. Pick a banner color.
2. **Set your income:** Enter your monthly paycheck.
3. **Add monsters:** Enter each bill (rent, utilities, phone, etc.). Category optional.
4. **Trigger payday:** Click "Trigger Payday". Hero spawns and fights all monsters.
5. **Level up:** Defeat monsters → gain XP → level up → unlock new armor → island grows.
6. **Share:** Click "Capture Kingdom" to screenshot and share your progress.

### Tips
- More bills = harder battle. Bigger surplus = faster leveling.
- Strategies: Pay off high bills first, or attack small ones for quick wins.
- Island grows every 2 levels. Reach legend status to unlock all 6 stages.

## Architecture

### Components
- `Game3D.jsx`: Three.js scene, voxel rendering, animations
- `BudgetPanel.jsx`: Income/bill UI, mobile sidebar
- `HUD.jsx`: Stats overlay, buttons
- `ui/CaptureButton.jsx`: Screenshot modal
- `ui/KingdomSetup.jsx`: Kingdom naming modal
- `onboarding/OnboardingFlow.jsx`: 5-screen first-time experience

### Stores (Zustand)
- `budgetStore.js`: Income, bills, history, kingdom metadata
- `gameStore.js`: Level, XP, armor, island stage, battle state
- `soundStore.js`: Mute toggle, sound playback

### Utilities
- `voxelBuilder.js`: Functions to create voxel shapes (trees, buildings, characters, monsters)
- `soundEngine.js`: Procedural synth sound generation
- `screenshotCapture.js`: Canvas rendering for kingdom screenshots

### Styling
- `styles/`: Mobile-first responsive CSS
- Pixel font for headings
- Dark theme (dark gray background, white text)

## Roadmap

### Completed (MVP)
- ✅ Core game loop (income → bills → battles → leveling)
- ✅ Voxel 3D island
- ✅ Hero & battle animations
- ✅ Island growth stages
- ✅ Sound design (9 sounds)
- ✅ Mobile responsive
- ✅ Onboarding & kingdom naming
- ✅ Screenshot & share

### Coming Soon
- Monster personality (distinct designs per category)
- Achievement system (First Blood, Monster Hunter, etc.)
- Full camera rotation (currently ~30% rotation)
- Settings panel (edit kingdom, adjust difficulty)
- Cloud save (optional Firebase sync)
- Seasonal events (holiday themes)
- Multiplayer leaderboard (optional)

### Future Vision
- AI NPCs living on your island
- Friend visits
- Trading between kingdoms
- Mobile app (React Native)
- More voxel aesthetics (themes, decorations)

## Privacy

**No data leaves your device.** All game state stored in browser localStorage. No accounts, no tracking, no ads.

## Known Issues

- Camera rotation limited to ~30% (will expand in next update)
- Island stage caps at stage 4 currently (cosmetic only; progression continues)
- Settings gear icon (coming Day 7 patch)

## Contributing

Found a bug? Have a feature request? Open an issue or reach out to @BeefyDan on socials.

## License

MIT (or whatever you prefer, Dan)

## Built With ❤️

By Dan (Beefy Dan) and Bernie (AI coding partner)

---

**Ready to gamify your finances?** [Play Now](https://paydaykingdom.app)

Tweet: "Just beat my budget with a sword 🗡️ Level 5 knight. Island growing. This is unhinged in the best way."
```

**Key sections:**
- Hero explanation (hook)
- Feature list
- Setup instructions
- How to play
- Architecture (for devs)
- Roadmap (future features)
- Privacy statement
- Known issues (transparency)
- License & credits

### TASK 3: Vercel Deployment

**Prerequisites:**
- GitHub account (free tier fine)
- Vercel account (free tier fine, link to GitHub)

**Steps:**

1. **Push to GitHub** (if not already pushed):
```bash
# Create new repo on GitHub (name: payday-kingdom)
git remote add origin https://github.com/BeefyDan/payday-kingdom.git
git branch -M main
git push -u origin main
```

2. **Connect Vercel to GitHub repo:**
- Go to vercel.com
- Click "Import Project"
- Select GitHub repo: `payday-kingdom`
- Vercel auto-detects React + Vite
- Click "Deploy"

3. **Custom Domain (Optional):**
- After deploy, in Vercel dashboard: Settings → Domains
- Add `paydaykingdom.app` (or `paydaykingdom.vercel.app` auto-generated)
- If using custom domain, update DNS

4. **Environment Variables (if needed):**
- For now: none. All config is client-side.
- If adding backend later: add to Vercel env vars

5. **Analytics (Optional):**
- Vercel auto-includes Web Vitals
- In dashboard: Analytics tab shows traffic, performance

**Result:**
- Live URL: `https://paydaykingdom.vercel.app` (or custom domain)
- Auto-deploys on every `git push` to `main`
- Vercel handles CDN, HTTPS, scaling

### TASK 4: Test Checklist

Run through this before declaring done:

- ✅ Fresh browser (incognito): Visit live URL → onboarding shows
- ✅ Name kingdom "Test Realm" → set income $3500 → add 3 bills
- ✅ Flag appears on island
- ✅ Trigger payday → hero fights → sounds play → monsters explode
- ✅ Level up → armor changes → island grows
- ✅ Click "Capture Kingdom" → screenshot downloads with banner showing "Test Realm"
- ✅ Reload page → onboarding doesn't show, game state is there
- ✅ Mobile: Open on phone → layout responsive, budget panel draggable
- ✅ No console errors
- ✅ Sounds on/off toggle works
- ✅ ~60 FPS on Game3D scene

### TASK 5: Final Git Commit

```bash
git add .
git commit -m "Day 7: Launch complete. Live at paydaykingdom.vercel.app"
```

---

## Acceptance Criteria (Day 7 Complete)

1. ✅ README.md exists with full feature list, setup, and roadmap
2. ✅ GitHub repo is public and accessible
3. ✅ Vercel deployment is live with auto-deploy configured
4. ✅ Fresh user flow tested on live URL
5. ✅ All features working (no new bugs introduced)
6. ✅ Test checklist passed
7. ✅ Final commit pushed to GitHub

---

## What Happens Next (Post-Launch)

Once live:
1. Dan posts to socials (Twitter, Instagram, TikTok, Threads, YouTube)
2. Gather user feedback on features, bugs, UX
3. Day 6 polish (achievements, monster designs) based on real usage
4. Iterate on roadmap (camera rotation, settings, cloud save)

**The launch is the beginning, not the end.**

---

Build order:
1. Git setup + README
2. GitHub push
3. Vercel deploy
4. Test checklist
5. Final commit
6. **DONE** 🚀
