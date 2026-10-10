import { useEffect, useRef } from 'react';
import { Point, Direction, GameStatus, SnakeSkinId } from '../types/game';
import { SNAKE_SKINS } from '../game/skins';

interface GameBoardProps {
  snake: Point[];
  food: Point;
  direction: Direction;
  cols: number;
  rows: number;
  status: GameStatus;
  restartCountdown: number | null;
  onRestartClick: () => void;
  autoPlay: boolean;
  score: number;
  skin: SnakeSkinId;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
  isSmoke?: boolean;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  alpha: number;
  vy: number;
}

export function GameBoard({
  snake,
  food,
  direction,
  cols,
  rows,
  status,
  restartCountdown,
  onRestartClick,
  autoPlay,
  score,
  skin,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References for continuous 60fps animations
  const animStateRef = useRef({
    mouthOpen: 0,
    blink: 0,
    lastBlinkTime: Date.now(),
    particles: [] as Particle[],
    trailParticles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    lastScore: score,
    lastFood: food,
    appleSpawnTime: Date.now(),
    digestionIndex: -1,
    deathTime: 0,
    frameCounter: 0,
  });

  // Track score changes: apple burst particles + "+1" floating text + digestion wave
  useEffect(() => {
    if (score > animStateRef.current.lastScore) {
      animStateRef.current.lastScore = score;
      animStateRef.current.digestionIndex = 1;

      const fx = animStateRef.current.lastFood.x;
      const fy = animStateRef.current.lastFood.y;

      // Floating "+1" score popup
      animStateRef.current.floatingTexts.push({
        x: fx + 0.5,
        y: fy + 0.3,
        text: '+1',
        alpha: 1.0,
        vy: -0.038,
      });

      // Burst crunchy particles
      const colors = ['#FF5252', '#FF1744', '#D50000', '#7CB342', '#FFF', '#FFD600'];
      for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15 + (Math.random() - 0.5) * 0.4;
        const speed = 1.8 + Math.random() * 2.8;
        animStateRef.current.particles.push({
          x: fx + 0.5,
          y: fy + 0.5,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          radius: 2 + Math.random() * 3.5,
          alpha: 1.0,
          life: 26 + Math.floor(Math.random() * 12),
        });
      }
    }
    animStateRef.current.lastFood = food;
    animStateRef.current.appleSpawnTime = Date.now();
  }, [score, food]);

  // Track death time for dizzy star animation
  useEffect(() => {
    if (status === 'GAME_OVER') {
      animStateRef.current.deathTime = Date.now();
    }
  }, [status]);

  // Advance digestion wave down body
  useEffect(() => {
    if (animStateRef.current.digestionIndex >= 0 && animStateRef.current.digestionIndex < snake.length) {
      animStateRef.current.digestionIndex += 1;
    } else {
      animStateRef.current.digestionIndex = -1;
    }
  }, [snake]);

  // Continuous 60fps Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;

    const render = () => {
      animStateRef.current.frameCounter++;
      const container = containerRef.current;
      const width = container ? container.clientWidth : 680;
      const height = Math.floor(width * (rows / cols));

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const cellW = width / cols;
      const cellH = height / rows;
      const now = Date.now();

      // Current active skin definition
      const skinDef = SNAKE_SKINS[skin] || SNAKE_SKINS.CLASSIC_GREEN;

      // 1. Classic Google Snake Checkerboard (#A2D149 and #AAD751)
      const colorA = '#A2D149';
      const colorB = '#AAD751';

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          ctx.fillStyle = (c + r) % 2 === 0 ? colorA : colorB;
          ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
        }
      }

      // Check distance from head to apple to animate mouth opening
      const head = snake[0] || { x: 5, y: 7 };
      const distToFood = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
      const isFacingFood =
        (direction === 'RIGHT' && food.x > head.x && food.y === head.y) ||
        (direction === 'LEFT' && food.x < head.x && food.y === head.y) ||
        (direction === 'DOWN' && food.y > head.y && food.x === head.x) ||
        (direction === 'UP' && food.y < head.y && food.x === head.x);

      const targetMouth = (distToFood <= 2 && isFacingFood) ? 1 : 0;
      animStateRef.current.mouthOpen += (targetMouth - animStateRef.current.mouthOpen) * 0.28;

      // Random eye blinks every ~3.5s
      if (now - animStateRef.current.lastBlinkTime > 3400) {
        animStateRef.current.blink = 1;
        if (now - animStateRef.current.lastBlinkTime > 3540) {
          animStateRef.current.blink = 0;
          animStateRef.current.lastBlinkTime = now;
        }
      }

      // GENERATE TRAIL PARTICLES (Especially Fire Trail for Legendary Dragon!)
      if (snake.length > 0 && status === 'PLAYING') {
        const tail = snake[snake.length - 1];
        const mid = snake[Math.floor(snake.length / 2)] || tail;

        if (skinDef.isDragon) {
          // LEGENDARY DRAGON: Animated fire trail (billowing flames, embers, and smoke)
          for (let p = 0; p < 2; p++) {
            const isSmoke = Math.random() > 0.7;
            const flameColors = ['#FFF59D', '#FFD54F', '#FF9100', '#FF3D00', '#D50000'];
            animStateRef.current.trailParticles.push({
              x: tail.x + 0.5 + (Math.random() - 0.5) * 0.5,
              y: tail.y + 0.5 + (Math.random() - 0.5) * 0.5,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -0.6 - Math.random() * 1.2,
              color: isSmoke ? 'rgba(70, 70, 70, 0.45)' : flameColors[Math.floor(Math.random() * flameColors.length)],
              radius: isSmoke ? 4 + Math.random() * 4 : 2.5 + Math.random() * 4,
              alpha: 1.0,
              life: 20 + Math.floor(Math.random() * 14),
              isSmoke,
            });
          }
        } else if (skinDef.trailType === 'FIRE') {
          // Flame sparks
          animStateRef.current.trailParticles.push({
            x: tail.x + 0.5 + (Math.random() - 0.5) * 0.4,
            y: tail.y + 0.5 + (Math.random() - 0.5) * 0.4,
            vx: (Math.random() - 0.5) * 0.7,
            vy: -0.8 - Math.random() * 0.8,
            color: '#FF7043',
            radius: 2.5 + Math.random() * 2,
            alpha: 1.0,
            life: 18,
          });
        } else if (skinDef.trailType === 'ICE') {
          // Frost crystals
          animStateRef.current.trailParticles.push({
            x: tail.x + 0.5 + (Math.random() - 0.5) * 0.4,
            y: tail.y + 0.5 + (Math.random() - 0.5) * 0.4,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            color: Math.random() > 0.5 ? '#E0F7FA' : '#80D8FF',
            radius: 2 + Math.random() * 2,
            alpha: 1.0,
            life: 20,
          });
        } else if (skinDef.trailType === 'GALAXY') {
          // Cosmic stardust
          animStateRef.current.trailParticles.push({
            x: tail.x + 0.5 + (Math.random() - 0.5) * 0.4,
            y: tail.y + 0.5 + (Math.random() - 0.5) * 0.4,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.3,
            color: Math.random() > 0.5 ? '#EA80FC' : '#B388FF',
            radius: 2 + Math.random() * 2.5,
            alpha: 1.0,
            life: 22,
          });
        } else if (skinDef.trailType === 'GOLD') {
          // Gold coin sparkles
          animStateRef.current.trailParticles.push({
            x: tail.x + 0.5 + (Math.random() - 0.5) * 0.4,
            y: tail.y + 0.5 + (Math.random() - 0.5) * 0.4,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.4,
            color: '#FFEA00',
            radius: 2 + Math.random() * 2.5,
            alpha: 1.0,
            life: 18,
          });
        }
      }

      // DRAW TRAIL PARTICLES (Behind the snake)
      const trails = animStateRef.current.trailParticles;
      for (let i = trails.length - 1; i >= 0; i--) {
        const tp = trails[i];
        tp.x += (tp.vx * 0.05);
        tp.y += (tp.vy * 0.05);
        tp.alpha -= 1 / tp.life;
        if (tp.isSmoke) tp.radius += 0.15; // Smoke expands

        if (tp.alpha <= 0) {
          trails.splice(i, 1);
          continue;
        }

        ctx.fillStyle = tp.color;
        ctx.globalAlpha = Math.max(0, tp.alpha);
        ctx.beginPath();
        ctx.arc(tp.x * cellW, tp.y * cellH, tp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 2. Draw Food: Classic Red Apple with Elastic Spawn Pop & Animated Leaf
      const spawnElapsed = now - animStateRef.current.appleSpawnTime;
      let spawnScale = 1.0;
      if (spawnElapsed < 280) {
        const t = spawnElapsed / 280;
        spawnScale = Math.sin(t * Math.PI * 0.8) * 1.25;
      }

      const applePulse = (1 + Math.sin(now / 220) * 0.035) * spawnScale;
      const foodRadius = Math.min(cellW, cellH) * 0.42 * applePulse;
      const foodCenterX = food.x * cellW + cellW / 2;
      const foodCenterY = food.y * cellH + cellH / 2 + foodRadius * 0.12;

      // Apple Gradient Body
      const appleGrad = ctx.createRadialGradient(
        foodCenterX - foodRadius * 0.3,
        foodCenterY - foodRadius * 0.3,
        foodRadius * 0.1,
        foodCenterX,
        foodCenterY,
        foodRadius
      );
      appleGrad.addColorStop(0, '#FF5252');
      appleGrad.addColorStop(1, '#D32F2F');

      ctx.fillStyle = appleGrad;
      ctx.beginPath();
      ctx.arc(foodCenterX, foodCenterY, foodRadius, 0, Math.PI * 2);
      ctx.fill();

      // Apple Specular Reflection Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.52)';
      ctx.beginPath();
      ctx.arc(
        foodCenterX - foodRadius * 0.35,
        foodCenterY - foodRadius * 0.35,
        foodRadius * 0.22,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Apple Stem
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = Math.max(2, cellW * 0.08);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(foodCenterX, foodCenterY - foodRadius * 0.85);
      ctx.quadraticCurveTo(
        foodCenterX + foodRadius * 0.3,
        foodCenterY - foodRadius * 1.35,
        foodCenterX + foodRadius * 0.45,
        foodCenterY - foodRadius * 1.45
      );
      ctx.stroke();

      // Animated Leaf Sway
      const leafSway = Math.sin(now / 320) * 0.12;
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      const leafX = foodCenterX + foodRadius * 0.18;
      const leafY = foodCenterY - foodRadius * 1.1;
      ctx.ellipse(
        leafX,
        leafY,
        foodRadius * 0.36,
        foodRadius * 0.18,
        Math.PI / 4 + leafSway,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // 3. Draw Snake: Normal Clean Tail + Connected Body + Dragon Scales + Horns
      if (snake.length > 0) {
        const bodyThickness = Math.min(cellW, cellH) * 0.82;

        // Premium Aura / Glow Effect
        if (skinDef.glowColor) {
          ctx.shadowColor = skinDef.glowColor;
          ctx.shadowBlur = skinDef.isDragon ? 16 : 10;
        }

        // Draw segments from tail to neck
        for (let i = snake.length - 1; i >= 1; i--) {
          const seg = snake[i];
          const prev = snake[i - 1]; // towards head
          const next = snake[i + 1]; // towards tail

          const segCenterX = seg.x * cellW + cellW / 2;
          const segCenterY = seg.y * cellH + cellH / 2;

          // Digestion pulse width expansion
          const isDigesting = animStateRef.current.digestionIndex === i;
          const currentThickness = isDigesting ? bodyThickness * 1.25 : bodyThickness;

          // Dynamic skin color determination
          if (skinDef.isRainbow) {
            const hue = (now * 0.1 + i * 16) % 360;
            ctx.fillStyle = `hsl(${hue}, 90%, 55%)`;
          } else {
            ctx.fillStyle = i % 2 === 0 ? skinDef.primaryColor : skinDef.secondaryColor;
          }

          // TAIL SEGMENT (100% NORMAL, STRAIGHT, CLEAN CIRCULAR CAP WITHOUT CROOKED OFFSETS)
          if (i === snake.length - 1) {
            ctx.beginPath();
            ctx.arc(segCenterX, segCenterY, currentThickness / 2, 0, Math.PI * 2);
            ctx.fill();

            // Bridge cleanly and squarely to prev
            if (prev) {
              const prevCenterX = prev.x * cellW + cellW / 2;
              const prevCenterY = prev.y * cellH + cellH / 2;
              const dx = prev.x - seg.x;
              const dy = prev.y - seg.y;

              ctx.beginPath();
              if (dx !== 0) {
                const left = Math.min(segCenterX, prevCenterX);
                const w = Math.abs(prevCenterX - segCenterX);
                ctx.rect(left, segCenterY - currentThickness / 2, w, currentThickness);
              } else if (dy !== 0) {
                const top = Math.min(segCenterY, prevCenterY);
                const h = Math.abs(prevCenterY - segCenterY);
                ctx.rect(segCenterX - currentThickness / 2, top, currentThickness, h);
              }
              ctx.fill();
            }
          } else if (prev && next) {
            // BODY SEGMENT: Check if straight or corner turn
            const inDx = prev.x - seg.x;
            const inDy = prev.y - seg.y;
            const outDx = next.x - seg.x;
            const outDy = next.y - seg.y;

            const isStraight = (inDx !== 0 && outDx !== 0) || (inDy !== 0 && outDy !== 0);

            if (isStraight) {
              // Straight continuous connection
              ctx.beginPath();
              if (inDx !== 0) {
                ctx.rect(
                  seg.x * cellW,
                  segCenterY - currentThickness / 2,
                  cellW + 0.5,
                  currentThickness
                );
              } else {
                ctx.rect(
                  segCenterX - currentThickness / 2,
                  seg.y * cellH,
                  currentThickness,
                  cellH + 0.5
                );
              }
              ctx.fill();
            } else {
              // CORNER ROUNDING: Smooth 90-degree corner arc
              ctx.beginPath();
              ctx.arc(segCenterX, segCenterY, currentThickness / 2, 0, Math.PI * 2);
              ctx.fill();

              ctx.beginPath();
              if (inDx > 0) ctx.rect(segCenterX, segCenterY - currentThickness / 2, cellW / 2 + 0.5, currentThickness);
              else if (inDx < 0) ctx.rect(seg.x * cellW, segCenterY - currentThickness / 2, cellW / 2 + 0.5, currentThickness);
              else if (inDy > 0) ctx.rect(segCenterX - currentThickness / 2, segCenterY, currentThickness, cellH / 2 + 0.5);
              else if (inDy < 0) ctx.rect(segCenterX - currentThickness / 2, seg.y * cellH, currentThickness, cellH / 2 + 0.5);
              ctx.fill();

              ctx.beginPath();
              if (outDx > 0) ctx.rect(segCenterX, segCenterY - currentThickness / 2, cellW / 2 + 0.5, currentThickness);
              else if (outDx < 0) ctx.rect(seg.x * cellW, segCenterY - currentThickness / 2, cellW / 2 + 0.5, currentThickness);
              else if (outDy > 0) ctx.rect(segCenterX - currentThickness / 2, segCenterY, currentThickness, cellH / 2 + 0.5);
              else if (outDy < 0) ctx.rect(segCenterX - currentThickness / 2, seg.y * cellH, currentThickness, cellH / 2 + 0.5);
              ctx.fill();
            }
          }

          // LEGENDARY DRAGON: Golden Scales overlay on body segments
          if (skinDef.isDragon) {
            ctx.save();
            ctx.shadowBlur = 0;
            // Golden diamond scale
            ctx.strokeStyle = '#FFD700';
            ctx.fillStyle = '#FFA000';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(segCenterX, segCenterY, currentThickness * 0.22, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Golden spine dot
            ctx.fillStyle = '#FFF59D';
            ctx.beginPath();
            ctx.arc(segCenterX, segCenterY, currentThickness * 0.08, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Bridge neck to head cleanly
        if (snake.length > 1) {
          const neck = snake[1];
          const neckCenterX = neck.x * cellW + cellW / 2;
          const neckCenterY = neck.y * cellH + cellH / 2;
          const headCenterX = head.x * cellW + cellW / 2;
          const headCenterY = head.y * cellH + cellH / 2;

          ctx.fillStyle = skinDef.isRainbow ? '#F50057' : skinDef.primaryColor;
          ctx.beginPath();
          const ndx = head.x - neck.x;
          const ndy = head.y - neck.y;
          if (ndx !== 0) {
            ctx.rect(
              Math.min(headCenterX, neckCenterX),
              headCenterY - bodyThickness / 2,
              Math.abs(headCenterX - neckCenterX),
              bodyThickness
            );
          } else {
            ctx.rect(
              headCenterX - bodyThickness / 2,
              Math.min(headCenterY, neckCenterY),
              bodyThickness,
              Math.abs(headCenterY - neckCenterY)
            );
          }
          ctx.fill();
        }

        // 4. Draw Snake Head
        const headCenterX = head.x * cellW + cellW / 2;
        const headCenterY = head.y * cellH + cellH / 2;
        const headRadius = bodyThickness / 2;

        ctx.fillStyle = skinDef.headColor;
        ctx.beginPath();
        ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        ctx.fill();

        // Round front snout pointing in direction
        const snoutDist = headRadius * 0.85;
        let snoutX = headCenterX;
        let snoutY = headCenterY;
        if (direction === 'RIGHT') snoutX += snoutDist;
        if (direction === 'LEFT') snoutX -= snoutDist;
        if (direction === 'DOWN') snoutY += snoutDist;
        if (direction === 'UP') snoutY -= snoutDist;

        ctx.beginPath();
        ctx.arc(snoutX, snoutY, headRadius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        // LEGENDARY DRAGON: MAJESTIC DRAGON HORNS!
        if (skinDef.isDragon) {
          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#FFD700';

          const hornLen = headRadius * 1.35;
          const hornSpread = headRadius * 0.65;

          // Horn directions point backward relative to movement
          let hornBackX = -1;
          let hornBackY = 0;
          let hornSideX = 0;
          let hornSideY = 1;

          if (direction === 'RIGHT') {
            hornBackX = -1; hornBackY = 0;
            hornSideX = 0; hornSideY = 1;
          } else if (direction === 'LEFT') {
            hornBackX = 1; hornBackY = 0;
            hornSideX = 0; hornSideY = 1;
          } else if (direction === 'UP') {
            hornBackX = 0; hornBackY = 1;
            hornSideX = 1; hornSideY = 0;
          } else if (direction === 'DOWN') {
            hornBackX = 0; hornBackY = -1;
            hornSideX = 1; hornSideY = 0;
          }

          // Horn 1 & Horn 2 (Curved imperial golden dragon horns)
          [-1, 1].forEach((side) => {
            const hBaseX = headCenterX + hornBackX * (headRadius * 0.2) + hornSideX * (hornSpread * side);
            const hBaseY = headCenterY + hornBackY * (headRadius * 0.2) + hornSideY * (hornSpread * side);
            const hTipX = hBaseX + hornBackX * hornLen + hornSideX * (hornSpread * 0.8 * side);
            const hTipY = hBaseY + hornBackY * hornLen + hornSideY * (hornSpread * 0.8 * side);

            // Horn gradient
            const hornGrad = ctx.createLinearGradient(hBaseX, hBaseY, hTipX, hTipY);
            hornGrad.addColorStop(0, '#FFA000');
            hornGrad.addColorStop(0.6, '#FFD700');
            hornGrad.addColorStop(1, '#FFF9C4');

            ctx.strokeStyle = hornGrad;
            ctx.lineWidth = Math.max(3, headRadius * 0.26);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(hBaseX, hBaseY);
            ctx.quadraticCurveTo(
              hBaseX + hornBackX * (hornLen * 0.6) + hornSideX * (hornSpread * 0.3 * side),
              hBaseY + hornBackY * (hornLen * 0.6) + hornSideY * (hornSpread * 0.3 * side),
              hTipX,
              hTipY
            );
            ctx.stroke();
          });
          ctx.restore();
        }

        // Clear glow for sharp facial features
        ctx.shadowBlur = 0;

        // NOSTRILS (Signature Google Snake snout details)
        if (status !== 'GAME_OVER') {
          ctx.fillStyle = skinDef.isDragon ? '#FF6D00' : 'rgba(0, 0, 0, 0.35)';
          const nostrilOffset = headRadius * 0.22;
          let n1 = { x: 0, y: 0 };
          let n2 = { x: 0, y: 0 };
          if (direction === 'RIGHT' || direction === 'LEFT') {
            n1 = { x: snoutX, y: snoutY - nostrilOffset };
            n2 = { x: snoutX, y: snoutY + nostrilOffset };
          } else {
            n1 = { x: snoutX - nostrilOffset, y: snoutY };
            n2 = { x: snoutX + nostrilOffset, y: snoutY };
          }
          ctx.beginPath();
          ctx.arc(n1.x, n1.y, skinDef.isDragon ? 2.5 : 1.8, 0, Math.PI * 2);
          ctx.arc(n2.x, n2.y, skinDef.isDragon ? 2.5 : 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // MOUTH OPENING ANIMATION (Opens wide when near apple!)
        const mouthOpen = animStateRef.current.mouthOpen;
        if (mouthOpen > 0.08 && status !== 'GAME_OVER') {
          ctx.fillStyle = '#D93025';
          ctx.beginPath();

          const mouthWidth = headRadius * 0.88 * mouthOpen;
          if (direction === 'RIGHT') {
            ctx.moveTo(headCenterX + headRadius * 0.35, headCenterY - mouthWidth);
            ctx.lineTo(snoutX + headRadius * 0.75, headCenterY);
            ctx.lineTo(headCenterX + headRadius * 0.35, headCenterY + mouthWidth);
          } else if (direction === 'LEFT') {
            ctx.moveTo(headCenterX - headRadius * 0.35, headCenterY - mouthWidth);
            ctx.lineTo(snoutX - headRadius * 0.75, headCenterY);
            ctx.lineTo(headCenterX - headRadius * 0.35, headCenterY + mouthWidth);
          } else if (direction === 'UP') {
            ctx.moveTo(headCenterX - mouthWidth, headCenterY - headRadius * 0.35);
            ctx.lineTo(headCenterX, snoutY - headRadius * 0.75);
            ctx.lineTo(headCenterX + mouthWidth, headCenterY - headRadius * 0.35);
          } else if (direction === 'DOWN') {
            ctx.moveTo(headCenterX - mouthWidth, headCenterY + headRadius * 0.35);
            ctx.lineTo(headCenterX, snoutY + headRadius * 0.75);
            ctx.lineTo(headCenterX + mouthWidth, headCenterY + headRadius * 0.35);
          }
          ctx.closePath();
          ctx.fill();
        }

        // TONGUE FLICK (Active when navigating)
        if (mouthOpen < 0.25 && status !== 'GAME_OVER') {
          const tongueCycle = Math.sin(now / 140);
          if (tongueCycle > 0.2) {
            ctx.strokeStyle = skinDef.isDragon ? '#FFD600' : '#FF3D00';
            ctx.lineWidth = Math.max(2, cellW * 0.07);
            ctx.lineCap = 'round';
            ctx.beginPath();

            const tLen = cellW * 0.3 * (tongueCycle - 0.2);
            const tx = snoutX;
            const ty = snoutY;
            if (direction === 'RIGHT') {
              ctx.moveTo(tx, ty);
              ctx.lineTo(tx + tLen, ty);
              ctx.lineTo(tx + tLen + 3, ty - 3);
              ctx.moveTo(tx + tLen, ty);
              ctx.lineTo(tx + tLen + 3, ty + 3);
            } else if (direction === 'LEFT') {
              ctx.moveTo(tx, ty);
              ctx.lineTo(tx - tLen, ty);
              ctx.lineTo(tx - tLen - 3, ty - 3);
              ctx.moveTo(tx - tLen, ty);
              ctx.lineTo(tx - tLen - 3, ty + 3);
            } else if (direction === 'UP') {
              ctx.moveTo(tx, ty);
              ctx.lineTo(tx, ty - tLen);
              ctx.lineTo(tx - 3, ty - tLen - 3);
              ctx.moveTo(tx, ty - tLen);
              ctx.lineTo(tx + 3, ty - tLen - 3);
            } else if (direction === 'DOWN') {
              ctx.moveTo(tx, ty);
              ctx.lineTo(tx, ty + tLen);
              ctx.lineTo(tx - 3, ty + tLen + 3);
              ctx.moveTo(tx, ty + tLen);
              ctx.lineTo(tx + 3, ty + tLen + 3);
            }
            ctx.stroke();
          }
        }

        // GOOGLY EYES OR GLOWING DRAGON EYES
        const eyeRadius = cellW * 0.17;
        const eyeOffsetFwd = cellW * 0.18;
        const eyeOffsetSide = cellW * 0.26;

        let eye1: Point = { x: 0, y: 0 };
        let eye2: Point = { x: 0, y: 0 };

        if (direction === 'RIGHT') {
          eye1 = { x: headCenterX + eyeOffsetFwd, y: headCenterY - eyeOffsetSide };
          eye2 = { x: headCenterX + eyeOffsetFwd, y: headCenterY + eyeOffsetSide };
        } else if (direction === 'LEFT') {
          eye1 = { x: headCenterX - eyeOffsetFwd, y: headCenterY - eyeOffsetSide };
          eye2 = { x: headCenterX - eyeOffsetFwd, y: headCenterY + eyeOffsetSide };
        } else if (direction === 'UP') {
          eye1 = { x: headCenterX - eyeOffsetSide, y: headCenterY - eyeOffsetFwd };
          eye2 = { x: headCenterX + eyeOffsetSide, y: headCenterY - eyeOffsetFwd };
        } else if (direction === 'DOWN') {
          eye1 = { x: headCenterX - eyeOffsetSide, y: headCenterY + eyeOffsetFwd };
          eye2 = { x: headCenterX + eyeOffsetSide, y: headCenterY + eyeOffsetFwd };
        }

        if (status === 'GAME_OVER') {
          // DIZZY X_X EYES
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          [eye1, eye2].forEach((e) => {
            ctx.beginPath();
            ctx.moveTo(e.x - 4, e.y - 4);
            ctx.lineTo(e.x + 4, e.y + 4);
            ctx.moveTo(e.x + 4, e.y - 4);
            ctx.lineTo(e.x - 4, e.y + 4);
            ctx.stroke();
          });

          // ORBITING DIZZY CARTOON STARS
          const deathElapsed = (now - animStateRef.current.deathTime) / 300;
          for (let s = 0; s < 3; s++) {
            const starAngle = deathElapsed + (s * Math.PI * 2) / 3;
            const starX = headCenterX + Math.cos(starAngle) * (headRadius * 1.5);
            const starY = headCenterY - headRadius * 0.8 + Math.sin(starAngle) * (headRadius * 0.4);

            ctx.fillStyle = '#FFEA00';
            ctx.beginPath();
            ctx.arc(starX, starY, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Normal Googly Eyes or Legendary Dragon Slit Eyes
          const isBlinking = animStateRef.current.blink === 1;

          [eye1, eye2].forEach((e) => {
            if (skinDef.isDragon) {
              // DRAGON FIERY EYE: Glowing amber-yellow sclera
              ctx.fillStyle = '#FFD54F';
              ctx.beginPath();
              if (isBlinking) {
                ctx.ellipse(e.x, e.y, eyeRadius, 2, 0, 0, Math.PI * 2);
              } else {
                ctx.arc(e.x, e.y, eyeRadius, 0, Math.PI * 2);
              }
              ctx.fill();

              if (!isBlinking) {
                // Dragon Vertical Slit Pupil!
                ctx.fillStyle = '#210000';
                ctx.beginPath();
                ctx.ellipse(e.x, e.y, eyeRadius * 0.22, eyeRadius * 0.65, 0, 0, Math.PI * 2);
                ctx.fill();

                // Golden eye shine
                ctx.fillStyle = '#FFFDE7';
                ctx.beginPath();
                ctx.arc(e.x - 1, e.y - 2, eyeRadius * 0.2, 0, Math.PI * 2);
                ctx.fill();
              }
            } else {
              // Standard Googly Eyes
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              if (isBlinking) {
                ctx.ellipse(e.x, e.y, eyeRadius, 2, 0, 0, Math.PI * 2);
              } else {
                ctx.arc(e.x, e.y, eyeRadius, 0, Math.PI * 2);
              }
              ctx.fill();

              if (!isBlinking) {
                const angleToFood = Math.atan2(foodCenterY - e.y, foodCenterX - e.x);
                const pupilOffsetDist = eyeRadius * 0.38;
                const px = e.x + Math.cos(angleToFood) * pupilOffsetDist;
                const py = e.y + Math.sin(angleToFood) * pupilOffsetDist;

                ctx.fillStyle = skinDef.eyePupil;
                ctx.beginPath();
                ctx.arc(px, py, eyeRadius * 0.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = skinDef.eyeGlint || '#FFFFFF';
                ctx.beginPath();
                ctx.arc(px - 1, py - 1, eyeRadius * 0.18, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          });
        }
      }

      // 5. Apple Crunch Particles Burst Animation
      const particles = animStateRef.current.particles;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += (p.vx * 0.08);
        p.y += (p.vy * 0.08);
        p.alpha -= 1 / p.life;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x * cellW, p.y * cellH, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 6. Floating "+1" Score Text Popups
      const floatingTexts = animStateRef.current.floatingTexts;
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.025;

        if (ft.alpha <= 0) {
          floatingTexts.splice(i, 1);
          continue;
        }

        ctx.font = 'bold 16px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(255, 255, 255, ${ft.alpha})`;
        ctx.strokeStyle = `rgba(0, 0, 0, ${ft.alpha * 0.8})`;
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x * cellW, ft.y * cellH);
        ctx.fillText(ft.text, ft.x * cellW, ft.y * cellH);
      }

      ctx.restore();
      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameId);
  }, [snake, food, direction, cols, rows, status, skin]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[720px] mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-700/30 bg-[#A2D149]"
    >
      <canvas ref={canvasRef} className="block w-full h-auto cursor-pointer" />

      {/* PAUSED OVERLAY */}
      {status === 'PAUSED' && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
          <div className="p-4 rounded-full bg-white/10 mb-3 border border-white/20">
            <div className="w-10 h-10 flex items-center justify-center text-3xl font-black">
              ⏸
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Game Paused</h2>
          <p className="text-xs text-white/70 mb-4">Press Space or Resume to continue</p>
          <button
            onClick={onRestartClick}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-lg hover:scale-105"
          >
            Resume Play
          </button>
        </div>
      )}

      {/* GAME OVER OVERLAY */}
      {status === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 z-20 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-3xl mb-3 shadow-inner">
            💥
          </div>
          <h2 className="text-2xl font-black tracking-wide text-red-400 mb-1">
            CRASH!
          </h2>
          <p className="text-sm text-neutral-300 mb-5 text-center max-w-xs">
            Tough collision ended this run! Let's get right back to it!
          </p>

          {restartCountdown !== null ? (
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
                <span className="animate-pulse">🔄</span>
                Auto-restarting in {restartCountdown}s...
              </div>
              <button
                onClick={onRestartClick}
                className="text-xs text-neutral-400 hover:text-white underline mt-1"
              >
                Restart immediately
              </button>
            </div>
          ) : (
            <button
              onClick={onRestartClick}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all"
            >
              Play Again Now (R)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
