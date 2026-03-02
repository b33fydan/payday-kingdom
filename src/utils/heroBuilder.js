import * as THREE from 'three';
import { createVoxel } from './voxelBuilder.js';

export const HERO_ARMOR_COLORS = {
  peasant: '#7a4a24',
  recruit: '#8b6f47',
  soldier: '#cd7f32',
  knight: '#c0c0c0',
  champion: '#d4af37',
  legend: '#67e8f9'
};

const SHIELD_TIERS = new Set(['knight', 'champion', 'legend']);
const CAPE_TIERS = new Set(['champion', 'legend']);

function getSwordColor(armorTier) {
  if (armorTier === 'legend') {
    return '#67e8f9';
  }

  if (armorTier === 'champion') {
    return '#facc15';
  }

  return '#cbd5e1';
}

export function getHeroArmorColor(armorTier) {
  return HERO_ARMOR_COLORS[armorTier] ?? HERO_ARMOR_COLORS.peasant;
}

export function createHero(x, z, armorTier = 'peasant') {
  const hero = new THREE.Group();
  const armorColor = getHeroArmorColor(armorTier);
  const armorMeshes = [];

  const addVoxel = (vx, vy, vz, color, size = 1, scale = null) => {
    const voxel = createVoxel(vx, vy, vz, color, size);
    if (Array.isArray(scale) && scale.length === 3) {
      voxel.scale.set(scale[0], scale[1], scale[2]);
    }
    hero.add(voxel);
    return voxel;
  };

  addVoxel(-0.11, 0.15, 0, '#4c321f', 0.375, [1, 2, 1]);
  addVoxel(0.11, 0.15, 0, '#4c321f', 0.375, [1, 2, 1]);

  const torso = addVoxel(0, 0.65, 0, armorColor, 1, [1, 1.25, 0.75]);
  armorMeshes.push(torso);

  addVoxel(-0.29, 0.65, 0, armorColor, 0.3, [1, 3.35, 1]);
  addVoxel(0.29, 0.65, 0, armorColor, 0.3, [1, 3.35, 1]);

  const head = addVoxel(0, 1.15, 0, '#f1c7a3', 0.75);
  armorMeshes.push(head);
  addVoxel(-0.07, 1.17, 0.15, '#111827', 0.2);
  addVoxel(0.07, 1.17, 0.15, '#111827', 0.2);

  if (armorTier !== 'peasant') {
    addVoxel(0.37, 0.72, 0.02, getSwordColor(armorTier), 0.15, [1, 8.3, 1]);
    addVoxel(0.37, 0.46, 0.02, '#8a6734', 0.2, [2.4, 1, 1]);
  }

  if (SHIELD_TIERS.has(armorTier)) {
    const shieldColor = new THREE.Color(armorColor).lerp(new THREE.Color('#0f172a'), 0.28).getStyle();
    addVoxel(-0.34, 0.72, 0, shieldColor, 0.125, [1, 6, 5]);
    addVoxel(-0.31, 0.72, 0.04, '#e2e8f0', 0.09, [1, 3.2, 2.4]);
  }

  if (CAPE_TIERS.has(armorTier)) {
    const capeColor = new THREE.Color(armorColor).lerp(new THREE.Color('#111827'), 0.35).getStyle();
    const capeTop = addVoxel(0, 0.78, -0.2, capeColor, 0.35, [2.2, 2.6, 0.55]);
    capeTop.rotation.x = -0.22;
    const capeMid = addVoxel(0, 0.48, -0.2, capeColor, 0.35, [2.0, 2.35, 0.55]);
    capeMid.rotation.x = -0.15;
    const capeBottom = addVoxel(0, 0.2, -0.18, capeColor, 0.3, [1.8, 2.1, 0.5]);
    capeBottom.rotation.x = -0.1;
  }

  hero.position.set(x, 0, z);
  hero.userData.type = 'hero';
  hero.userData.armorTier = armorTier;
  hero.userData.armorMeshes = armorMeshes;
  hero.userData.armorColor = armorColor;

  return hero;
}
