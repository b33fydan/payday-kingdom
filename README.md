# 🏰 Payday Kingdom

Gamify your finances. Turn bills into battles. Watch your kingdom grow.

## What Is This?

Payday Kingdom is a browser game where your monthly budget becomes a playable voxel world.

- Your income powers your kingdom.
- Your bills spawn as monsters.
- On payday, your hero fights everything on the island.
- Winning battles levels you up from peasant to legend, while the island evolves over time.

Think Animal Crossing energy, with budgeting goals and zero judgment.

## Features

- **Gamified Budget Tracking:** Add income and bills, then see that month represented in 3D.
- **Hero Battle Loop:** Trigger payday and watch your hero fight bill-monsters with particles and combat pacing.
- **Island Growth:** Multi-stage progression that adds structures, life, and detail as you complete months.
- **Armor Progression:** Hero visuals upgrade as your level increases.
- **Sound Design:** Procedural synth sound effects with a persistent mute toggle.
- **Onboarding + Kingdom Setup:** First-time flow guides setup and lets players name their kingdom.
- **Screenshot & Share:** Capture your current kingdom, then download/copy/share.
- **Mobile Friendly UI:** Responsive layout with a draggable budget sheet on smaller screens.
- **Local-First Persistence:** Game and kingdom metadata are saved in `localStorage`.

## Tech Stack

- **React 18** + **Vite**
- **Three.js** for voxel-style 3D scene rendering
- **Zustand** for game/budget state management and persistence middleware
- **Web Audio API** for procedural synth effects
- **Tailwind CSS** + custom styles for UI and responsive behavior
- **localStorage** for no-backend persistence

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

## How to Play

1. Start onboarding and name your kingdom.
2. Enter your monthly income.
3. Add your recurring bills (each becomes a monster).
4. Trigger payday to start combat.
5. Defeat monsters, gain XP, level up, and grow your island.
6. Capture and share your kingdom progress.

### Quick Tips

- More bills create harder fights.
- A stronger surplus makes progression smoother.
- Consistent monthly wins unlock deeper island progression and better armor tiers.

## Architecture

### Core UI / Scene

- `src/App.jsx` - app shell, onboarding state, desktop/mobile layout orchestration
- `src/components/scene/IslandScene.jsx` - Three.js scene, rendering, effects, battle animation pipeline
- `src/components/ui/BudgetPanel.jsx` - income and bills management UI
- `src/components/ui/HUD.jsx` - level/XP overlay, actions, capture + settings controls
- `src/components/ui/CaptureButton.jsx` - screenshot capture modal and sharing actions
- `src/components/ui/KingdomSetup.jsx` - kingdom name/banner setup and edit flow
- `src/components/onboarding/OnboardingFlow.jsx` - first-time guided onboarding sequence

### State Stores (Zustand)

- `src/store/budgetStore.js` - budget data, payday history, kingdom metadata
- `src/store/gameStore.js` - progression, XP/levels, island stage, battle flow state

### Utilities

- `src/utils/budgetSceneBuilder.js` - builds bill entities and staged island growth content
- `src/utils/voxelBuilder.js` - low-level voxel primitives and composite builders
- `src/utils/heroBuilder.js` - hero appearance and armor-tier visuals
- `src/utils/soundManager.js` - procedural sound engine, mute state, gesture unlock
- `src/utils/screenshotCapture.js` - scene capture pipeline for shareable screenshots
- `src/utils/kingdomTheme.js` - kingdom banner and theme color helpers

## Roadmap

### Completed (MVP)

- Core budget-to-battle loop
- Voxel island rendering and progression
- Hero battles and combat feedback
- Onboarding + kingdom naming
- Screenshot/share support
- Mobile-responsive layout
- Persistent local save

### Coming Soon

- Deeper monster variety by bill category
- Achievement system and progression milestones
- Expanded camera controls
- Richer settings panel
- Optional cloud save
- Seasonal island themes

### Future Vision

- Friend kingdom visits
- Social challenges and leaderboards
- More visual customization packs
- Mobile app adaptation

## Privacy

**No account required. No backend required.**

All gameplay data is stored locally in your browser using `localStorage`. Nothing is uploaded by default.

## Known Issues

- Camera orbit range is currently constrained and will be expanded in a follow-up patch.
- Some native share features vary by browser/device and may fall back to download.
- Settings experience is functional but still evolving.

## Built With

- Built by **Dan (Beefy Dan)** with **Bernie (AI coding partner)**.
- Created with React, Three.js, Zustand, Vite, and a lot of budget-fueled kingdom energy.

---

Ready to turn your monthly bills into boss fights.
