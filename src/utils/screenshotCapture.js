import { Vector2 } from 'three';
import { getBannerColorHex } from './kingdomTheme.js';

const ARMOR_LABELS = {
  peasant: 'Peasant',
  recruit: 'Recruit',
  soldier: 'Soldier',
  knight: 'Knight',
  champion: 'Champion',
  legend: 'Legend'
};

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(toNumber(value));
}

function getBannerData(gameState, budgetState) {
  const kingdomName = String(budgetState?.kingdomName || 'My Payday Kingdom').trim() || 'My Payday Kingdom';
  const level = Math.max(1, Math.floor(toNumber(gameState?.level, 1)));
  const armorTier = String(gameState?.armorTier || 'peasant');
  const armorLabel = ARMOR_LABELS[armorTier] ?? ARMOR_LABELS.peasant;
  const month = Math.max(0, Math.floor(toNumber(gameState?.monthsCompleted, 0)));
  const totalSaved = Array.isArray(budgetState?.history)
    ? budgetState.history.reduce((sum, entry) => sum + toNumber(entry?.surplus, 0), 0)
    : 0;

  const accentColor = getBannerColorHex(budgetState?.bannerColor);

  const appHost = window.location.hostname === 'localhost' ? 'paydaykingdom.app' : window.location.host;

  return {
    kingdomName,
    detailsLine: `Lv.${level} ${armorLabel} | Month ${month} | ${formatCompactCurrency(totalSaved)} Saved`,
    appHost,
    accentColor
  };
}

function drawBanner(ctx, width, height, bannerData) {
  const bannerHeight = Math.max(154, Math.round(height * 0.18));
  const bannerY = height - bannerHeight;

  const bg = ctx.createLinearGradient(0, bannerY, width, height);
  bg.addColorStop(0, 'rgba(6, 10, 18, 0.92)');
  bg.addColorStop(1, 'rgba(10, 14, 22, 0.95)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, bannerY, width, bannerHeight);

  ctx.fillStyle = bannerData.accentColor;
  ctx.fillRect(0, bannerY, width, 10);

  const leftPad = Math.round(width * 0.04);
  const titleY = bannerY + Math.round(bannerHeight * 0.42);
  const detailY = bannerY + Math.round(bannerHeight * 0.7);
  const hostY = bannerY + Math.round(bannerHeight * 0.9);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `700 ${Math.max(34, Math.round(width * 0.028))}px "Courier New", monospace`;
  ctx.fillText(`Kingdom: ${bannerData.kingdomName}`, leftPad, titleY);

  ctx.fillStyle = '#dbeafe';
  ctx.font = `500 ${Math.max(24, Math.round(width * 0.0185))}px "Courier New", monospace`;
  ctx.fillText(bannerData.detailsLine, leftPad, detailY);

  ctx.fillStyle = '#9ca3af';
  ctx.font = `500 ${Math.max(19, Math.round(width * 0.015))}px "Courier New", monospace`;
  ctx.fillText(bannerData.appHost, leftPad, hostY);
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load captured scene image.'));
    image.src = dataUrl;
  });
}

export async function captureScreenshot(renderer, scene, camera, gameState, budgetState) {
  if (!renderer || !scene || !camera) {
    throw new Error('Missing scene capture context.');
  }

  const originalPixelRatio = renderer.getPixelRatio();
  const originalSize = renderer.getSize(new Vector2());

  const captureWidth = Math.max(1, Math.floor(originalSize.x * 2));
  const captureHeight = Math.max(1, Math.floor(originalSize.y * 2));

  renderer.setPixelRatio(1);
  renderer.setSize(captureWidth, captureHeight, false);
  renderer.render(scene, camera);
  const sceneDataUrl = renderer.domElement.toDataURL('image/png');

  renderer.setPixelRatio(originalPixelRatio);
  renderer.setSize(originalSize.x, originalSize.y, false);
  renderer.render(scene, camera);

  const sceneImage = await loadImage(sceneDataUrl);
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = captureWidth;
  outputCanvas.height = captureHeight;

  const ctx = outputCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create screenshot canvas context.');
  }

  ctx.drawImage(sceneImage, 0, 0, captureWidth, captureHeight);
  drawBanner(ctx, captureWidth, captureHeight, getBannerData(gameState, budgetState));

  return outputCanvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to export screenshot blob.'));
        return;
      }

      resolve(blob);
    }, 'image/png');
  });
}

export function downloadCanvasAsPng(canvas, filename) {
  const safeName = String(filename || 'payday-kingdom').trim() || 'payday-kingdom';
  const anchor = document.createElement('a');
  anchor.href = canvas.toDataURL('image/png');
  anchor.download = `${safeName}.png`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
