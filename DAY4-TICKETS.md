# Day 4 Tickets: Polish, Audio, HUD, Mobile

## TICKET 10: PK-010 — Sound Effects & Audio Feedback

Create src/utils/soundManager.js with Tone.js-based procedural sound generation.

No audio files needed — all synth-based, 8-bit/retro vibe.

Sound events to implement:
```
bill_add: Rising pitch "blip" (100 → 400 Hz, 0.1s, sine wave, soft attack/release)
bill_remove: Falling pitch "bloop" (400 → 100 Hz, 0.1s, sine wave)
payday_start: Trumpet fanfare (3 ascending notes: A4, C#5, E5, 0.2s each, slight reverb)
hero_spawn: Impact thud (80 Hz, 0.3s, square wave, sharp attack) + sparkle (high chirp 800→1200 Hz, 0.2s)
monster_slay: Slash sound (white noise sweep 2000→500 Hz, 0.15s) + explosion pop (low 50 Hz pulse, 0.1s)
xp_tick: Rapid coin-like "ding" (600 Hz, 0.05s, repeats 3x with 0.1s gap between)
level_up: Ascending arpeggio (C5, E5, G5, C6, 0.15s each, sine wave, smooth)
victory: Triumphant 4-note melody (E5, G5, B5, E6, 0.3s each, sine wave with slight tremolo)
island_grow: Magical shimmer (rising pink noise 200→800 Hz filtered, 0.4s, soft volume)
```

Implementation:
- Create SoundManager class with methods: playBillAdd(), playBillRemove(), playPaydayStart(), playHeroSpawn(), playMonsterSlay(), playXPTick(), playLevelUp(), playVictory(), playIslandGrow()
- Add global mute toggle (stored in localStorage, key: 'payday-kingdom-sound-muted')
- All sounds should be quiet enough not to startle (volume: 0.3-0.5)
- Wait for first user interaction before playing sounds (browser autoplay policy)
- Use Tone.js Synth for melodic sounds, Noise for atmospheric sounds
- Each sound should fire at the exact moment the visual event happens (hero_spawn when hero appears, monster_slay when monster explodes, etc.)

Wire into IslandScene & BudgetPanel:
- Import SoundManager
- Call playBillAdd() when bill added
- Call playBillRemove() when bill removed
- Call playPaydayStart() when payday button clicked
- Call playHeroSpawn() when hero spawns in battle
- Call playMonsterSlay() for each monster death
- Call playXPTick() as XP counter ticks up
- Call playLevelUp() when level up happens
- Call playVictory() when battle victory sequence starts
- Call playIslandGrow() when new island objects scale in

Add mute button in HUD (🔊/🔇 toggle, top-right corner, persists setting).

---

## TICKET 11: PK-011 — HUD & Stats Overlay

Create src/components/ui/HUD.jsx — overlay on top of the 3D scene.

Layout (positioned absolute, pointer-events: none except for buttons):

**Top-Left Corner:**
```
⚔️ Lv.3 Soldier
XP: 4,200/6,000
████████████░░░░░░░ 70%
```

**Bottom-Left Corner:**
```
🏰 Village (Stage 3)
Month #3
Bills Slain: 12
Total Saved: $8,280
```

**Top-Right Corner:**
```
[🔊] [⚙️ Settings]
```

**Center (during/after battle - temporary overlays):**
```
PAYDAY COMPLETE!
(appears after victory sequence, fades after 2s)

LEVEL UP!
(appears when level-up happens)
```

Styling:
- Semi-transparent dark background (rgba(0,0,0,0.5)) on text sections
- Pixel font for level/title text (use existing 'Press Start 2P' or monospace fallback)
- Clean sans-serif for numbers
- XP bar: gradient fill (green → gold as it fills)
- Color-coded: level name matches armor tier (bronze for Soldier, silver for Knight, etc.)
- Minimal — doesn't block island or controls
- Smooth fade-in/out for temporary messages
- pointer-events: none on the whole HUD, except buttons (mute, settings) which have pointer-events: auto

