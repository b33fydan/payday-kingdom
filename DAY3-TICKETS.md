# Day 3 Tickets: Hero & Battle System

## TICKET 7: PK-007 — Hero Character & Leveling

Create src/store/gameStore.js with Zustand state for game progression.

State shape:
```javascript
{
  level: 1,
  xp: 0,
  totalBillsSlain: 0,
  heroVisible: false,
  heroPosition: { x: 0, z: 0 },
  armorTier: 'peasant', // computed from level
  monthsCompleted: 0,
}
```

Level progression:
```
Level 1 (Month 0): Peasant - brown tunic, minimal body, no weapon
Level 2 (Month 1): Recruit - leather armor, wooden sword  
Level 3 (Month 2): Soldier - bronze armor, iron sword
Level 5 (Month 4): Knight - silver armor, steel sword, shield
Level 8 (Month 7): Champion - gold armor, flame sword, shield, cape
Level 12 (Month 11): Legend - diamond armor, lightning sword, wings
```

Actions:
- addXP(amount) - adds XP, checks level thresholds (1000, 3000, 6000, 10000, 20000, 50000)
- levelUp() - increments level, triggers armor tier change
- incrementMonthsCompleted() - called on each payday
- setHeroVisible(bool) - shows/hides hero
- resetXP() - after level up, optionally reset XP

Computed values:
- armorTier - determined from level (see progression above)
- nextLevelXP - calculates XP needed for next level
- xpProgress - percentage toward next level (0-100)

Persist to localStorage with key 'payday-kingdom-game'.

