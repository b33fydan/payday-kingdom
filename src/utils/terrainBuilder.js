import { VOXEL_SIZE, VOXEL_HALF, COLORS, getTerrainColor, TERRAIN_TYPES } from './voxelBuilder';
import * as THREE from 'three';

// ============= Seeded Random Number Generator =============
// Deterministic RNG so the same seed produces the same island
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(max) {
    return Math.floor(this.next() * max);
  }

  choice(array) {
    if (!array || array.length === 0) return null;
    return array[this.nextInt(array.length)];
  }
}

// ============= Terrain Grid Generation =============

/**
 * Generates an 8x8 grid of terrain types
 * Uses seeded RNG for reproducibility
 * @param {number} seed - Random seed (default: Date.now() % 1000000)
 * @returns {array} 8x8 2D array of terrain types
 */
export function generateTerrainGrid(seed = Date.now() % 1000000) {
  const rng = new SeededRandom(seed);
  const size = 8;
  const terrainArray = Object.values(TERRAIN_TYPES);
  const grid = [];

  // Create 8x8 grid with seeded randomization
  for (let row = 0; row < size; row++) {
    const gridRow = [];
    for (let col = 0; col < size; col++) {
      const terrainType = rng.choice(terrainArray);
      gridRow.push(terrainType);
    }
    grid.push(gridRow);
  }

  return grid;
}

/**
 * Converts a terrain grid into Three.js objects
 * @param {array} terrainGrid - 8x8 grid of terrain types
 * @param {number} cellSize - Size of each cell (default: 0.5)
 * @returns {THREE.Group} Group containing all terrain quads
 */
export function buildTerrainScene(terrainGrid, cellSize = 0.5) {
  const terrainGroup = new THREE.Group();

  if (!terrainGrid || terrainGrid.length === 0) {
    console.warn('Empty terrain grid');
    return terrainGroup;
  }

  const rows = terrainGrid.length;
  const cols = terrainGrid[0].length;
  const gridWidth = cols * cellSize;
  const gridHeight = rows * cellSize;

  // Center grid at (0, 0)
  const offsetX = gridWidth / 2;
  const offsetZ = gridHeight / 2;

  // Build each cell as a ground plane
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const terrainType = terrainGrid[row][col];
      const color = getTerrainColor(terrainType);

      // Position: centered grid, flat on Y=0
      const x = col * cellSize - offsetX + cellSize / 2;
      const y = 0;
      const z = row * cellSize - offsetZ + cellSize / 2;

      // Create ground plane
      const cellMesh = createTerrainCell(x, y, z, color, cellSize, terrainType);
      terrainGroup.add(cellMesh);
    }
  }

  return terrainGroup;
}

/**
 * Creates a single terrain cell (ground plane)
 * @param {number} x - X position
 * @param {number} y - Y position (height)
 * @param {number} z - Z position
 * @param {string} color - Hex color
 * @param {number} size - Cell size
 * @param {string} terrainType - Terrain type (for metadata)
 * @returns {THREE.Mesh} Ground plane mesh
 */
function createTerrainCell(x, y, z, color, size, terrainType) {
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.2,
    roughness: 0.8
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Rotate plane to lie flat (default PlaneGeometry faces +Z, we want it on Y)
  mesh.rotation.x = -Math.PI / 2;

  // Position
  mesh.position.set(x, y, z);

  // Metadata for later (zone assignment, etc.)
  mesh.userData.terrainType = terrainType;
  mesh.userData.gridX = Math.round(x / size);
  mesh.userData.gridZ = Math.round(z / size);

  // Shadows
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

/**
 * Adds subtle borders/edges to terrain cells (optional enhancement)
 * For MVP, borders are just color variation. Can enhance later.
 */
export function addTerrainBorders(terrainGroup, terrainGrid, cellSize = 0.5) {
  // TODO: Add border lines between cells if desired
  // For now, rely on distinct terrain colors to show boundaries
}

/**
 * Helper: Get terrain type at grid position
 */
export function getTerrainAtGrid(terrainGrid, gridX, gridZ) {
  if (gridX < 0 || gridX >= terrainGrid[0].length || gridZ < 0 || gridZ >= terrainGrid.length) {
    return null;
  }
  return terrainGrid[gridZ][gridX];
}

/**
 * Helper: Count terrain distribution (for debugging/balancing)
 */
export function getTerrainDistribution(terrainGrid) {
  const distribution = {};

  Object.values(TERRAIN_TYPES).forEach((type) => {
    distribution[type] = 0;
  });

  terrainGrid.forEach((row) => {
    row.forEach((cell) => {
      distribution[cell] = (distribution[cell] || 0) + 1;
    });
  });

  return distribution;
}
