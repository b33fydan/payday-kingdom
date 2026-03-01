import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const COLORS = {
  grassDark: '#2f7d32',
  grassBase: '#3a913f',
  grassLight: '#52aa57',
  grassMoss: '#2b6b30',
  waterDeep: '#1f6aa5',
  waterBase: '#2f87c6',
  waterShallow: '#57a8db',
  woodDark: '#5f3a1f',
  woodBase: '#7a4a24',
  woodLight: '#966233',
  stoneDark: '#5b6368',
  stoneBase: '#7c858a',
  stoneLight: '#a3aeb5',
  leafDark: '#2d7d2f',
  leafBase: '#3ea542',
  leafLight: '#63c567',
  gold: '#d4af37',
  goldLight: '#e6c65c',
  silver: '#c0c0c0',
  bronze: '#cd7f32',
  monsterHousing: '#d74b4b',
  monsterUtilities: '#d6c24a',
  monsterPhone: '#7c59cf',
  monsterTransport: '#db8739',
  monsterFood: '#4ea85a',
  monsterEntertainment: '#4b83d7',
  monsterOther: '#8c96a3',
  monsterSlime: '#65d16f',
  monsterGoblin: '#6e8a32',
  monsterOrc: '#4a6b2a',
  monsterShadow: '#4f3a6f',
  heroArmor: '#5b7289',
  heroCape: '#c84d4d',
  heroSkin: '#f1c7a3',
  heroTrim: '#f4d370',
  shieldWood: '#744522',
  shieldMetal: '#90a0ad'
};

export const BILL_CATEGORY_COLORS = {
  housing: COLORS.monsterHousing,
  utilities: COLORS.monsterUtilities,
  phone: COLORS.monsterPhone,
  transport: COLORS.monsterTransport,
  food: COLORS.monsterFood,
  entertainment: COLORS.monsterEntertainment,
  other: COLORS.monsterTransport
};

export function createVoxel(x, y, z, color, size = 1) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createTree(x, z, style = 'oak') {
  const tree = new THREE.Group();
  const trunkHeight = style === 'pine' ? 1.8 : 1.4;
  const trunk = createVoxel(x, trunkHeight * 0.5, z, COLORS.woodBase, 0.6);
  trunk.scale.y = trunkHeight;
  trunk.position.y = trunkHeight * 0.5;

  const leafColor = style === 'autumn' ? '#a36b2f' : COLORS.leafBase;
  const leaves = [];

  if (style === 'pine') {
    leaves.push(createVoxel(x, trunkHeight + 0.7, z, COLORS.leafDark, 1.3));
    leaves.push(createVoxel(x, trunkHeight + 1.3, z, COLORS.leafBase, 1));
    leaves.push(createVoxel(x, trunkHeight + 1.8, z, COLORS.leafLight, 0.7));
  } else {
    leaves.push(createVoxel(x, trunkHeight + 0.6, z, leafColor, 1.3));
    leaves.push(createVoxel(x + 0.55, trunkHeight + 0.45, z, COLORS.leafLight, 0.9));
    leaves.push(createVoxel(x - 0.55, trunkHeight + 0.45, z, COLORS.leafDark, 0.9));
    leaves.push(createVoxel(x, trunkHeight + 0.45, z + 0.55, COLORS.leafBase, 0.9));
    leaves.push(createVoxel(x, trunkHeight + 0.45, z - 0.55, COLORS.leafBase, 0.9));
  }

  tree.add(trunk, ...leaves);
  return tree;
}

export function createBuilding(x, z, width, height, depth, color = COLORS.stoneBase) {
  const floorCount = Math.max(1, Math.round(height));
  const geos = [];

  for (let level = 0; level < floorCount; level += 1) {
    const taper = 1 - level * 0.05;
    const levelWidth = Math.max(0.6, width * taper);
    const levelDepth = Math.max(0.6, depth * taper);
    const levelGeo = new THREE.BoxGeometry(levelWidth, 1, levelDepth);
    levelGeo.translate(0, level + 0.5, 0);
    geos.push(levelGeo);
  }

  const merged = mergeGeometries(geos);
  geos.forEach((geo) => geo.dispose());

  const mesh = new THREE.Mesh(
    merged,
    new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05 })
  );
  mesh.position.set(x, 0, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createCharacter(x, z, armorColor = COLORS.heroArmor, hasShield = true) {
  const character = new THREE.Group();
  const legs = createVoxel(x, 0.5, z, '#3f2b1a', 0.6);
  const torso = createVoxel(x, 1.2, z, armorColor, 0.8);
  const shoulders = createVoxel(x, 1.9, z, COLORS.heroTrim, 0.9);
  const head = createVoxel(x, 2.55, z, COLORS.heroSkin, 0.6);

  character.add(legs, torso, shoulders, head);

  if (hasShield) {
    const shield = createVoxel(x + 0.7, 1.25, z, COLORS.shieldWood, 0.6);
    const shieldRim = createVoxel(x + 0.7, 1.25, z + 0.02, COLORS.shieldMetal, 0.42);
    character.add(shield, shieldRim);
  }

  return character;
}

export function createMonster(x, z, color = COLORS.monsterGoblin, size = 1) {
  const monster = new THREE.Group();
  const base = createVoxel(x, 0.4 * size, z, color, 0.9 * size);
  const torso = createVoxel(x, 1.05 * size, z, color, 1.1 * size);
  const shoulderLeft = createVoxel(x - 0.55 * size, 1.2 * size, z, color, 0.6 * size);
  const shoulderRight = createVoxel(x + 0.55 * size, 1.2 * size, z, color, 0.6 * size);
  const head = createVoxel(x, 1.8 * size, z, COLORS.monsterShadow, 0.55 * size);

  monster.add(base, torso, shoulderLeft, shoulderRight, head);
  return monster;
}

export function createRocks(x, z, count = 4) {
  const rocks = new THREE.Group();

  for (let i = 0; i < count; i += 1) {
    const size = 0.3 + Math.random() * 0.35;
    const rock = createVoxel(
      x + (Math.random() - 0.5) * 1.2,
      size * 0.5,
      z + (Math.random() - 0.5) * 1.2,
      i % 2 === 0 ? COLORS.stoneBase : COLORS.stoneDark,
      size
    );
    rock.rotation.y = Math.random() * Math.PI;
    rocks.add(rock);
  }

  return rocks;
}

export function createGroup(meshes = []) {
  const group = new THREE.Group();
  meshes.forEach((mesh) => group.add(mesh));
  return group;
}
