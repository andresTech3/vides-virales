import * as THREE from "three";

export type ToonOutfit =
  | "casual"
  | "suit"
  | "trenchcoat"
  | "overalls"
  | "lab_coat"
  | "police"
  | "pirate_stripe";

export type ToonHat =
  | "none"
  | "tophat"
  | "bowler"
  | "fedora"
  | "beret"
  | "flat_cap"
  | "police_kepi"
  | "wide_hat"
  | "bandana"
  | "cap";

export type ToonHeldItem =
  | "none"
  | "cane"
  | "paper"
  | "money"
  | "briefcase"
  | "wrench"
  | "magnifying"
  | "torch"
  | "phone";

export interface ToonCharStyle {
  shirt: string;
  outfit?: ToonOutfit;
  stripeColor?: string;
  pants?: string;
  hat?: ToonHat;
  hatColor?: string;
  bandanaColor?: string;
  hair?: "none" | "slick" | "spiky" | "curly";
  hairColor?: string;
  glasses?: boolean;
  monocle?: boolean;
  mustache?: boolean;
  beard?: boolean;
  tie?: boolean;
  tieColor?: string;
  belt?: boolean;
}

export type ToonAction =
  | "idle"
  | "talk"
  | "run"
  | "panic"
  | "celebrate"
  | "fall"
  | "point"
  | "sneak"
  | "laugh"
  | "lean_in"
  | "lying"
  | "jump"
  | "head_bump";

export type ToonExpr =
  | "neutral"
  | "angry"
  | "shocked"
  | "terrified"
  | "smug"
  | "evil_smug"
  | "happy"
  | "laughing"
  | "deadpan"
  | "dollar_eyes"
  | "sweating";

export type ToonBubbleIcon = "none" | "!" | "?" | "!!" | "$$" | "anger" | "laugh" | "JA!";

const INK = "#141218";

