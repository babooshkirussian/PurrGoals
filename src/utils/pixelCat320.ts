import { CatAnimationState, CatConfig, FoodType, FurColor } from '../types/index';
import { getCatColors } from './pixelCatData';

export interface RoomRenderOptions {
  catConfig: CatConfig;
  animationState: CatAnimationState;
  frameIndex: number; // 0..3
  selectedFood: FoodType | null;
  bowlHasFood: boolean;
  isNight: boolean;
  speechText?: string;
  bounceOffset?: number;
}

/**
 * Base 29×32 Pixel-Art Sprite Matrix extracted directly from the user's reference image
 * (b8a8242a029f0dab3d89b593cbdff40c_93e4e078.jpg):
 * - '.' = transparent background
 * - '#' = body silhouette pixel
 * - 'W' = vertical slit eye pixel (| |)
 * - Tail: straight upright at columns 6-8 on rows 0-9 (NO swishing tail animation)
 * - Ears: pointed tips on rows 3-6
 * - Eyes: vertical slits at column 18 and column 23 on rows 11-13
 * - Paws: standing forward-stepping posture on rows 23-31
 */
export const CAT_SPRITE_29x32: string[] = [
  "......###....................", // 0: tail top
  "......###....................", // 1: tail
  "......####...................", // 2: tail
  "......####....###............", // 3: tail + left ear tip
  "......####...#####.....###...", // 4: tail + left ear + right ear tip
  "......####...#####....####...", // 5: tail + ears
  "......#####.##############...", // 6: tail + head connects ears
  "......#####.##############...", // 7: head
  "......#####.##############...", // 8: head
  "......#####.##############...", // 9: tail joins back + head
  "......####################...", // 10: head & forehead
  ".....#############W####W###..", // 11: eyes top slit
  "....##############W####W###..", // 12: eyes mid slit
  "....##############W####W###..", // 13: eyes bottom slit
  "...########################..", // 14: chin & neck
  "...########################..", // 15: neck / chest
  "..#########################..", // 16: body back & chest
  "..#########################..", // 17: body
  "..########################...", // 18: body
  "..#######################....", // 19: torso
  ".#########################...", // 20: torso
  ".#########################...", // 21: body lower
  ".##########################..", // 22: hip
  "######.####################..", // 23: rear leg back + front leg
  "#####....###################.", // 24: legs separating
  "#####.....#########...######.", // 25: 4 legs
  "####......######.......######", // 26: legs
  "####......######........#####", // 27: legs
  ".##.......#####...........##.", // 28: paws
  "..........#####..............", // 29: center paw
  "..........#####..............", // 30: center paw
  "...........###...............", // 31: paw base tip
];

/**
 * 29x32 Curled Sleeping Cat Sprite Matrix
 */
export const CAT_SLEEPING_SPRITE_29x32: string[] = [
  ".............................", // 0
  ".............................", // 1
  ".............................", // 2
  ".............................", // 3
  ".............................", // 4
  ".............................", // 5
  ".............................", // 6
  ".............................", // 7
  ".............................", // 8
  ".............................", // 9
  ".............................", // 10
  "..........########...........", // 11
  "........############.........", // 12
  "......################.......", // 13
  ".....##################......", // 14: ears tucked
  "....####_#######_#######.....", // 15: closed sleeping eyes '_'
  "...######################....", // 16: curled face & body
  "..########################...", // 17
  ".##########################..", // 18
  ".##########################..", // 19
  "############################.", // 20
  "############################.", // 21
  "############################.", // 22
  "############################.", // 23: curled body
  ".##########################..", // 24
  "..########################...", // 25
  "...######################....", // 26: paws tucked under
  "....####..########..####.....", // 27
  ".....##....######....##......", // 28
  ".............................", // 29
  ".............................", // 30
  ".............................", // 31
];

