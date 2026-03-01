# Day 5 Tickets: Shareability & Identity

## TICKET 13: PK-013 — Screenshot & Share System

Create src/components/ui/CaptureButton.jsx and src/utils/screenshotCapture.js.

Core feature: "📸 Capture Kingdom" button in HUD (top-right, near mute button).

Workflow:
1. User clicks button
2. HUD disappears (pointer events disabled)
3. Three.js scene re-renders at 2x resolution (1920x1080 → 3840x2160)
4. Scene snapshot captured via `renderer.domElement.toDataURL('image/png')`
5. Canvas 2D overlay created with banner at bottom
6. Final image composited (scene + banner)
7. User presented with download/copy/share options

Banner design (at bottom of screenshot):
```
┌────────────────────────────────────┐
│ 🏰 My Payday Kingdom              │
│ Lv.5 Knight · Month 5 · $12k Saved │
│ paydaykingdom.app                  │
└────────────────────────────────────┘
```

Banner includes:
- Kingdom name (from budgetStore.kingdomName, or "My Payday Kingdom" default)
- Hero level + armor tier name (from gameStore.level, gameStore.armorTier)
- Current month (from gameStore.monthsCompleted)
- Total saved (sum of budgetStore.history[].surplus)
- App URL (paydaykingdom.app or vercel deploy URL)

After capture, show three options:
```
[📥 Download PNG] [📋 Copy to Clipboard] [🔗 Share to Social]
```

Implementation:
- `screenshotCapture.js`: captureScreenshot(renderer, scene, gameState, budgetState) → returns canvas with scene + banner
- `CaptureButton.jsx`: Render button in HUD, handle click → capture → show share modal
- Use `navigator.clipboard.writeImage()` for copy
- Use Web Share API (`navigator.share()`) for social sharing (mobile), graceful fallback on desktop
- Mobile: opens native share sheet (WhatsApp, Twitter, Instagram, Messages, etc.)
- Desktop: fallback to download + "copy to clipboard" message

Acceptance:
- One-click capture
- Image quality at 2x resolution
- Banner is clean and readable
- Download works on all browsers
- Copy to clipboard works (desktop)
- Share API works (mobile) with fallback
- Capturing doesn't visibly disrupt the scene (fast enough)
- HUD reappears after capture

---

## TICKET 14: PK-014 — Kingdom Naming & Customization

Create src/components/ui/KingdomSetup.jsx and update budgetStore with kingdom metadata.

Add to budgetStore state:
```javascript
{
  kingdomName: 'My Payday Kingdom', // User-entered name
  bannerColor: 'gold', // Selected from palette
  // ... existing budget state
}
```

First-time experience (localStorage check):
- On first visit, show "Name Your Kingdom" modal before anything else
- Modal has:
  - Text input: placeholder "e.g., Fort Savings, Castle Coinsworth, Wealth's Keep"
  - 6 color options: red, blue, green, purple, gold, black (swatches)
  - [Create Kingdom] button (disabled until name entered)

After setup:
- Kingdom name persists to localStorage
- Name appears in HUD header (replaces generic "Payday Kingdom")
- Name appears in screenshot banner
- Flag object appears on island at center-top with selected color (thin voxel pole + color square)

Settings menu (gear icon in HUD):
- Can re-open "Edit Kingdom" panel
- Change name
- Change banner color
- [Save] [Cancel]

Implementation:
- Add `setKingdomName(name)` and `setBannerColor(color)` actions to budgetStore
- Create KingdomSetup modal component
- Persist state to localStorage (key: 'payday-kingdom-kingdom')
- On scene load, if kingdomName changes, update flag object color and rebuild it
- Use voxelBuilder.js createVoxel() to create flag (pole + square color block)

Acceptance:
- First-time user sees naming modal
- Name persists across page reloads
- Name appears in HUD and screenshots
- Flag appears on island with chosen color
- Can edit name/color from settings
- Both persist to localStorage
- Visual feedback when settings saved

---

## TICKET 15: PK-015 — Onboarding Flow

Create src/components/onboarding/OnboardingFlow.jsx with 5-screen cinematic flow.

Screens (full-screen dark overlay, centered content, fade transitions between screens):

**Screen 1: Welcome**
```
Welcome, Brave Soul.

In Payday Kingdom, your financial discipline
builds a thriving world.

Turn boring bills into epic battles.
Watch your kingdom grow.

Every payday is a chance to level up.

[Begin Your Journey →]
```

**Screen 2: Name Your Kingdom**
```
What is your kingdom called?

[Text Input: "My Payday Kingdom"]

[6 Color Swatches: red blue green purple gold black]

[Continue →]
```

**Screen 3: Set Your Income**
```
How much treasure arrives each month?

Enter your monthly income

[$ Input: "3000"]

[Continue →]
```

**Screen 4: Add Your Monsters**
```
What monsters threaten your realm?

Add your monthly bills. At least one required.

[Bill Entry Form]
Name: [text]
Amount: [$ number]
Category: [select: housing/utilities/phone/transport/food/entertainment/other]
[+ Add Another Monster]

[Forge My Kingdom →] (enabled only if 1+ bills)
```

**Screen 5: Reveal**
```
[Camera animated zoom: far away → island in view]

Your Kingdom Awaits.

[Animation plays: island appears, monsters spawn on it]

[Ready for Payday? ⚔️]
```

Styling:
- Full-screen dark overlay (rgba(0,0,0,0.9))
- Centered white text, pixel font for headings
- Smooth fade transitions between screens (0.5s)
- Background: subtle floating voxel cubes animation (small boxes drifting slowly)
- Button focus states (slight glow)
- Mobile-friendly: full height, proper keyboard handling

Implementation:
- Create OnboardingFlow component
- Track step in local state (0-4)
- Check localStorage for 'payday-kingdom-onboarding-complete' flag
- If not present, show flow before main app
- After Screen 5, set flag and show main app
- All form inputs wire directly to budgetStore/gameStore
- Screen 5 transition shows actual 3D scene (not a mockup)

Acceptance:
- Flow appears only on first visit
- Each step validates before allowing next
- Data flows correctly into stores
- Screen 5 transitions smoothly to main app
- Returning users skip flow (check localStorage flag)
- Can re-trigger flow from settings (optional skip link)
- Mobile responsive

---

## Acceptance Criteria (All Day 5 Tickets)

1. **PK-013:** Screenshot captures at 2x resolution, banner renders cleanly, download/copy/share all work, capture is fast (<1s)
2. **PK-014:** Kingdom naming modal on first visit, name persists, appears in HUD/screenshots, flag appears on island, settings menu lets you edit
3. **PK-015:** 5-screen onboarding flow appears on first visit only, all data validates, Screen 5 transitions to main app smoothly, returning users see main app directly

**Critical test:**
- Fresh user: see onboarding → name kingdom "Fort Awesome" + pick gold banner → set income \$4500 → add 5 bills → see flag appear on island → trigger payday → screenshot shows kingdom name in banner → share screenshot

Commit work to git when complete.

---

## Why Day 5 Matters

These three tickets are about **ownership & virality**:
- Naming kingdom = emotional investment (now it's *theirs*)
- Screenshot/share = organic growth loop (they show friends)
- Onboarding = frictionless first experience (no confusion)

Together, they transform it from "cool app" to "thing people brag about."