function drawStickArm(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  ang: number,
  len1 = 76,
  len2 = 62,
  held: ToonHeldItem = "none"
): void {
  const ex = sx + Math.sin(ang) * len1;
  const ey = sy + Math.cos(ang) * len1;
  const hx = ex + Math.sin(ang * 0.85) * len2;
  const hy = ey + Math.cos(ang * 0.85) * len2;

  ctx.strokeStyle = INK;
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.lineTo(hx, hy);
  ctx.stroke();

  // Held prop before hand
  if (held !== "none") {
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-ang * 0.35);
    if (held === "money") {
      ctx.fillStyle = "#4CA65A";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.fillRect(-10, -24, 48, 28);
      ctx.strokeRect(-10, -24, 48, 28);
      ctx.fillStyle = "#E9ECD6";
      ctx.fillRect(8, -24, 12, 28);
    } else if (held === "paper") {
      ctx.fillStyle = "#FFFDF2";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.fillRect(-8, -34, 42, 50);
      ctx.strokeRect(-8, -34, 42, 50);
      ctx.fillStyle = "#d93b3b";
      ctx.beginPath();
      ctx.arc(20, 2, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (held === "cane") {
      ctx.strokeStyle = "#3a2512";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(12, 130);
      ctx.stroke();
      ctx.fillStyle = "#DBAF72";
      ctx.beginPath();
      ctx.arc(0, -12, 10, 0, Math.PI * 2);
      ctx.fill();
    } else if (held === "briefcase") {
      ctx.fillStyle = "#6e4425";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.fillRect(-26, 6, 54, 38);
      ctx.strokeRect(-26, 6, 54, 38);
      ctx.fillStyle = "#DBAF72";
      ctx.fillRect(-5, 14, 12, 8);
    } else if (held === "wrench") {
      ctx.strokeStyle = "#7b8491";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(-4, 12);
      ctx.lineTo(14, -42);
      ctx.stroke();
      ctx.fillStyle = "#7b8491";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(16, -46, 14, 0.5, Math.PI * 2 - 0.5);
      ctx.fill();
      ctx.stroke();
    } else if (held === "magnifying") {
      ctx.strokeStyle = "#3a2512";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(18, -36);
      ctx.stroke();
      ctx.fillStyle = "rgba(134, 208, 237, 0.7)";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(28, -56, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (held === "torch") {
      ctx.strokeStyle = "#5c3b20";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(0, 10);
      ctx.lineTo(14, -42);
      ctx.stroke();
      ctx.fillStyle = "#FF8C1A";
      ctx.beginPath();
      ctx.arc(16, -54, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFE14D";
      ctx.beginPath();
      ctx.arc(16, -54, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (held === "phone") {
      ctx.fillStyle = "#222630";
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.fillRect(-10, -34, 24, 42);
      ctx.strokeRect(-10, -34, 24, 42);
      ctx.fillStyle = "#86D0ED";
      ctx.fillRect(-6, -28, 16, 30);
    }
    ctx.restore();
  }

  // Mano circular blanca
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(hx, hy, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/**
 * Dibuja un personaje 2D expresivo de cabeza blanca circular (#FFFFFF) y extremidades stick
 * con squash-and-stretch, vestuarios temáticos y gags visuales estilo toon frenético.
 */
export function renderToonCharToCanvas(
  canvas: HTMLCanvasElement,
  style: ToonCharStyle,
  action: ToonAction,
  expr: ToonExpr,
  localTime: number,
  face: 1 | -1 = 1,
  heldItem: ToonHeldItem = "none",
  bubble: ToonBubbleIcon = "none"
): void {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (face === -1) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }

  const cx = W * 0.5;
  const floorY = H * 0.93;

  // Squash-and-stretch de entrada en los primeros 0.16s del plano
  const introT = Math.min(1, Math.max(0, localTime / 0.16));
  const introPop = Math.sin(introT * Math.PI) * 0.14;
  let sx = 1 + introPop;
  let sy = 1 - introPop * 0.7;

  // Pose dinámica frenética
  let bob = Math.sin(localTime * 9) * 4;
  let lean = 0;
  let jump = 0;
  let la = 0.35;
  let ra = 0.35;
  let ll = 0.15;
  let rl = -0.15;
  let mouthTalk = 0;
  let headTilt = 0;

  if (action === "run") {
    const s = Math.sin(localTime * 20);
    bob = Math.abs(s) * -18;
    lean = 0.22;
    la = 1.05 * s;
    ra = -1.05 * s;
    ll = 0.78 * s;
    rl = -0.78 * s;
    sx = 1 - Math.abs(s) * 0.06;
    sy = 1 + Math.abs(s) * 0.06;
  } else if (action === "panic") {
    const s = Math.sin(localTime * 26);
    bob = Math.abs(s) * -14;
    jump = Math.abs(s) * 26;
    la = -2.45 + s * 0.38;
    ra = -2.45 - s * 0.38;
    ll = 0.52 * s;
    rl = -0.52 * s;
    headTilt = s * 0.12;
  } else if (action === "celebrate") {
    const s = Math.abs(Math.sin(localTime * 12));
    jump = s * 44;
    la = -2.55 - Math.sin(localTime * 16) * 0.25;
    ra = -2.55 + Math.sin(localTime * 16) * 0.25;
    sx = 1 - s * 0.08;
    sy = 1 + s * 0.08;
  } else if (action === "laugh") {
    const s = Math.sin(localTime * 24);
    bob = Math.abs(s) * -10;
    lean = -0.12 + s * 0.04;
    headTilt = -0.18 + s * 0.08;
    la = -0.5 + s * 0.2;
    ra = -2.2 + s * 0.2;
  } else if (action === "talk") {
    const s = Math.sin(localTime * 14);
    la = 0.55 + s * 0.65;
    ra = -1.05 + s * 0.5;
    mouthTalk = Math.abs(Math.sin(localTime * 20));
    bob = Math.abs(Math.sin(localTime * 10)) * -6;
  } else if (action === "point") {
    ra = -1.52 + Math.sin(localTime * 12) * 0.08;
    la = 0.45;
    lean = 0.12;
  } else if (action === "lean_in") {
    lean = 0.22;
    headTilt = -0.12;
    ra = -1.1;
    la = -0.2;
    bob = Math.sin(localTime * 8) * 3;
  } else if (action === "sneak") {
    const s = Math.sin(localTime * 10);
    lean = 0.26;
    bob = Math.abs(s) * -8 - 14;
    ll = 0.45 * s;
    rl = -0.45 * s;
    ra = -0.8;
    la = 0.6;
  } else if (action === "fall") {
    lean = -0.85;
    jump = -22;
    la = -2.1;
    ra = -1.4;
    ll = 0.7;
    rl = 0.2;
  } else if (action === "lying") {
    // Acostado boca arriba en el suelo protegiendo la cabeza con los brazos
    lean = -1.52;
    jump = 74;
    bob = Math.sin(localTime * 16) * 2;
    sx = 0.76;
    sy = 0.76;
    la = -2.65;
    ra = -2.45;
    ll = 0.12;
    rl = -0.08;
  } else if (action === "jump") {
    const s = Math.sin(Math.min(1, localTime * 2.2) * Math.PI);
    jump = 55 + s * 80;
    la = -2.35;
    ra = -2.35;
    ll = 0.65;
    rl = -0.55;
    sx = 0.92;
    sy = 1.08;
  } else if (action === "head_bump") {
    const s = Math.sin(localTime * 28);
    jump = 45;
    bob = s * 6;
    lean = s * 0.14;
    headTilt = -0.22 + s * 0.1;
    la = -2.7;
    ra = -2.7;
    ll = 0.35;
    rl = -0.35;
  }

  const shiftX = action === "lying" ? 195 : 0;
  ctx.translate(cx + shiftX, floorY - jump + bob);
  ctx.scale(sx, sy);
  ctx.rotate(lean);

  const hipY = -175;
  const torsoTop = -355;
  const headY = -472;
  const headR = 110;

  // Sombra suave en el suelo
  ctx.save();
  ctx.fillStyle = "rgba(20, 18, 24, 0.26)";
  ctx.beginPath();
  ctx.ellipse(0, jump - bob + 4, 86, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- PIERNAS STICK NEGRAS ---
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 14;
  for (const ang of [ll, rl]) {
    const kx = Math.sin(ang) * 84;
    const ky = hipY + Math.cos(ang) * 84;
    const fx = kx + Math.sin(ang * 0.6) * 84;
    const fy = ky + Math.cos(ang * 0.6) * 84;
    ctx.beginPath();
    ctx.moveTo(ang > 0 ? 22 : -22, hipY);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + 24, fy);
    ctx.stroke();
  }

  // --- TORSO CÁPSULA CON OUTFIT TEMÁTICO ---
  const tw = 118;
  const th = hipY - torsoTop;
  const outfit: ToonOutfit = style.outfit ?? (style.stripeColor ? "pirate_stripe" : style.tie ? "suit" : "casual");

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-tw / 2, torsoTop, tw, th + 18, 48);
  ctx.clip();

  ctx.fillStyle = style.shirt || "#3a6ea5";
  ctx.fillRect(-tw / 2, torsoTop, tw, th + 18);

  if (outfit === "pirate_stripe" && style.stripeColor) {
    ctx.fillStyle = style.stripeColor;
    for (let y = torsoTop + 16; y < hipY + 16; y += 34) {
      ctx.fillRect(-tw / 2, y, tw, 15);
    }
  } else if (outfit === "suit" || outfit === "trenchcoat") {
    // Camisa blanca en V al pecho + solapas
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(-24, torsoTop);
    ctx.lineTo(24, torsoTop);
    ctx.lineTo(0, torsoTop + 92);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.stroke();
    // Botones si es gabardina
    if (outfit === "trenchcoat") {
      ctx.fillStyle = "#141218";
      ctx.beginPath();
      ctx.arc(-16, torsoTop + 115, 6, 0, Math.PI * 2);
      ctx.arc(16, torsoTop + 115, 6, 0, Math.PI * 2);
      ctx.arc(-16, torsoTop + 148, 6, 0, Math.PI * 2);
      ctx.arc(16, torsoTop + 148, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (outfit === "overalls") {
    ctx.fillStyle = style.pants || "#2b4263";
    ctx.fillRect(-tw / 2, torsoTop + 65, tw, 135);
    ctx.fillRect(-40, torsoTop, 20, 75);
    ctx.fillRect(20, torsoTop, 20, 75);
    ctx.fillStyle = "#DBAF72";
    ctx.beginPath();
    ctx.arc(-30, torsoTop + 72, 6, 0, Math.PI * 2);
    ctx.arc(30, torsoTop + 72, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (outfit === "police") {
    ctx.fillStyle = "#DBAF72";
    for (let by = torsoTop + 34; by <= torsoTop + 130; by += 32) {
      ctx.beginPath();
      ctx.arc(4, by, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (outfit === "lab_coat") {
    ctx.fillStyle = "#F4F6FA";
    ctx.fillRect(-tw / 2, torsoTop, tw, th + 18);
    ctx.fillStyle = "#3a6ea5";
    ctx.beginPath();
    ctx.moveTo(-20, torsoTop);
    ctx.lineTo(20, torsoTop);
    ctx.lineTo(0, torsoTop + 78);
    ctx.closePath();
    ctx.fill();
  }

  // Pantalón / parte inferior
  if (style.pants && outfit !== "overalls") {
    ctx.fillStyle = style.pants;
    ctx.fillRect(-tw / 2, hipY - 22, tw, 46);
  }

  // Cinturón
  if (style.belt || outfit === "police") {
    ctx.fillStyle = outfit === "police" ? "#1e1e24" : "#d9a520";
    ctx.fillRect(-tw / 2, hipY - 30, tw, 18);
    ctx.strokeStyle = outfit === "police" ? "#DBAF72" : INK;
    ctx.lineWidth = 5;
    ctx.strokeRect(-14, hipY - 30, 28, 18);
  }

  // Corbata
  if (style.tie) {
    ctx.fillStyle = style.tieColor || "#d93b3b";
    ctx.beginPath();
    ctx.moveTo(-10, torsoTop + 12);
    ctx.lineTo(10, torsoTop + 12);
    ctx.lineTo(15, torsoTop + 92);
    ctx.lineTo(0, torsoTop + 118);
    ctx.lineTo(-15, torsoTop + 92);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  ctx.restore();

  // Contorno negro grueso del torso
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(-tw / 2, torsoTop, tw, th + 18, 48);
  ctx.stroke();

  // --- BRAZOS STICK ---
  drawStickArm(ctx, -tw / 2 + 4, torsoTop + 34, -la, 76, 62, "none");
  drawStickArm(ctx, tw / 2 - 4, torsoTop + 34, ra, 76, 62, heldItem);

  // --- CABEZA Y EXPRESIONES ---
  ctx.save();
  ctx.translate(6, headY);
  ctx.rotate(headTilt);

  // Cabeza blanca circular
  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(0, 0, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pelo opcional encima de la cabeza
  if (style.hair && style.hair !== "none") {
    ctx.fillStyle = style.hairColor || "#291d16";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    if (style.hair === "slick") {
      ctx.beginPath();
      ctx.arc(0, -14, headR * 0.94, Math.PI + 0.18, -0.18);
      ctx.quadraticCurveTo(20, -headR * 0.65, -headR * 0.9, -14);
      ctx.fill();
      ctx.stroke();
    } else if (style.hair === "spiky") {
      ctx.beginPath();
      ctx.moveTo(-78, -56);
      ctx.lineTo(-55, -118);
      ctx.lineTo(-22, -96);
      ctx.lineTo(8, -134);
      ctx.lineTo(36, -95);
      ctx.lineTo(74, -116);
      ctx.lineTo(84, -54);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (style.hair === "curly") {
      for (const [hx, hy, hr] of [
        [-68, -74, 28],
        [-28, -98, 32],
        [18, -100, 32],
        [62, -78, 28],
      ]) {
        ctx.beginPath();
        ctx.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  const eyeY = -14;
  const lx = -26;
  const rx = 38;
  const blink = Math.sin(localTime * 3.1) > 0.97;

  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;

  if (blink && expr !== "shocked" && expr !== "terrified" && expr !== "dollar_eyes") {
    for (const ex of [lx, rx]) {
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(ex - 16, eyeY);
      ctx.lineTo(ex + 16, eyeY);
      ctx.stroke();
    }
  } else if (expr === "dollar_eyes") {
    ctx.font = "900 44px Arial, sans-serif";
    ctx.fillStyle = "#2ca348";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const ex of [lx, rx]) {
      ctx.fillText("$", ex, eyeY);
      ctx.strokeText("$", ex, eyeY);
    }
  } else if (expr === "deadpan" || expr === "smug" || expr === "evil_smug") {
    for (const [idx, ex] of [lx, rx].entries()) {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(ex, eyeY + 4, 12, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.beginPath();
      const tilt = expr === "evil_smug" ? (idx === 0 ? 10 : -12) : expr === "smug" ? -6 : 0;
      ctx.moveTo(ex - 20, eyeY - 4 - tilt * 0.5);
      ctx.lineTo(ex + 20, eyeY - 4 + tilt * 0.5);
      ctx.stroke();
    }
  } else if (expr === "shocked" || expr === "terrified") {
    const rOuterY = expr === "terrified" ? 30 : 25;
    for (const ex of [lx, rx]) {
      ctx.fillStyle = "#FFFFFF";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(ex, eyeY - 2, 21, rOuterY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ex + 4, eyeY - 2, expr === "terrified" ? 4.5 : 6.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (expr === "laughing") {
    ctx.lineWidth = 8;
    for (const ex of [lx, rx]) {
      ctx.beginPath();
      ctx.arc(ex, eyeY + 8, 16, Math.PI + 0.3, -0.3);
      ctx.stroke();
    }
  } else {
    for (const [idx, ex] of [lx, rx].entries()) {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      if (expr === "angry") {
        ctx.lineWidth = 9;
        ctx.beginPath();
        const tilt = idx === 0 ? 12 : -12;
        ctx.moveTo(ex - 22, eyeY - 22 - tilt * 0.5);
        ctx.lineTo(ex + 22, eyeY - 22 + tilt * 0.5);
        ctx.stroke();
      } else if (expr === "sweating") {
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(ex - 16, eyeY - 22);
        ctx.lineTo(ex + 16, eyeY - 28);
        ctx.stroke();
      }
    }
  }

  // Gotas de sudor cómicas
  if (expr === "sweating" || expr === "terrified") {
    const dropY = -58 + ((localTime * 60) % 24);
    ctx.fillStyle = "#5CC8FF";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-74, dropY - 14);
    ctx.quadraticCurveTo(-58, dropY + 6, -74, dropY + 14);
    ctx.quadraticCurveTo(-90, dropY + 6, -74, dropY - 14);
    ctx.fill();
    ctx.stroke();
  }

  // Bigote / barba opcional
  if (style.mustache) {
    ctx.fillStyle = style.hairColor || "#2b1d14";
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-30, 32);
    ctx.quadraticCurveTo(6, 4, 44, 32);
    ctx.quadraticCurveTo(6, 22, -30, 32);
    ctx.fill();
    ctx.stroke();
  }

  // Boca expresiva
  const my = 46;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 7;
  if (expr === "shocked" || expr === "terrified") {
    ctx.fillStyle = expr === "terrified" ? "#7a1d2a" : "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(-24, my - 16, 66, expr === "terrified" ? 42 : 34, 12);
    ctx.fill();
    ctx.stroke();
    if (expr === "shocked") {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-24, my + 1);
      ctx.lineTo(42, my + 1);
      for (let tx = -6; tx <= 26; tx += 16) {
        ctx.moveTo(tx, my - 16);
        ctx.lineTo(tx, my + 18);
      }
      ctx.stroke();
    }
  } else if (mouthTalk > 0.35) {
    ctx.fillStyle = "#7a1d2a";
    ctx.beginPath();
    ctx.ellipse(6, my, 22, 16 * mouthTalk + 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (expr === "happy" || expr === "laughing" || expr === "dollar_eyes") {
    ctx.fillStyle = "#7a1d2a";
    ctx.beginPath();
    ctx.arc(6, my - 6, expr === "laughing" ? 36 : 30, 0.1, Math.PI - 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (expr === "angry") {
    ctx.beginPath();
    ctx.arc(6, my + 16, 24, Math.PI + 0.3, -0.3);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-14, my);
    ctx.quadraticCurveTo(8, expr === "evil_smug" || expr === "smug" ? my + 8 : my, 28, my - (expr === "smug" || expr === "evil_smug" ? 10 : 0));
    ctx.stroke();
  }

  // Gafas / Monóculo
  if (style.glasses) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(lx, eyeY, 24, 0, Math.PI * 2);
    ctx.moveTo(lx + 24, eyeY);
    ctx.lineTo(rx - 24, eyeY);
    ctx.moveTo(rx + 24, eyeY);
    ctx.arc(rx, eyeY, 24, 0, Math.PI * 2);
    ctx.stroke();
  } else if (style.monocle) {
    ctx.strokeStyle = "#DBAF72";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(rx, eyeY, 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  // --- SOMBREROS VARIADOS ---
  const hat: ToonHat = style.hat ?? "none";
  const hc = style.hatColor || "#222026";
  ctx.fillStyle = hc;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;

  if (hat === "tophat") {
    ctx.fillRect(-58, -172, 118, 108);
    ctx.strokeRect(-58, -172, 118, 108);
    ctx.fillStyle = "#d93b3b";
    ctx.fillRect(-58, -86, 118, 18);
    ctx.fillStyle = hc;
    ctx.beginPath();
    ctx.ellipse(2, -64, 116, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hat === "bowler") {
    ctx.beginPath();
    ctx.arc(2, -62, 74, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(2, -60, 108, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hat === "fedora") {
    ctx.beginPath();
    ctx.moveTo(-64, -64);
    ctx.lineTo(-42, -138);
    ctx.lineTo(0, -124);
    ctx.lineTo(44, -138);
    ctx.lineTo(66, -64);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(2, -62, 118, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hat === "beret") {
    ctx.beginPath();
    ctx.ellipse(-6, -86, 94, 34, -0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4, -118);
    ctx.lineTo(4, -134);
    ctx.stroke();
  } else if (hat === "flat_cap") {
    ctx.beginPath();
    ctx.ellipse(-8, -82, 86, 30, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(54, -74, 56, 14, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hat === "police_kepi" || hat === "cap") {
    ctx.fillRect(-62, -138, 124, 68);
    ctx.strokeRect(-62, -138, 124, 68);
    ctx.fillStyle = "#DBAF72";
    ctx.fillRect(-14, -120, 28, 28);
    ctx.fillStyle = "#111216";
    ctx.beginPath();
    ctx.ellipse(32, -68, 86, 16, 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hat === "wide_hat") {
    ctx.beginPath();
    ctx.arc(2, -58, 76, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(2, -58, 150, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (hat === "bandana") {
    const bc = style.bandanaColor || "#d93b3b";
    ctx.fillStyle = bc;
    ctx.beginPath();
    ctx.ellipse(-headR + 2, -62, 34, 16, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -12, headR * 0.96, Math.PI + 0.15, -0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Burbuja cómica flotante arriba de la cabeza (!, ?, $$, 💢, JA)
  if (bubble !== "none") {
    const pulse = 1 + Math.sin(localTime * 18) * 0.12;
    ctx.save();
    ctx.translate(78, -165);
    ctx.scale(pulse, pulse);
    ctx.font = "900 72px 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const col =
      bubble === "$$"
        ? "#4CE88A"
        : bubble === "!" || bubble === "!!" || bubble === "anger"
        ? "#FF4D4D"
        : bubble === "laugh"
        ? "#FFE14D"
        : "#FFE14D";
    const txt = bubble === "anger" ? "💢" : bubble === "laugh" ? "JA!" : bubble;
    ctx.lineWidth = 14;
    ctx.strokeStyle = INK;
    ctx.strokeText(txt, 0, 0);
    ctx.fillStyle = col;
    ctx.fillText(txt, 0, 0);
    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}

export function makeToonTexture(
  style: ToonCharStyle,
  action: ToonAction,
  expr: ToonExpr,
  localTime: number,
  face: 1 | -1 = 1,
  heldItem: ToonHeldItem = "none",
  bubble: ToonBubbleIcon = "none"
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  renderToonCharToCanvas(canvas, style, action, expr, localTime, face, heldItem, bubble);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Textura cómica con cara deadpan / shocked para props antropomórficos
 * (como el saco de dinero/pólvora con cara en primer plano del video de referencia).
 */
export function makeComicFacePropTexture(
  label: string,
  bgColor: string,
  expr: "deadpan" | "shocked" | "smug" = "deadpan"
): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 512);

  // Cara centrada
  const eyeY = 205;
  ctx.fillStyle = INK;
  ctx.strokeStyle = INK;
  if (expr === "shocked") {
    for (const ex of [185, 327]) {
      ctx.fillStyle = "#FFFFFF";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(ex, eyeY, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ex, eyeY, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(256, 295, 32, 42, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    for (const ex of [190, 322]) {
      ctx.beginPath();
      ctx.ellipse(ex, eyeY + 8, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(ex - 28, eyeY - 6);
      ctx.lineTo(ex + 28, expr === "smug" ? eyeY - 14 : eyeY - 6);
      ctx.stroke();
    }
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(222, 280);
    ctx.lineTo(290, expr === "smug" ? 270 : 280);
    ctx.stroke();
  }

  if (label) {
    ctx.font = "900 72px 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#221810";
    ctx.fillText(label.toUpperCase().slice(0, 10), 256, 405);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
