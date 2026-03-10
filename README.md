# 🏝️ AgentVille

**Island Overseer Edition**

You inherited a pixel-perfect island farm. You hired opinionated AI agents to run it. They harvest autonomously, judge your decisions, and occasionally unionize to burn it all down. Each week you sell the harvest — profit makes you a hero, loss gets you roasted publicly.

**AgentVille isn't farming. It's being fired by your own employees.**

## What Is This?

AgentVille is a browser-based AI management sim where:

- You assign 3 opinionated agents to island zones (forest, plains, wetlands)
- Each day brings 2 crisis events that test your management decisions
- Agents develop morale based on your choices, zone fit, and neglect
- Weekly seasons end with a Sale Day where agents publicly roast or praise your performance
- 0.001% chance: agents unionize, burn the farm, and hit you with a shareable violation report

Think *Papers, Please* energy meets *Stardew Valley* aesthetics with AI personalities that have opinions.

## Features

- **3D Isometric Island** (Three.js voxel renderer, forked from Payday Kingdom)
- **Agent Personalities** (LLM-driven traits: work ethic, risk, loyalty, specialization)
- **Crisis Events** (20+ dynamic scenarios with visible tradeoffs)
- **Weekly Season Loop** (7 days of survival, Sale Day settlement, agent reviews)
- **Morale System** (affects agent efficiency, tone, and riot risk)
- **LLM Integration** (Claude Haiku/Sonnet for agent feedback and crisis narratives)
- **Riot Mechanic** (legendary failure state with shareable ACA violation report)
- **Screenshot & Share** (island snapshots, season reviews, agent quote cards, riot roasts)
- **Local-First** (no accounts, no backend, all state in localStorage)

## Tech Stack

- **React 18** + **Vite**
- **Three.js** for voxel-style 3D island rendering
- **Zustand** for game state (agents, resources, morale, season)
- **Tailwind CSS** for responsive UI (dark theme, terminal aesthetic)
- **Claude API** (Haiku for feedback, Sonnet for reviews/riots)
- **Canvas 2D** for shareable card generation
- **Tone.js** for procedural retro SFX
- **localStorage** for persistence

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- (Optional) Claude API key for LLM features

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

1. Name your island and meet your 3 agents.
2. Assign agents to zones (forest, plains, wetlands).
3. Each day: read agent reports, make crisis decisions, watch morale shift.
4. By Day 6, optimize for the final profit push.
5. **Sale Day (Day 7):** Harvest sold → Agents review your management → Season resets.
6. If morale + decisions align poorly: **0.001% chance of RIOT** 🔥

### Quick Tips

- Keep agent morale above 50% or they get salty.
- Crisis decisions have tradeoffs — you can't please everyone.
- Ignoring crises tanks morale faster than wrong choices.
- Great seasons earn agent loyalty; repeated losses force you to hire new staff.

## Architecture

### Core UI / Scene

- `src/App.jsx` - app shell, season flow, desktop/mobile layout
- `src/components/scene/IslandScene.jsx` - Three.js scene, island rendering, agent positions
- `src/components/ui/AgentPanel.jsx` - agent cards, morale bars, zone assignments
- `src/components/ui/FieldLog.jsx` - scrollable agent commentary and status feed
- `src/components/ui/CrisisModal.jsx` - crisis event presentation and decision handling
- `src/components/ui/SaleDay.jsx` - animated harvest sequence, profit tally, agent reviews
- `src/components/onboarding/OnboardingFlow.jsx` - island naming, agent intro

### State Stores (Zustand)

- `src/store/agentStore.js` - agents[], morale{}, resources{}, season state, decisions log
- `src/store/crisisStore.js` - active crisis, templates, LLM enrichment

### Utilities

- `src/utils/voxelBuilder.js` - voxel primitives + terrain types (forest/plains/wetlands)
- `src/utils/agentBuilder.js` - agent appearance, personality trait visuals
- `src/utils/terrainBuilder.js` - terrain generation, biome coloring, crop/structure placement
- `src/utils/crisisEngine.js` - crisis template library, state-aware generation, LLM calls
- `src/utils/llmManager.js` - Claude API integration, rate limiting, template fallback
- `src/utils/screenshotCapture.js` - island snapshots, season result cards, roast reports
- `src/utils/soundManager.js` - procedural SFX for crisis outcomes, harvest, riot
- `src/utils/constants.js` - game config, morale thresholds, profit tiers, VOXEL_SCALE

## Roadmap

### MVP (Phase 1, 7 Days)

- [x] Fork PK codebase, strip budget logic
- [ ] Agent system + personality traits + morale
- [ ] Crisis engine + 20 hardcoded templates
- [ ] Season loop + Sale Day animated sequence
- [ ] Riot mechanic + shareable ACA report
- [ ] LLM integration (Haiku for feedback, Sonnet for reviews)
- [ ] Field Log + agent commentary
- [ ] 4 shareable asset types (island, review card, riot roast, quote cards)
- [ ] Onboarding + landing page
- [ ] Responsive layout + mobile touch controls

### Phase 2 (Future)

- Real-time passive harvesting + background workers
- Agent hiring/firing + roster evolution
- More terrain types (rocky, volcanic)
- Cross-game cosmetics with Payday Kingdom
- Shared engine extraction (`@skyframe/voxel-engine`)
- Backend + accounts + leaderboards
- Mobile app version

## Privacy

**No account required. No backend required.**

All gameplay data is stored locally in your browser using `localStorage`. Screenshots are generated client-side.

LLM calls (Claude API) are opt-in and configurable. If no API key is set, the game plays beautifully with template-based agent feedback.

## Known Limitations

- MVP uses manual day advance (button click = next day). Real-time passive generation comes in Phase 2.
- Terrain grid is currently placeholder. Terrain type rendering and crop placement are Day 2-3 work.
- LLM features gracefully degrade to templates if API unavailable or rate-limited.

## Built With

- Forked from **Payday Kingdom** (same voxel engine, visual language, sharing pipeline)
- Built by **Dan (Beefy Dan)** and **Bernie** with **Codex** (GPT-5.3-codex)
- Powered by React, Three.js, Zustand, Claude API, and the sweet schadenfreude of AI feedback

---

**Watch your agents judge you. Every week. Without mercy.**

Deployed at: `https://agentville.app` (coming soon)
