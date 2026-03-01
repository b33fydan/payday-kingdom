import * as THREE from 'three';
import { createVoxel } from './voxelBuilder.js';

export const HERO_ARMOR_COLORS = {
  peasant: '#7a4a24',
  recruit: '#8b6f47',
  soldier: '#cd7f32',
  knight: '#c0c0c0',
  champion: '#d4af37',
  legend: '#e0e7ff'
};

const SHIELD_TIERS = new Set(['knight', 'champion', 'legend']);
const CAPE_TIERS = new Set(['champion', 'legend']);

export function getHeroArmorColor(armorTier) {
  return HERO_ARMOR_COLORS[armorTier] ?? HERO_ARMOR_COLORS.peasant;
}

export function createHero(x, z, armorTier = 'peasant') {
  const hero = new THREE.Group();
  const armorColor = getHeroArmorColor(armorTier);
  const armorMeshes = [];

  const addVoxel = (vx, vy, vz, color, size = 0.5) => {
    const voxel = createVoxel(vx, vy, vz, color, size);
    hero.add(voxel);
    return voxel;
  };

  const legs = addVoxel(0, 0.3, 0, '#4c321f', 0.6);
  legs.scale.y = 1.1;

  const torso = addVoxel(0, 0.95, 0, armorColor, 0.75);
  const shoulders = addVoxel(0, 1.45, 0, armorColor, 0.85);
  const head = addVoxel(0, 1.95, 0, '#f1c7a3', 0.6);
  armorMeshes.push(torso, shoulders);

  if (armorTier !== 'peasant') {
    const swordBlade = addVoxel(0.45, 0.95, 0.25, '#d6dde7', 0.16);
    swordBlade.scale.y = 2.4;
    const swordGuard = addVoxel(0.45, 0.63, 0.25, '#8a6734', 0.25);

    if (armorTier === 'champion') {
      swordBlade.material.color.set('#f49f3d');
    }

    if (armorTier === 'legend') {
      swordBlade.material.color.set('#9ec5ff');
      swordGuard.material.color.set('#f8d84b');
    }
  }

  if (SHIELD_TIERS.has(armorTier)) {
    const shieldBody = addVoxel(-0.52, 0.95, 0, '#744522', 0.5);
    const shieldEmblem = addVoxel(-0.52, 0.95, 0.24, '#90a0ad', 0.28);

    if (armorTier === 'champion' || armorTier === 'legend') {
      shieldEmblem.material.color.set('#f0d67b');
    }

    armorMeshes.push(shieldBody, shieldEmblem);
  }

  if (CAPE_TIERS.has(armorTier)) {
    addVoxel(0, 1.1, -0.42, '#9c2f2f', 0.62).scale.set(1, 1.8, 0.6);
    addVoxel(0, 0.5, -0.34, '#b23838', 0.5);
  }

  if (armorTier === 'legend') {
    const wingColor = '#d9ecff';
    const leftWing = new THREE.Group();
    const rightWing = new THREE.Group();

    for (let index = 0; index < 3; index += 1) {
      const height = 1.3 + index * 0.26;
      const spread = 0.28 + index * 0.16;

      leftWing.add(createVoxel(-spread, height, -0.28 - index * 0.08, wingColor, 0.28));
      rightWing.add(createVoxel(spread, height, -0.28 - index * 0.08, wingColor, 0.28));
    }

    hero.add(leftWing, rightWing);
  }

  hero.position.set(x, 0.5, z);
  hero.userData.type = 'hero';
  hero.userData.armorTier = armorTier;
  hero.userData.armorMeshes = armorMeshes;
  hero.userData.armorColor = armorColor;

  return hero;
}