/**
 * Upscale a 29x32 sprite matrix to a true 58x64 (1px native on 320x180) matrix
 * using LucasArts EPX / Scale2x corner-smoothing so diagonal edges have crisp 1px steps
 * instead of 2x2 blocky staircases, while keeping vertical slit eyes ('W') and upright tail sharp.
 */
function buildNative58x64Matrix(src: string[]): string[] {
  const H = src.length;
  const W = src[0].length;
  const out: string[][] = Array.from({ length: H * 2 }, () => Array(W * 2).fill('.'));

  const get = (r: number, c: number): string => {
    if (r < 0 || r >= H || c < 0 || c >= W) return '.';
    // Treat 'W' as '#' for body silhouette continuity when checking outer edges
    return src[r][c];
  };

  const isBody = (ch: string) => ch === '#' || ch === 'W' || ch === '_';

  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const P = get(r, c);
      if (P === 'W' || P === '_') {
        // Keep eye slits crisp and exact
        out[r * 2][c * 2] = P;
        out[r * 2][c * 2 + 1] = P;
        out[r * 2 + 1][c * 2] = P;
        out[r * 2 + 1][c * 2 + 1] = P;
        continue;
      }

      const pBody = isBody(P);
      const A = isBody(get(r - 1, c)); // top
      const B = isBody(get(r, c + 1)); // right
      const C = isBody(get(r, c - 1)); // left
      const D = isBody(get(r + 1, c)); // bottom

      // EPX 1px corner smoothing at 320x180 resolution
      const p0 = (C === A && C !== D && A !== B) ? A : pBody;
      const p1 = (A === B && A !== C && B !== D) ? B : pBody;
      const p2 = (D === C && D !== B && C !== A) ? C : pBody;
      const p3 = (B === D && B !== A && D !== C) ? D : pBody;

      out[r * 2][c * 2] = p0 ? '#' : '.';
      out[r * 2][c * 2 + 1] = p1 ? '#' : '.';
      out[r * 2 + 1][c * 2] = p2 ? '#' : '.';
      out[r * 2 + 1][c * 2 + 1] = p3 ? '#' : '.';
    }
  }

  return out.map((row) => row.join(''));
}

export const CAT_NATIVE_58x64: string[] = buildNative58x64Matrix(CAT_SPRITE_29x32);
export const CAT_SLEEPING_NATIVE_58x64: string[] = buildNative58x64Matrix(CAT_SLEEPING_SPRITE_29x32);

/**
 * High-Resolution 320x180 Retro Pixel Scene Renderer
 * Every element and the cat sprite are rendered at true 1x1 pixel resolution on the 320x180 grid.
 */
