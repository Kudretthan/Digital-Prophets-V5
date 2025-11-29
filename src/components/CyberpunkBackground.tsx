'use client';

import { useEffect, useRef, memo } from 'react';

export const CyberpunkBackground = memo(function CyberpunkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Canvas boyutları
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Elektrik çizgileri
    interface Lightning {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      segments: { x: number; y: number }[];
      life: number;
      maxLife: number;
      color: string;
      width: number;
    }

    const lightnings: Lightning[] = [];
    const colors = ['#ff6b00', '#ff9500', '#ffcc00', '#ff3300', '#ff0066'];

    // Grid çizgileri
    interface GridLine {
      y: number;
      speed: number;
      opacity: number;
    }

    const gridLines: GridLine[] = [];
    for (let i = 0; i < 15; i++) {
      gridLines.push({
        y: Math.random() * height,
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.2,
      });
    }

    // Parçacıklar
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: Math.random(),
      });
    }

    // Elektrik segmentleri oluştur
    const createLightningSegments = (x1: number, y1: number, x2: number, y2: number, depth: number = 0): { x: number; y: number }[] => {
      if (depth > 4) return [{ x: x2, y: y2 }];

      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * 50;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * 50;

      const left = createLightningSegments(x1, y1, midX, midY, depth + 1);
      const right = createLightningSegments(midX, midY, x2, y2, depth + 1);

      return [...left, ...right];
    };

    // Yeni elektrik oluştur
    const spawnLightning = () => {
      if (lightnings.length > 3) return;

      const side = Math.floor(Math.random() * 4);
      let x, y, targetX, targetY;

      switch (side) {
        case 0: // Üst
          x = Math.random() * width;
          y = 0;
          targetX = Math.random() * width;
          targetY = height * 0.6;
          break;
        case 1: // Sağ
          x = width;
          y = Math.random() * height;
          targetX = width * 0.3;
          targetY = Math.random() * height;
          break;
        case 2: // Alt
          x = Math.random() * width;
          y = height;
          targetX = Math.random() * width;
          targetY = height * 0.4;
          break;
        default: // Sol
          x = 0;
          y = Math.random() * height;
          targetX = width * 0.7;
          targetY = Math.random() * height;
      }

      const segments = [{ x, y }, ...createLightningSegments(x, y, targetX, targetY)];
      const color = colors[Math.floor(Math.random() * colors.length)];

      lightnings.push({
        x,
        y,
        targetX,
        targetY,
        segments,
        life: 1,
        maxLife: 15 + Math.random() * 10,
        color,
        width: 1 + Math.random() * 2,
      });
    };

    let animationId: number;
    let lastTime = 0;
    let lightningTimer = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const draw = (currentTime: number) => {
      animationId = requestAnimationFrame(draw);

      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      // Arka plan gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#0a0a0f');
      bgGradient.addColorStop(0.3, '#1a0a1a');
      bgGradient.addColorStop(0.6, '#1a1005');
      bgGradient.addColorStop(1, '#0f0505');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Perspektif grid çiz
      ctx.strokeStyle = 'rgba(255, 100, 0, 0.08)';
      ctx.lineWidth = 1;

      // Yatay çizgiler
      gridLines.forEach((line) => {
        line.y += line.speed;
        if (line.y > height) line.y = 0;

        ctx.globalAlpha = line.opacity;
        ctx.beginPath();
        ctx.moveTo(0, line.y);
        ctx.lineTo(width, line.y);
        ctx.stroke();
      });

      // Dikey çizgiler
      ctx.globalAlpha = 0.05;
      for (let x = 0; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Parçacıklar
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.01;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const flicker = 0.5 + Math.sin(p.life * 5) * 0.5;
        ctx.globalAlpha = flicker * 0.8;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Elektrik çizgileri
      lightningTimer++;
      if (lightningTimer > 60 + Math.random() * 100) {
        spawnLightning();
        lightningTimer = 0;
      }

      // Elektrikleri çiz
      lightnings.forEach((lightning, index) => {
        lightning.life++;
        const alpha = 1 - lightning.life / lightning.maxLife;

        if (alpha <= 0) {
          lightnings.splice(index, 1);
          return;
        }

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = lightning.color;
        ctx.lineWidth = lightning.width;
        ctx.shadowColor = lightning.color;
        ctx.shadowBlur = 15;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y);
        lightning.segments.forEach((seg) => {
          ctx.lineTo(seg.x, seg.y);
        });
        ctx.stroke();

        // İç parıltı
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = lightning.width * 0.3;
        ctx.globalAlpha = alpha * 0.5;
        ctx.stroke();
      });

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Köşelerde vignette efekti
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.3,
        width / 2,
        height / 2,
        height
      );
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // Üst ve alt glow
      const topGlow = ctx.createLinearGradient(0, 0, 0, 100);
      topGlow.addColorStop(0, 'rgba(255, 100, 0, 0.1)');
      topGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, width, 100);
    };

    animationId = requestAnimationFrame(draw);

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newDpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = window.innerWidth * newDpr;
        canvas.height = window.innerHeight * newDpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(newDpr, newDpr);
      }, 200);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none -z-50"
    />
  );
});
