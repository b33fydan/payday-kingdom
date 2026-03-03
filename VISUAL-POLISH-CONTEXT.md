# Visual Polish Build Context

You are transforming Payday Kingdom from Minecraft-blocky to dense voxel art diorama.

## Current State

**Live app:** https://payday-kingdom.vercel.app

**What works:**
- Core game loop (income → bills → payday → hero fights → island grows)
- Onboarding, kingdom naming, screenshot/share
- All critical bugs fixed
- Mobile responsive
- 60fps stable

**What needs polish:**
- Camera feels constrained (zoom limited, rotation restricted)
- Voxels are too large/sparse (island looks blocky, not detailed)
- Structures look Minecraft-y, not handcrafted
- Island gets crowded at high levels (needs visual management)

**Target aesthetic:** Dense voxel diorama miniature. Think "floating island in a terrarium case" — small, intricate, lots of detail, organic.

---

## Key Constants & Files

**Work in:**
- `src/components/scene/IslandScene.jsx` — camera, Three.js setup
- `src/utils/voxelBuilder.js` — all voxel shape creation
- `src/utils/budgetSceneBuilder.js` — island stage building

**Existing color palettes:** COLORS, BILL_CATEGORY_COLORS, KINGDOM_COLOR_OPTIONS (don't change)

**Current voxel sizes:** base unit 1.0, various shapes (trees 3 cubes, structures 2-4 cubes). Will be 0.4x after polish.

---

## Build Checklist (In Order)

### STEP 1: Camera Controls (5 min)
**File:** `src/components/scene/IslandScene.jsx`

OrbitControls changes:
```javascript
minDistance: 4,    // closer zoom
maxDistance: 20,   // farther zoom
minPolarAngle: 0.1,           // allow nearly top-down
maxPolarAngle: Math.PI / 2.1, // allow near-horizontal
minAzimuthAngle: -Infinity,   // full 360° horizontal
maxAzimuthAngle: Infinity,
```

Test: Can zoom close to see voxels, zoom out to see island + water, rotate full circle.

---

### STEP 2: Global Voxel Scale (5 min)
**File:** `src/utils/voxelBuilder.js`

Create global constant at top:
```javascript
export const VOXEL_SIZE = 0.4;
export const VOXEL_HALF = 0.2; // for ground tiles (half height)
```

Update all BoxGeometry calls:
- Individual voxels: BoxGeometry(0.4, 0.4, 0.4) instead of (1, 1, 1)
- Ground tiles: BoxGeometry(0.4, 0.2, 0.4) instead of (1, 0.5, 1)
- Use VOXEL_SIZE constant everywhere for consistency

This is a global find-replace essentially. Look for BoxGeometry calls and apply the scale.

---

### STEP 3: Ground Platform Rebuild (10 min)
**File:** `src/utils/budgetSceneBuilder.js`

The ground-building function needs changes:

**Grid expansion:**
- Old: 8×8 grid of 1.0 cubes
- New: 20×20 grid of 0.4 cubes (same 8-unit footprint, 2.5x more cubes)

**Elevation:**
- Random Y variation reduced: 0 to 0.08 (was 0 to 0.3)

**Color variation:**
- Each ground cube picks randomly from COLORS.grass array (instead of same color)

**Cliff edges (the visual wow factor):**
- At island perimeter (outermost ring of ground cubes):
  - Layer 1 (main ground): Y = 0, grass green
  - Layer 2 (edge drop): Y = -0.2, darker green (#4b7335)
  - Layer 3 (dirt): Y = -0.4, brown (#92400e)
  - Layer 4 (stone): Y = -0.6, gray (#6b7280)
- This creates a "floating island with visible earth layers" look

**Result:** Ground should look like a dense, textured platform with visible depth underneath.

---

### STEP 4: Trees (15 min)
**File:** `src/utils/voxelBuilder.js`

Two tree types needed:

**Pine tree (tall, tapered):**
- Trunk: 3-4 stacked brown cubes (0.2×0.4×0.2) at center
- Leaf layers (decreasing width):
  - Bottom: 3×3 grid of green (0.4 each), 3-4 randomly removed for organic look
  - Middle: 2×2 grid, offset up
  - Top: 1 cube
- Total: ~15-20 cubes per tree
- Color: Mix 2-3 shades of green (COLORS.leaf shades) within same tree for depth

**Oak/round tree:**
- Trunk: 2-3 stacked brown cubes (0.3×0.4×0.3)
- Canopy: ~3×3×3 sphere-ish cluster of green cubes
  - Randomly remove 3-4 for organic shape
  - Mix 2 green shades
- Total: ~15 cubes

**Small bush:**
- 3-5 green cubes in low cluster, no trunk
- Mix 2 green shades

**Dead tree (Stage 0 only):**
- Trunk: 3 brown cubes, slightly angled
- 1-2 bare branch cubes
- No leaves

**Integration:** Replace old tree functions with new dense versions. Stage 0 (barren) gets dead trees. Stage 1+ gets alive trees.

---

### STEP 5: Structures (20 min)
**File:** `src/utils/budgetSceneBuilder.js`

**Hut (Stage 2):**
- Walls: 5×5 footprint, 4 cubes tall, light brown (#d4a574)
- Roof: 5×5 base, pitched (pyramid shape), 3 layers stepping inward, dark brown
- Door: 1×2 gap in front wall (don't place cubes there)
- Window: 1×1 gap on side, blue cube behind it (glass effect)

**House (Stage 3):**
- Larger: 7×7 walls, 5 cubes tall
- Pitched roof with overhang (extends 1 cube past walls)
- 2 windows, 1 door
- Chimney: 2×2 stack on roof, 3 cubes tall, dark gray

**Castle Tower (Stage 5):**
- Base: 6×6×8 tall, stone gray (#9ca3af)
- Battlements: top edge has alternating cubes (crenellations)
- Windows: narrow slits (1 wide, 2 tall), 2-3 of them
- Roof: pyramid cap, red/brown
- Flag pole: thin 4-cube stack extending above roof
- Flag: 2×3 grid of cubes in bannerColor, attached to pole
- Vines: 2-3 random green cubes on walls (overgrowth)

**Castle (Stage 6):**
- Main keep: 8×8×10 tall
- Side tower: 4×4×7
- Connecting wall: 1 thick, 3 tall, between them
- Gate: archway opening in main keep
- Torch: orange/yellow cube on wall brackets

---

### STEP 6: Monsters (10 min)
**File:** `src/utils/budgetSceneBuilder.js` and battle system

Scale all monsters to use VOXEL_SIZE (0.4).

**Generic monster structure:**
- Body: 2×2×2 cubes (0.4 each) = 0.8 unit bounding box
- Head: 2×2×2 cubes (0.3 each) = 0.6 unit, on top
- Eyes: 2 white cubes (0.1 each) on front of head
- Total height: ~1.4 units (down from ~2+ units)

**Size scaling with bill amount:**
- < $100: scale 0.5x
- $100-499: scale 0.7x
- $500+: scale 1.0x

**Category accents (keep designs, new scale):**
- Housing: wider body (3×2×2)
- Utilities: 3-4 tiny yellow orbiting cubes (0.1 size)
- Phone: antenna = 3 stacked cubes on head
- Transport: 4 leg cubes at corners
- Food: missing front-bottom head cube (mouth gap)
- Health: lighter color, bobs (Y oscillates)
- Entertainment: 2 angled cubes on head (jester points)
- Other: basic shape, no extras

**Idle bobbing:** Reduce amplitude: 0.1 (was ~0.3)

---

### STEP 7: Hero (10 min)
**File:** `src/utils/heroBuilder.js`

Scale hero to match new voxel density:

- Legs: 2 cubes (0.15×0.3×0.15 each), gap between
- Body: 1 cube (0.4×0.5×0.3), armor color
- Arms: 2 cubes (0.12×0.4×0.12), at sides
- Head: 1 cube (0.3×0.3×0.3), skin color
- Eyes: 2 tiny dark cubes
- Total height: ~1.3 units

**Weapon (level 2+):**
- Sword: thin cube (0.06×0.5×0.06), held to right
- Color: gray (iron) → gold (champion+) → cyan (legend)

**Shield (level 5+):**
- Flat cube (0.05×0.3×0.25), left side
- Color matches armor tier

**Cape (level 8+):**
- 2-3 flat cubes behind body, angled
- Color: darker shade of armor color

---

### STEP 8: Environmental Details (15 min)
**File:** `src/utils/budgetSceneBuilder.js`

**Flowers (Stage 1+):**
- Scatter 8-12 tiny cubes (0.15 size) randomly on surface
- Colors: red (#ef4444), yellow (#fbbf24), pink (#ec4899), white (#ffffff)
- Place on ground tiles that aren't occupied by structures

**Rocks (Stage 0+):**
- 3-5 small gray cube clusters (2-3 cubes each, 0.2 size)
- Scattered at island edges
- Colors: mix of #9ca3af and #6b7280

**Floating Island Underside (the wow factor):**
- Below ground platform, add 3 layers of decreasing footprint:
  - Layer 1 (Y = -0.2 to -0.6): 80% of ground footprint, dirt brown (#92400e)
  - Layer 2 (Y = -0.6 to -1.2): 50% of ground footprint, darker (#6b7280)
  - Layer 3 (Y = -1.2 to -1.8): 20% of ground footprint, stone gray (#4b5563), jagged
- Random cubes removed from edges for organic stalactite look
- Optional: 1-2 tiny vine cubes (green) hanging from bottom

**Clouds (Stage 5+):**
- Cluster of 6-10 white cubes (0.5 size each)
- Arranged in elongated oval
- Float at Y = 6-8
- Very slow drift: X position oscillates over 20-second cycle
- 2-3 cloud clusters at different heights/positions

---

### STEP 9: Lighting (5 min)
**File:** `src/components/scene/IslandScene.jsx`

**Better lighting:**
```javascript
// AmbientLight
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient);

// DirectionalLight (for shadows)
const directional = new THREE.DirectionalLight(0xffffff, 0.7);
directional.position.set(8, 12, 4);
directional.castShadow = true;
directional.shadow.mapSize.width = 1024;
directional.shadow.mapSize.height = 1024;
directional.shadow.camera.left = -15;
directional.shadow.camera.right = 15;
directional.shadow.camera.top = 15;
directional.shadow.camera.bottom = -15;
scene.add(directional);

// Optional HemisphereLight (subtle sky/ground bounce)
const hemisphere = new THREE.HemisphereLight(0x87CEEB, 0x4a7c4f, 0.3);
scene.add(hemisphere);
```

**Background:**
- Option A: Solid dark (#1a3a2a)
- Option B: Gradient (top #4a8fb5 sky blue, bottom #1a3a2a green) — easier: use linear gradient in CSS on container

**Result:** Warmer, more natural-feeling lighting. Shadows visible but soft.

---

## Performance Considerations

**More cubes = more draw calls**

If FPS drops below 45:

1. **InstancedMesh** (best fix): Ground grid with 20×20 cubes is perfect for InstancedMesh. Render all 400 ground cubes in ONE draw call instead of 400.
   - Create single BoxGeometry(0.4, 0.2, 0.4)
   - Use THREE.InstancedMesh with 400 instances
   - Set transforms for each instance via setMatrixAt()

2. **Merge geometries:** BufferGeometryUtils.mergeGeometries() for static elements (trees, structures)

3. **Reduce grid:** 20×20 → 16×16 if needed

4. **Reduce scatter:** Fewer flowers/rocks

**Monitor:** After each step, test in-browser. Use Chrome DevTools Performance tab (FPS meter). Target: 60 FPS sustained.

---

## Testing After Completion

1. Fresh browser, go to https://payday-kingdom.vercel.app
2. **Camera:** Zoom in close (see voxel cubes), zoom out (see full island), rotate 360°
3. **Ground:** Visible cliff edges on sides, color variation
4. **Trees:** Dense, organic, made of many cubes
5. **Structures:** Details visible (windows, doors, roof pitch)
6. **Monsters:** Scaled down but clearly distinct
7. **Environmental:** Flowers, rocks, clouds visible at appropriate stages
8. **Overall:** "Diorama miniature" feeling, not Minecraft-y
9. **Performance:** 60 FPS on most machines, smooth camera movement
10. **Mobile:** Responsive, no visual glitches

---

## Git Workflow

```bash
git add src/components/scene/IslandScene.jsx src/utils/voxelBuilder.js src/utils/budgetSceneBuilder.js src/utils/heroBuilder.js
git commit -m "feat: Visual polish — dense voxel diorama aesthetic (camera, scale, structures, details, lighting)"
git push origin main
# Vercel auto-deploys
```

---

## Notes

- This is a "visual transformation" — no game logic changes, no bugs
- The target is "pause your scroll and ask 'what IS that?'"
- Each step has incremental visual payoff (do them in order)
- Test in-browser after major steps (ground, trees, structures)
- If performance is good at ~15 FPS buffer, ship it

Total estimate: 1.5 hours Bernie time (including testing + iteration).

---

*Let's make this screenshot-worthy.* 🎨
