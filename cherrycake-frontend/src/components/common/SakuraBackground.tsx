import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

/**
 * Falling cherry-blossom petals behind the page (ported from the extended project).
 * Pure canvas, no library; pauses when the tab is hidden and respects "reduce motion".
 */
export default function SakuraBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const petalCount = w < 600 ? 14 : 28;
    const petals: Petal[] = [];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 14 + 16,
        speedX: Math.random() * 1.2 - 0.3,
        speedY: Math.random() * 1.0 + 0.6,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 1.8 - 0.9,
        opacity: Math.random() * 0.35 + 0.2,
      });
    }

    const sakuraImg = new Image();
    sakuraImg.src = '/TransparentSakuraFlower.png';

    const drawPetal = (p: Petal) => {
      if (!sakuraImg.complete || sakuraImg.naturalWidth === 0) return;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.drawImage(sakuraImg, -p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        if (p.x > w + 20) p.x = -20;
        if (p.x < -20) p.x = w + 20;
        drawPetal(p);
      }
      animationId = requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      cancelAnimationFrame(animationId);
      if (!document.hidden) animationId = requestAnimationFrame(animate);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="cc-sakura" />;
}
