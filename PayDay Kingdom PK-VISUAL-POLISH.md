# **🎨 PK-VISUAL-POLISH: Voxel Art Refinement**

### **Priority: HIGH — This is the difference between "cool demo" and "screenshot-worthy"**

**Goal:** Transform the current Minecraft-blocky aesthetic into a dense, detailed voxel diorama style. Think handcrafted miniature world, not block game.

**Reference:** The target aesthetic is a floating island diorama — small, dense voxels creating organic shapes with visible but tiny cube edges. Structures should feel like intricate miniatures, not LEGO builds.

---

## **CHANGE 1: Camera Controls — More Freedom**

### **Zoom Range**

Current zoom feels constrained. Expand it significantly.

// OrbitControls changes:  
minDistance: 4,    // was \~6ish — allow closer inspection of details  
maxDistance: 20,   // was \~12ish — allow pulling way out to see the full island

// This gives roughly 25-30% more range in both directions

### **Rotation**

Remove polar angle restrictions. Let users rotate freely around the island, including looking at it from lower angles (which makes it feel more like a diorama on a table).

// OrbitControls changes:  
minPolarAngle: 0.1,              // allow nearly top-down view  
maxPolarAngle: Math.PI / 2.1,    // allow near-horizontal (but not underneath)  
// Remove any azimuth angle restrictions — full 360° horizontal rotation  
minAzimuthAngle: \-Infinity,  
maxAzimuthAngle: Infinity,

---

## **CHANGE 2: Global Voxel Scale Reduction**

This is the big one. Everything needs to shrink to increase perceived detail density.

### **The Principle**

Instead of a few large cubes, use many smaller cubes. A tree that's currently 3 big blocks becomes 8-12 smaller blocks. Same bounding volume, more detail, more "voxel art" feel.

### **Global Scale Factor**

Apply a **0.4x scale factor** to the base voxel unit size across the entire scene.

// Current base cube: BoxGeometry(1, 0.5, 1\) or BoxGeometry(1, 1, 1\)  
// New base cube:     BoxGeometry(0.4, 0.2, 0.4) for ground tiles  
//                    BoxGeometry(0.4, 0.4, 0.4) for structure/object cubes

const VOXEL\_SIZE \= 0.4;  // Global constant, use everywhere  
const VOXEL\_HALF \= 0.2;  // For ground tiles (half height)

### **Ground Platform**

Before: 8×8 grid of 1.0-unit cubes \= 8 unit span  
After:  20×20 grid of 0.4-unit cubes \= 8 unit span (same footprint, 2.5x more cubes)