export function drawRoom320(
  ctx: CanvasRenderingContext2D,
  options: RoomRenderOptions
) {
  const {
    catConfig,
    animationState,
    frameIndex,
    selectedFood,
    bowlHasFood,
    isNight,
    speechText,
  } = options;

  ctx.imageSmoothingEnabled = false;

  const W = 320;
  const H = 180;

  // Clear canvas
  ctx.clearRect(0, 0, W, H);

  // 1. Cozy Wallpaper (Upper 128px)
  if (isNight) {
    ctx.fillStyle = '#1c1b29';
    ctx.fillRect(0, 0, W, 128);
    ctx.fillStyle = '#171622';
    for (let x = 0; x < W; x += 16) {
      ctx.fillRect(x, 0, 8, 128);
    }
  } else {
    ctx.fillStyle = '#fcefdc';
    ctx.fillRect(0, 0, W, 128);
    ctx.fillStyle = '#f7e3ca';
    for (let x = 0; x < W; x += 16) {
      ctx.fillRect(x, 0, 8, 128);
    }
  }

  // Baseboard trim
  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, 125, W, 4);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 126, W, 2);

  // 2. Wooden Floorboards (Lower 52px)
  const floorBg = isNight ? '#292524' : '#d97706';
  ctx.fillStyle = floorBg;
  ctx.fillRect(0, 129, W, 51);

  const plankColor = isNight ? '#1c1917' : '#b45309';
  ctx.fillStyle = plankColor;
  for (let y = 129; y < H; y += 10) {
    ctx.fillRect(0, y, W, 1);
  }
  for (let y = 129; y < H; y += 10) {
    const shift = (y % 20 === 0) ? 0 : 25;
    for (let x = shift; x < W; x += 50) {
      ctx.fillRect(x, y, 1, 10);
    }
  }

  // 3. Multi-Pane Window (x=24, y=14, w=64, h=64)
  const winX = 24;
  const winY = 14;
  const winW = 64;
  const winH = 64;

  ctx.fillStyle = '#292524';
  ctx.fillRect(winX - 3, winY - 3, winW + 6, winH + 8);
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(winX - 1, winY - 1, winW + 2, winH + 4);
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(winX - 4, winY + winH, winW + 8, 4);

  if (isNight) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(winX, winY, winW, winH);

    // Glowing Crescent Moon
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(winX + winW - 16, winY + 18, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(winX + winW - 13, winY + 16, 9, 0, Math.PI * 2);
    ctx.fill();

    // Twinkling Pixel Stars
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(winX + 10, winY + 12, 2, 2);
    ctx.fillRect(winX + 28, winY + 24, 1, 1);
    ctx.fillRect(winX + 16, winY + 40, 2, 2);
    ctx.fillRect(winX + 42, winY + 45, 1, 1);
  } else {
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(winX, winY, winW, winH);

    // Golden Sun
    ctx.fillStyle = '#facc15';
    ctx.fillRect(winX + 8, winY + 8, 14, 14);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(winX + 10, winY + 10, 10, 10);

    // Drifting Clouds
    const cloudShift = (frameIndex * 2) % 12;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(winX + 26 + cloudShift, winY + 24, 26, 8);
    ctx.fillRect(winX + 32 + cloudShift, winY + 20, 14, 4);
    ctx.fillRect(winX + 22 + cloudShift, winY + 26, 6, 4);
    ctx.fillRect(winX + 8, winY + 44, 20, 6);
    ctx.fillRect(winX + 12, winY + 41, 10, 3);
  }

  // Window mullions
  ctx.fillStyle = '#292524';
  ctx.fillRect(winX + winW / 2 - 1, winY, 2, winH);
  ctx.fillRect(winX, winY + winH / 2 - 1, winW, 2);

  // 4. Room Furniture & Decor
  const decor = catConfig.roomDecorations || [];
  const hasDecor = (id: string) => decor.includes(id as any);

  if (hasDecor('fairy_lights')) {
    const lightColors = ['#f43f5e', '#facc15', '#10b981', '#38bdf8', '#c084fc'];
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    for (let x = 16; x <= W; x += 32) {
      ctx.quadraticCurveTo(x - 16, 16, x, 8);
    }
    ctx.stroke();

    for (let x = 16, i = 0; x < W; x += 16, i++) {
      const c = lightColors[i % lightColors.length];
      const isLit = (frameIndex + i) % 2 === 0;
      ctx.fillStyle = isLit ? c : '#a8a29e';
      ctx.fillRect(x - 1, 11, 3, 4);
    }
  }

  if (hasDecor('neon_fish')) {
    const glow = frameIndex % 2 === 0 ? '#38bdf8' : '#0ea5e9';
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(220, 20, 48, 22);
    ctx.fillStyle = glow;
    ctx.fillRect(226, 26, 24, 8);
    ctx.fillRect(246, 24, 6, 12);
    ctx.fillRect(250, 22, 4, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(230, 28, 2, 2);
  }

  // Potted Plant on Right
  const plantX = 278;
  const plantY = 94;
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(plantX, plantY + 16, 22, 18);
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(plantX - 2, plantY + 14, 26, 4);
  ctx.fillStyle = '#15803d';
  ctx.fillRect(plantX + 4, plantY + 4, 14, 10);
  ctx.fillRect(plantX - 2, plantY + 8, 8, 8);
  ctx.fillRect(plantX + 16, plantY + 6, 8, 8);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(plantX + 7, plantY, 8, 8);
  ctx.fillRect(plantX + 1, plantY + 6, 6, 6);
  ctx.fillRect(plantX + 15, plantY + 4, 6, 6);

  if (hasDecor('scratching_post')) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(236, 122, 16, 6);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(241, 74, 6, 48);
    ctx.fillStyle = '#b45309';
    for (let y = 74; y < 122; y += 4) {
      ctx.fillRect(241, y, 6, 1);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(238, 90, 4, 3);
  }

  if (hasDecor('yarn_basket')) {
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(94, 134, 18, 12);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(100, 134, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(106, 134, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cozy Cat Bed on Left
  const bedX = 22;
  const bedY = 126;
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(bedX, bedY + 4, 32, 14);
  ctx.fillStyle = '#fda4af';
  ctx.fillRect(bedX + 2, bedY + 2, 28, 12);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bedX + 5, bedY + 5, 8, 5);

  // 5. Patterned Cozy Rug (Center: x=105, y=124, w=110, h=38)
  const rugX = 105;
  const rugY = 124;
  const rugW = 110;
  const rugH = 38;

  ctx.fillStyle = isNight ? '#334155' : '#fde047';
  ctx.beginPath();
  ctx.ellipse(rugX + rugW / 2, rugY + rugH / 2, rugW / 2, rugH / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = isNight ? '#94a3b8' : '#ea580c';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.ellipse(rugX + rugW / 2, rugY + rugH / 2, rugW / 2 - 8, rugH / 2 - 5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 6. Cat Food Bowl (at x=206, y=134)
  const bowlX = 206;
  const bowlY = 134;
  ctx.fillStyle = '#292524';
  ctx.fillRect(bowlX, bowlY + 6, 22, 10);
  ctx.fillStyle = selectedFood ? '#facc15' : '#e0f2fe';
  ctx.fillRect(bowlX + 1, bowlY + 4, 20, 10);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(bowlX + 3, bowlY + 2, 16, 6);

  if (bowlHasFood || animationState === 'eating' || selectedFood) {
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(bowlX + 6, bowlY + 1, 10, 4);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(bowlX + 8, bowlY, 6, 2);
  }

  // 7. THE HIGH-RESOLUTION 320x180 CAT
  // Rendered at native 1x1 pixel resolution on the 320x180 canvas (58x64 native pixels)
  const catX = 131;
  let catY = 76;

  let bounce = 0;
  if (animationState === 'happy') {
    bounce = frameIndex % 2 === 0 ? -3 : 0;
  } else if (animationState === 'celebrating') {
    bounce = frameIndex % 2 === 0 ? -6 : -1;
  }
  catY += bounce;

  if (animationState === 'happy') {
    drawFloatingHearts(ctx, catX + 29, catY + 10, frameIndex);
  } else if (animationState === 'celebrating') {
    drawConfetti(ctx, catX + 29, catY, frameIndex);
  }

  drawCatHighRes(ctx, catX, catY, catConfig, animationState, frameIndex, 1);

  // 8. Speech Bubble (above cat)
  if (speechText) {
    ctx.font = '7px "Press Start 2P", monospace';
    const words = speechText.split(' ');
    const lines: string[] = [];
    let curLine = '';
    for (const w of words) {
      const testLine = curLine ? `${curLine} ${w}` : w;
      if (ctx.measureText(testLine).width > 155) {
        if (curLine) lines.push(curLine);
        curLine = w;
      } else {
        curLine = testLine;
      }
    }
    if (curLine) lines.push(curLine);

    const maxLineW = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const boxW = Math.max(70, maxLineW + 16);
    const boxH = lines.length * 11 + 10;
    const bubbleX = Math.max(10, Math.min(W - boxW - 10, catX + 29 - boxW / 2));
    const bubbleY = Math.max(6, catY - boxH - 6);

    ctx.fillStyle = '#292524';
    ctx.fillRect(bubbleX - 1, bubbleY - 1, boxW + 2, boxH + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bubbleX, bubbleY, boxW, boxH);

    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.moveTo(catX + 26, bubbleY + boxH);
    ctx.lineTo(catX + 30, bubbleY + boxH + 5);
    ctx.lineTo(catX + 34, bubbleY + boxH);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(catX + 27, bubbleY + boxH - 1);
    ctx.lineTo(catX + 30, bubbleY + boxH + 3);
    ctx.lineTo(catX + 33, bubbleY + boxH - 1);
    ctx.fill();

    ctx.fillStyle = '#1c1917';
    lines.forEach((line, idx) => {
      ctx.fillText(line, bubbleX + 8, bubbleY + 12 + idx * 11);
    });
  }
}

function drawFloatingHearts(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
  const hearts = [
    { x: cx - 22, y: cy - 12 - (frame * 2), color: '#f43f5e' },
    { x: cx + 24, y: cy - 16 - ((frame + 1) * 2), color: '#ec4899' },
    { x: cx - 6, y: cy - 24 - (frame * 3), color: '#fb7185' },
  ];
  hearts.forEach((h) => {
    ctx.fillStyle = h.color;
    ctx.fillRect(h.x + 1, h.y, 1, 1);
    ctx.fillRect(h.x + 3, h.y, 1, 1);
    ctx.fillRect(h.x, h.y + 1, 5, 2);
    ctx.fillRect(h.x + 1, h.y + 3, 3, 1);
    ctx.fillRect(h.x + 2, h.y + 4, 1, 1);
  });
}

function drawConfetti(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
  const colors = ['#facc15', '#38bdf8', '#ec4899', '#22c55e', '#a855f7'];
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 24 + ((frame * 6 + i * 4) % 36);
    const px = Math.floor(cx + Math.cos(angle) * dist);
    const py = Math.floor(cy + Math.sin(angle) * (dist * 0.7));
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(px, py, 2, 2);
  }
}

/**
 * Draws the cat at native 58x64 (1px per 320x180 pixel) resolution:
 * - Matches the reference image (b8a8242a029f0dab3d89b593cbdff40c_93e4e078.jpg)
 * - Straight upright tail (no swishing animation)
 * - Vertical slit eyes (| |)
 * - Crisp 1px edges with zero blockiness
 */
export function drawCatHighRes(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  catConfig: CatConfig,
  animationState: CatAnimationState,
  frameIndex: number,
  pixelSize: number = 1
) {
  const colors = getCatColors(catConfig.furColor, catConfig.eyeColor);
  const { fur, eyes } = colors;
  const f4 = frameIndex % 4;
  const f2 = frameIndex % 2;

  const isSleepy = animationState === 'sleepy';
  const matrix = isSleepy ? CAT_SLEEPING_NATIVE_58x64 : CAT_NATIVE_58x64;

  const isBlinking = animationState === 'idle' && f4 === 2;
  const isHappy = animationState === 'happy' || animationState === 'celebrating';

  for (let r = 0; r < matrix.length; r++) {
    const rowStr = matrix[r];
    for (let c = 0; c < rowStr.length; c++) {
      const char = rowStr[c];
      if (char === '.') continue;

      const px = cx + c * pixelSize;
      const py = cy + r * pixelSize;
      const baseC = Math.floor(c / 2);
      const baseR = Math.floor(r / 2);

      if (char === 'W') {
        const eyeColor = baseC <= 20 ? eyes.left : eyes.right;

        if (isBlinking) {
          if (r === 24 || r === 25) {
            ctx.fillStyle = eyeColor;
            ctx.fillRect(px, py, pixelSize, pixelSize);
          } else {
            ctx.fillStyle = getCoatPixelColor(catConfig.furColor, fur, baseC, baseR);
            ctx.fillRect(px, py, pixelSize, pixelSize);
          }
        } else if (isHappy) {
          // Happy curved ^ ^ slit
          const isHappyPixel = r === 23 || r === 24;
          if (isHappyPixel) {
            ctx.fillStyle = eyeColor;
            ctx.fillRect(px, py, pixelSize, pixelSize);
          } else {
            ctx.fillStyle = getCoatPixelColor(catConfig.furColor, fur, baseC, baseR);
            ctx.fillRect(px, py, pixelSize, pixelSize);
          }
        } else {
          // Iconic vertical slit eyes from user reference image
          ctx.fillStyle = eyeColor;
          ctx.fillRect(px, py, pixelSize, pixelSize);
        }
        continue;
      }

      if (char === '_') {
        ctx.fillStyle = eyes.left;
        ctx.fillRect(px, py, pixelSize, pixelSize);
        continue;
      }

      ctx.fillStyle = getCoatPixelColor(catConfig.furColor, fur, baseC, baseR);
      ctx.fillRect(px, py, pixelSize, pixelSize);
    }
  }

  // Hungry state: small blue teardrop below left eye
  if (animationState === 'hungry' && !isSleepy) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx + 35 * pixelSize, cy + (28 + f2 * 2) * pixelSize, 2 * pixelSize, 2 * pixelSize);
  }

  // Eating state: crunch crumbs near bowl
  if (animationState === 'eating' && !isSleepy && f2 === 1) {
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(cx + 54 * pixelSize, cy + 30 * pixelSize, 2 * pixelSize, 2 * pixelSize);
    ctx.fillRect(cx + 57 * pixelSize, cy + 32 * pixelSize, 2 * pixelSize, 2 * pixelSize);
  }

  // Sleepy state: floating Zzz
  if (isSleepy) {
    const zY = cy + 10 - (f4 * 2);
    ctx.fillStyle = '#818cf8';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('Z', cx + 44 * pixelSize, zY);
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('z', cx + 52 * pixelSize, zY - 5);
  }

  if (!isSleepy) {
    drawAccessories(ctx, cx, cy, catConfig.accessory, pixelSize * 2);
  }
}

function getCoatPixelColor(
  furColor: FurColor,
  fur: { main: string; shadow: string; highlight: string; chest?: string; stripe?: string },
  c: number,
  r: number
): string {
  switch (furColor) {
    case 'black': {
      // Pure sleek black silhouette matching the user reference image
      return '#18181b';
    }

    case 'orange': {
      const isTabbyStripe =
        (c >= 6 && c <= 8 && (r === 1 || r === 3 || r === 5 || r === 7)) ||
        (r >= 14 && r <= 22 && (c === 8 || c === 12 || c === 15)) ||
        (r === 7 && (c === 16 || c === 20));
      if (isTabbyStripe) return '#9a3412';
      if (r >= 28 && ((c >= 1 && c <= 3) || (c >= 24 && c <= 27))) return '#fff7ed';
      return '#ea580c';
    }

    case 'white': {
      if (r >= 22 && r <= 27 && c >= 6 && c <= 14) return '#cbd5e1';
      if (r === 5 && (c === 15 || c === 23)) return '#fbcfe8';
      return '#f8fafc';
    }

    case 'grey': {
      if (r <= 6 && (c === 13 || c === 22)) return '#94a3b8';
      if (r >= 22 && r <= 27 && c >= 6 && c <= 14) return '#3f3f46';
      return '#64748b';
    }

    case 'calico': {
      if ((c >= 6 && c <= 8 && r <= 9) || (r <= 6 && c >= 22)) return '#18181b';
      if ((r <= 6 && c >= 13 && c <= 17) || (r >= 16 && r <= 22 && c >= 6 && c <= 13)) return '#ea580c';
      return '#f8fafc';
    }

    case 'siamese': {
      const isSealPoint =
        (c >= 6 && c <= 8 && r <= 9) ||
        (r <= 6 && ((c >= 13 && c <= 17) || (c >= 22 && c <= 25))) ||
        (r >= 9 && r <= 14 && c >= 16 && c <= 25) ||
        (r >= 27);
      if (isSealPoint) return '#451a03';
      return '#ffedd5';
    }

    default:
      return fur.main;
  }
}

function drawAccessories(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  accessory: string,
  U: number
) {
  switch (accessory) {
    case 'red_ribbon': {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx + 17 * U, cy + 15 * U, 6 * U, 2 * U);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(cx + 19 * U, cy + 16 * U, 2 * U, 2 * U);
      break;
    }
    case 'pink_bow': {
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(cx + 18 * U, cy + 15 * U, 2 * U, 2 * U);
      ctx.fillRect(cx + 21 * U, cy + 15 * U, 2 * U, 2 * U);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(cx + 19.5 * U, cy + 15.5 * U, 2 * U, 1.5 * U);
      break;
    }
    case 'cool_shades': {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(cx + 16 * U, cy + 11 * U, 4 * U, 3 * U);
      ctx.fillRect(cx + 21 * U, cy + 11 * U, 4 * U, 3 * U);
      ctx.fillRect(cx + 20 * U, cy + 11.5 * U, 1 * U, 1 * U);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 17 * U, cy + 11.5 * U, 1 * U, 1 * U);
      ctx.fillRect(cx + 22 * U, cy + 11.5 * U, 1 * U, 1 * U);
      break;
    }
    case 'round_glasses': {
      ctx.fillStyle = '#d97706';
      ctx.strokeRect(cx + 16.5 * U, cy + 10.5 * U, 3.5 * U, 3.5 * U);
      ctx.strokeRect(cx + 21.5 * U, cy + 10.5 * U, 3.5 * U, 3.5 * U);
      ctx.fillRect(cx + 20 * U, cy + 11.5 * U, 1.5 * U, 1 * U);
      break;
    }
    case 'party_hat': {
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(cx + 17 * U, cy + 4 * U, 5 * U, 2 * U);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(cx + 18 * U, cy + 2 * U, 3 * U, 2 * U);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(cx + 19 * U, cy + 0 * U, 1 * U, 2 * U);
      break;
    }
    case 'wizard_hat': {
      ctx.fillStyle = '#4f46e5';
      ctx.fillRect(cx + 15 * U, cy + 4 * U, 8 * U, 2 * U);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(cx + 17 * U, cy + 1 * U, 5 * U, 3 * U);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(cx + 18.5 * U, cy - 1 * U, 2 * U, 2 * U);
      break;
    }
    case 'cowboy_hat': {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(cx + 14 * U, cy + 4 * U, 10 * U, 2 * U);
      ctx.fillRect(cx + 16 * U, cy + 1 * U, 6 * U, 3 * U);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx + 16 * U, cy + 3.5 * U, 6 * U, 1 * U);
      break;
    }
    case 'chef_hat': {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(cx + 16 * U, cy + 4 * U, 7 * U, 2 * U);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 15 * U, cy + 0 * U, 9 * U, 4 * U);
      break;
    }
    case 'knit_scarf': {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx + 16 * U, cy + 14 * U, 8 * U, 3 * U);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx + 18 * U, cy + 14 * U, 2 * U, 3 * U);
      ctx.fillRect(cx + 22 * U, cy + 14 * U, 2 * U, 3 * U);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx + 16 * U, cy + 17 * U, 3 * U, 4 * U);
      break;
    }
    case 'crown': {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(cx + 16 * U, cy + 4 * U, 7 * U, 2 * U);
      ctx.fillRect(cx + 16 * U, cy + 1 * U, 2 * U, 3 * U);
      ctx.fillRect(cx + 18.5 * U, cy + 0 * U, 2 * U, 4 * U);
      ctx.fillRect(cx + 21 * U, cy + 1 * U, 2 * U, 3 * U);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(cx + 19 * U, cy + 4 * U, 1.5 * U, 1.5 * U);
      break;
    }
    default:
      break;
  }
}

export const drawCatSleek = drawCatHighRes;