Data to display:
- Level (from gameStore.level)
- Armor tier name (from gameStore.armorTier, humanized: "Peasant", "Recruit", "Soldier", "Knight", "Champion", "Legend")
- Current XP / Next level XP (gameStore.xp, nextLevelXP computed value)
- XP progress bar (xpProgress percentage)
- Island stage (gameStore.islandStage, humanized: "Barren", "Sprout", "Settlement", "Village", "Town", "Castle", "Kingdom")
- Month number (gameStore.monthsCompleted)
- Total bills slain (gameStore.totalBillsSlain)
- Total surplus saved (sum of all budgetStore.history[].surplus)

The HUD should update reactively as stores change (no polling, just re-render when state updates).

---

## TICKET 12: PK-012 — Responsive Layout & Mobile Optimization

Update src/App.jsx and related components for mobile-first responsive design.

**Desktop Layout (>768px):**
```
┌─────────────────────┬──────────────────────────┐
│                     │                          │
│  Budget Panel       │  3D Island Scene         │
│  (40vw width)       │  (60vw width)            │
│                     │  + HUD overlay           │
│                     │                          │
└─────────────────────┴──────────────────────────┘
```

**Mobile Layout (<768px):**
```
┌──────────────────────────┐
│  3D Island Scene         │
│  (full width, 60vh)      │
│  + HUD overlay           │
│                          │
├──────────────────────────┤
│ Budget Panel (bottom)    │
│ (draggable sheet, 40vh)  │
│ [⚔️ TRIGGER PAYDAY]      │
│                          │
└──────────────────────────┘
```

Changes:
- Update App.jsx: flex-col on mobile, flex-row on desktop
- Budget panel: fixed 40vw on desktop, becomes bottom sheet on mobile
- IslandScene: 60vw width on desktop, full width on mobile
- Island scene height: auto-fill on desktop, 60vh on mobile

Mobile-specific tweaks:
- TouchEvent handling for orbit controls (single finger rotation, pinch zoom)
- Bottom sheet should be draggable (swipe up/down to expand/collapse)
- Payday button should remain visible without scrolling
- Input fields: use appropriate mobile keyboards (number input for amounts, text for names)
- Touch targets: minimum 44px height for buttons
- Prevent horizontal scroll on any viewport
- Scene responsive to container resize (auto-scales when sheet drags)

Test scenarios:
- 375px width (mobile)
- 768px width (tablet breakpoint)
- 1920px width (desktop)
- Landscape orientation
- Touch-based orbit controls
- Bottom sheet expand/collapse

CSS approach:
- Use Tailwind breakpoints (md: for 768px, sm: for 640px)
- Add custom breakpoints if needed in tailwind.config.js
- Use max-w, w-full strategically
- Flexbox for responsive stacking

---

## Acceptance Criteria (All Day 4 Tickets)

1. **PK-010:** All 8 sounds play at correct moments, sound is not too loud, mute toggle works and persists, first interaction triggers audio context
2. **PK-011:** HUD displays all requested stats reactively, XP bar fills correctly, level-up/payday messages appear and fade, layout doesn't block scene
3. **PK-012:** Layout switches seamlessly at 768px breakpoint, mobile bottom sheet works, touch controls responsive, no horizontal scroll, all buttons/inputs accessible on touch

**Critical test:**
- Desktop: Enter income + 5 bills → Trigger payday → Hear battle sounds → See XP bar fill → See level-up message → Island grows → HUD updates all stats
- Mobile (375px): Same flow, but with bottom sheet expanded/collapsed, touch orbit works
- Mute toggle: Toggle sound on/off, verify localStorage persists setting across page reload

Commit work to git when complete.

---

## Implementation Notes

**Sound priorities:**
- hero_spawn is the most important (catches attention when hero appears)
- monster_slay should feel satisfying (gives feedback for each kill)
- level_up should feel rewarding (celebratory)

**HUD priorities:**
- XP bar must be visible and filling (immediate feedback)
- Level/armor tier must be readable (player progress tracking)
- Mute button must be accessible (respect user's audio preferences)

**Mobile priorities:**
- Bottom sheet should not obscure payday button
- Touch orbit should feel responsive (not laggy)
- Scene should render crisply on retina displays

---

## Polish Notes for Future

These tickets focus on *functional* audio/UI/mobile. Aesthetic polish (sound design, color tweaks, animations) can happen after launch if needed.