\- This alone makes the island look dramatically more detailed  
\- Keep the random Y elevation variation but reduce it: random 0 to 0.08 (was 0 to 0.3)  
\- Add subtle color variation: each ground cube picks randomly from COLORS.grass array  
\- Edge cubes: add 2-3 extra layers that step DOWN (like cliff edges)  
  \- Layer 1 (edge): Y offset \-0.2, darker green  
  \- Layer 2 (below edge): Y offset \-0.4, brown/dirt (\#92400e)  
  \- Layer 3 (bottom): Y offset \-0.6, stone gray (\#6b7280)  
  \- This creates the "floating island with visible earth layers" look from the reference

### **Trees (Critical — these set the whole mood)**

BEFORE (Minecraft style):  
  \- Trunk: 1 brown cube  
  \- Leaves: 1-2 green cubes on top  
  \- Total: 2-3 cubes per tree

AFTER (Voxel art style):  
  Pine tree:  
  \- Trunk: 3-4 stacked cubes (0.2×0.4×0.2), brown  
  \- Leaf layers: 3 tiers of decreasing-width clusters  
    \- Bottom tier: 3×3 grid of green cubes (0.4 each), some randomly removed  
    \- Middle tier: 2×2 grid, offset up  
    \- Top tier: 1 cube, offset up  
  \- Total: \~15-20 cubes per tree  
  \- Color: randomly mix COLORS.leaf shades within each tree

  Oak/round tree:  
  \- Trunk: 2-3 stacked cubes, brown  
  \- Canopy: sphere-ish cluster of 10-15 green cubes in a rough 3×3×3 arrangement  
    \- Randomly remove 3-4 cubes for organic shape  
    \- Mix leaf colors for depth

  Small bush:  
  \- 3-5 green cubes in a low cluster, no trunk  
  \- Mix 2 shades of green

  Dead tree (Stage 0):  
  \- Trunk: 3 brown cubes, slightly angled  
  \- 1-2 bare branch cubes sticking out sideways  
  \- No leaves

### **Structures (Houses, Castle, etc.)**

General principle: multiply detail by 2-3x within same bounding volume.

Hut (Stage 2):  
  BEFORE: 2×2×2 cube block  
  AFTER:  
  \- Walls: 5×5×4 grid of cubes (0.4 size), light brown (\#d4a574)  
  \- Roof: 5×5 pitched shape (pyramid-ish, 3 layers stepping inward), dark brown  
  \- Door: 1×2 gap in front wall (leave cubes out)  
  \- Window: 1×1 gap on side, with a blue cube behind it (glass)

House (Stage 3):  
  \- Larger version of hut: 7×7×5 walls  
  \- Proper pitched roof with overhang (extends 1 cube past walls)  
  \- 2 windows, 1 door  
  \- Chimney: 2×2 stack on roof, 3 cubes tall  
  \- Optional: flower box under window (2-3 tiny colored cubes)

Castle Tower (Stage 5):  
  \- Base: 6×6×8 tall structure, stone gray  
  \- Battlements: top edge has alternating cubes (crenellations)  
  \- Windows: narrow slits (1 cube wide, 2 tall)  
  \- Roof: red/brown pyramid cap  
  \- Flag pole: thin stack of 4 cubes extending above roof  
  \- Flag: 2×3 flat grid of cubes in bannerColor, attached to pole  
  \- Vines: 2-3 green cubes randomly on walls (organic overgrowth)

Castle (Stage 6):  
  \- Main keep: 8×8×10  
  \- Side tower: 4×4×7  
  \- Connecting wall: 1 cube thick, 3 cubes tall, between structures  
  \- Gate: archway shape (remove cubes to form opening)  
  \- Torch: orange/yellow cube on wall brackets

### **Monsters**

Scale everything to use VOXEL\_SIZE (0.4) as base unit.

General monster structure (all categories):  
  \- Body: 2×2×2 cubes (0.4 each) \= 0.8 unit bounding box  
  \- Head: 2×2×2 cubes (0.3 each) \= 0.6 unit bounding box, on top  
  \- Eyes: 2 cubes (0.1 each), white, on front of head  
  \- Total height: \~1.4 units (was \~2+ units)

Size scaling with bill amount:  
  \- Small (\< $100):   overall scale 0.5x  
  \- Medium ($100-499): overall scale 0.7x  
  \- Large ($500+):     overall scale 1.0x

Category accents (keep existing designs but at new scale):  
  \- Housing: extra wide body (3×2×2 instead of 2×2×2)  
  \- Utilities: 3-4 tiny yellow cubes orbiting (0.1 size)  
  \- Phone: antenna \= 3 stacked tiny cubes on head  
  \- Transport: 4 leg cubes at corners  
  \- Food: remove front-bottom head cube (creates mouth gap)  
  \- Health: floats (Y bobs), slightly transparent feel (lighter color)  
  \- Entertainment: 2 angled cubes on head (jester points)  
  \- Other: basic shape, no extras

Idle bobbing: reduce amplitude. Was probably \~0.3, make it 0.1.

### **Hero**

Scale to match new voxel density:  
  \- Legs: 2 cubes (0.15×0.3×0.15 each), with gap  
  \- Body: 1 cube (0.4×0.5×0.3), armor color  
  \- Arms: 2 cubes (0.12×0.4×0.12), at sides  
  \- Head: 1 cube (0.3×0.3×0.3), skin color  
  \- Eyes: 2 tiny cubes, dark  
  \- Total height: \~1.3 units

Weapon (level 2+):  
  \- Sword: thin cube (0.06×0.5×0.06), held to right side  
  \- Color: gray (iron), gold (champion+), cyan (legend)

Shield (level 5+):  
  \- Flat cube (0.05×0.3×0.25), held to left  
  \- Color matches armor tier

Cape (level 8+):  
  \- 2-3 flat cubes behind body, slightly angled  
  \- Color: darker shade of armor color

### **Water**

\- Keep at same size (20×20 plane)  
\- Add slight opacity variation or a second translucent layer for depth  
\- Color: keep COLORS.water but consider adding a subtle gradient  
  (deeper \= darker at edges, lighter near island)

---

## **CHANGE 3: Environmental Details (Quick Wins for Visual Richness)**

These small additions massively increase the "handcrafted" feel:

### **Flowers / Ground Cover**

\- Scatter 8-12 tiny colored cubes (0.15 size) randomly on island surface  
\- Colors: \#ef4444 (red), \#fbbf24 (yellow), \#ec4899 (pink), \#ffffff (white)  
\- Appear at Stage 1+  
\- Placement: random positions on ground tiles that aren't occupied by structures

### **Rocks**

\- 3-5 small gray cube clusters (2-3 cubes each, 0.2 size)  
\- Scattered at island edges  
\- Present from Stage 0 (even barren islands have rocks)  
\- Colors: mix of \#9ca3af and \#6b7280

### **Cloud Enhancement**

\- Clouds (Stage 5+): cluster of 6-10 white cubes (0.5 size each)  
\- Arranged in a rough elongated oval shape  
\- Float above island at Y \= 6-8  
\- Very slow drift (X position oscillates over 20 second cycle)  
\- 2-3 cloud clusters at different heights/positions

### **Floating Island Underside**

This is what makes the reference image so striking — you can see the bottom.

\- Below the ground platform, add 3 layers of progressively smaller footprint:  
  Layer 1 (Y \= \-0.2 to \-0.6): 80% of ground footprint, dirt brown cubes  
  Layer 2 (Y \= \-0.6 to \-1.2): 50% of ground footprint, darker brown/gray  
  Layer 3 (Y \= \-1.2 to \-1.8): 20% of ground footprint, stone gray, rough/jagged  
    
\- Random cubes removed from edges for organic stalactite-like shape  
\- This creates the "floating island with earth beneath" look  
\- Optional: 1-2 tiny vine cubes (green) hanging from bottom edge

---

## **CHANGE 4: Lighting Refinement**

Better lighting sells the diorama feel:

\- AmbientLight: intensity 0.5 (slightly brighter, softer shadows)  
\- DirectionalLight: position \[8, 12, 4\], intensity 0.7  
  \- castShadow: true  
  \- shadow.mapSize: 1024×1024  
  \- shadow.camera bounds: cover the island footprint  
\- Optional HemisphereLight: sky \#87CEEB, ground \#4a7c4f, intensity 0.3  
  \- This adds subtle blue from above and green bounce from below  
  \- Makes the scene feel more natural and less "CG"

Background color: \#1a3a2a → consider a gradient:  
  \- Top: \#4a8fb5 (sky blue)  
  \- Bottom: \#1a3a2a (dark green)  
  \- Or keep solid dark if gradient is complex to implement

---

## **IMPLEMENTATION ORDER**

Bernie should do these in sequence, testing visually after each:

1. **Camera controls** (zoom \+ rotation) — 5 min, instant gratification  
2. **Ground platform** (smaller cubes, more grid, cliff edges) — 15 min, biggest visual impact  
3. **Trees** (rebuild with smaller, denser cubes) — 15 min  
4. **Structures** (hut/house/castle rebuild) — 20 min  
5. **Monsters** (rescale) — 10 min  
6. **Hero** (rescale) — 10 min  
7. **Environmental details** (flowers, rocks, underside) — 15 min  
8. **Lighting** (hemisphere light, shadow tuning) — 5 min  
9. **Clouds** (if Stage 5+) — 5 min

**Total estimate: \~1.5 hours of Bernie time**

---

## **ACCEPTANCE CRITERIA**

* \[ \] Can zoom in close enough to see individual voxels on structures  
* \[ \] Can zoom out to see entire island with water margin  
* \[ \] Full 360° rotation works smoothly  
* \[ \] Island ground has visible cliff/earth layers on sides  
* \[ \] Trees are made of 15+ cubes each, look organic  
* \[ \] Structures have windows, doors, roof detail  
* \[ \] Monsters are smaller but still clearly distinct by category  
* \[ \] Hero is proportional to monsters (slightly taller)  
* \[ \] Flowers and rocks scattered on ground  
* \[ \] Overall impression: "diorama miniature" not "Minecraft build"  
* \[ \] Performance: still 60fps (smaller cubes \= more geometry, watch this)

## **PERFORMANCE NOTE**

More cubes \= more draw calls. If FPS drops below 45:

1. Use InstancedMesh for repeated elements (ground cubes, tree leaves)  
2. Merge static geometries with BufferGeometryUtils.mergeGeometries()  
3. Reduce ground grid from 20×20 to 16×16  
4. Reduce flower/rock scatter count

InstancedMesh is the right long-term fix — it renders thousands of identical cubes in a single draw call. Bernie should consider this for the ground grid at minimum.

---

*Target: Make someone pause their scroll and say "wait, what IS that?"* 🏰