Create src/utils/heroBuilder.js with functions:
- createHero(x, z, armorTier) - returns a Group with hero voxel character
  - Different colors for each armor tier: peasant (brown #7a4a24), recruit (leather #8b6f47), soldier (bronze #cd7f32), knight (silver #c0c0c0), champion (gold #d4af37), legend (diamond #e0e7ff)
  - ~3-5 cubes tall (body, head, limbs)
  - Add sword (thin tall voxel in hand)
  - For levels 5+: add shield (medium voxel at side)
  - For level 8+: add cape (extended cubes behind body)
  - For level 12: add wings (two pyramid-ish shapes at shoulders)

---

## TICKET 8: PK-008 — Battle Animation Sequence (CORE EXPERIENCE)

Update src/components/scene/IslandScene.jsx to add battle animation.

Trigger: When user clicks "Trigger Payday" button in BudgetPanel, dispatch action to gameStore that starts battle.

Battle sequence (use requestAnimationFrame for smooth animation):

```
PHASE 1: HERO SPAWN (0.5s)
- Hero instantiates at (0, -2, 0) (off-screen below)
- Animate hero Y position from -2 to 0.5 over 0.5s (easeOut)
- At landing, trigger small particle burst (5-10 white voxels scatter outward with velocity)
- Hold pose for 0.2s

PHASE 2: BATTLE (0.5s per monster)
- For each bill/monster on scene:
  - Hero slides horizontally toward monster (animate hero X/Z position)
  - Hero rotates 360° around Y axis (sword slash animation)
  - Monster flashes white (material.emissive = 0xffffff for 0.1s)
  - Monster explodes into particles (break into 3-5 colored cubes, scatter with gravity)
  - Float text "+$BILLamount" up from monster position (HTML overlay)
  - XP counter ticks up in the HUD (visual counter tick: xp += billAmount over 0.3s)
  - Hero moves to next monster, repeat

PHASE 3: VICTORY (1s)
- All monsters gone
- Hero returns to center (0, 0.5, 0)
- Hero plays victory pose (jump: Y position += 1.5, then fall back down over 0.5s)
- Screen flash (brief white overlay, 0.1s)
- "PAYDAY COMPLETE!" text appears centered on screen (HTML overlay, fade in)
- XP bar fills up visually (animate xpProgress from current to new value over 0.5s)
- Check if levelUp triggered:
  - If yes: proceed to PHASE 4
  - If no: fade out battle UI after 1s, cleanup

PHASE 4: LEVEL UP (if applicable, 1.5s)
- Screen flash (bright 0.2s)
- Hero armor color transforms (material.color animates to new tier color)
- Particle burst around hero (gold particles)
- "LEVEL UP!" text appears, animated scale (start small, grow to 1.5x, then fade)
- Display new armor tier name ("You are now a Knight!")
- Hero holds pose for 1s
- Fade out, cleanup

Animation helpers:
- Use simple lerp function: lerp(start, end, t) where t goes 0→1
- Particle system: array of simple Box meshes with velocity {x, y, z} and gravity (y -= 0.1 per frame)
- Use requestAnimationFrame loop inside battle() function, track time elapsed
- Text overlays: create with HTML positioned absolutely, not 3D text (crisper, faster)
```

Implementation notes:
- BudgetPanel "TRIGGER PAYDAY" button should dispatch action:
  - Get all bills from budgetStore
  - Call startBattle(bills) in IslandScene
  - Disable button during battle (re-enable after VICTORY phase)
  - After victory, call:
    - budgetStore.triggerPayday() - resets bills, marks as paid
    - gameStore.addXP(totalBillsAmount) - accumulates XP
    - gameStore.incrementMonthsCompleted()
    - Check gameStore.levelUp() if threshold crossed

- Scene must track:
  - isInBattle (boolean)
  - battleAnimation (active animation state)
  - Do NOT accept new payday triggers while isInBattle = true

---

## TICKET 9: PK-009 — Island Growth System

Update budgetSceneBuilder.js (or create new file) to add island evolution based on monthsCompleted.

Island stages (cumulative, additive):

```
Stage 0 (Start): Barren
- Just grass platform (already exists)
- Maybe 1 dead gray tree

Stage 1 (After 1st Payday): Sprout
- 2-3 small pine trees appear (green)
- 4-6 colored voxel flowers scattered (bright colors: yellow, pink, red)

Stage 2 (After 2nd Payday): Settlement
- Small hut appears (wooden, ~3x3x2, brown)
- More trees (5 total scattered)
- Stone path (3-5 voxels in a line from center outward)

Stage 3 (After 3rd Payday): Village
- Hut upgrades: becomes a house (larger, added roof peak)
- Well appears (stone circle with wooden roof, center of island)
- Garden beds (3-4 green boxes arranged)
- More flowers scattered

Stage 4 (After 5th Payday): Town
- Second building appears (warehouse-like, stone gray)
- Fence (small voxel boxes in a perimeter, wooden color)
- Pond (blue voxel square, sunken into ground)
- Paths between buildings

Stage 5 (After 8th Payday): Castle
- Main house becomes castle tower (taller, added battlements top)
- Stone walls appear around perimeter
- Tower flag (thin voxel + gold square at top)
- Bridge over pond
- More elaborate garden

Stage 6 (After 12th Payday): Kingdom
- Full castle (tower + walls + courtyard)
- Fountain (white/blue stone tower in center with water)
- Multiple smaller buildings (smithy, market stalls)
- Forest of trees (8-10 scattered)
- Completed walls with gate
- Clouds floating above (white voxel groups, moving slowly)
- Flags on towers (gold/colored squares)
```

Implementation:
- Add `islandStage` to gameStore (computed from monthsCompleted)
- Create buildIslandStage(scene, stage) function that adds objects for that stage
- When islandStage increases, call buildIslandStage() to ADD new objects
- Each added object animates in: scale from 0 to 1 over 0.5s (using tween/lerp)
- DO NOT remove old objects (growth is additive)
- Call islandStage rebuild after each payday battle victory

Testing:
- Simulate progression: start at stage 0, trigger payday → stage 1 (trees/flowers appear), repeat 5+ times
- Verify each stage adds distinct visual elements
- Verify scale-in animation is smooth
- Verify progression from "barren" to "thriving kingdom" is emotionally rewarding

---

## Acceptance Criteria (All Day 3 Tickets)

1. **PK-007**: Hero character renders with correct armor tier for current level, XP accumulates, level thresholds work, localStorage persists
2. **PK-008**: Battle plays smoothly, hero spawns → fights each monster → victory sequence plays, XP ticks up visually, level up triggers correctly, button disabled during battle
3. **PK-009**: Island evolves visually from barren → thriving at each payday, objects scale in smoothly, cumulative growth creates sense of progression

**Critical test**: Trigger payday 6+ times with test bills ($1200, $150, $85, $200):
- Hero spawns and fights monsters ✓
- Island grows noticeably after each payday ✓
- Level up happens (should hit level 2-3 after 6 paydays) ✓
- Battle feels satisfying and rewarding ✓

Commit all work to git when complete.
