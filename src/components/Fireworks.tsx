"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  active: boolean;
  duration?: number; // ms
};

export default function Fireworks({ active, duration = 1500 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      alpha: number;
      color: string;
      size: number;
    };

    const particles: Particle[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const spawnConfetti = () => {
      const rect = canvas.getBoundingClientRect();
      const originX = rect.width * 0.5;
      const originY = rect.height * 0.18;
      const count = 42;
      for (let i = 0; i < count; i++) {
        const angle = rand(-2.1, -1.1);
        const speed = rand(3.8, 7.1);
        particles.push({
          x: originX + rand(-30, 30),
          y: originY + rand(-12, 12),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: rand(32, 48),
          alpha: 1,
          color: `hsl(${Math.floor(rand(15, 340))} 92% 65%)`,
          size: rand(4, 7),
        });
      }
    };

    const update = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14;
        p.vx *= 0.992;
        p.vy *= 0.992;
        p.life -= 1;
        p.alpha = Math.max(0, p.life / 48);

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
        ctx.globalAlpha = 1;

        if (p.life <= 0 || p.y > rect.height + 20) particles.splice(i, 1);
      }

      rafRef.current = requestAnimationFrame(update);
    };

    const start = () => {
      if (runningRef.current) return;
      runningRef.current = true;
      resizeCanvas();
      spawnConfetti();
      update();
    };

    const stop = () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.length = 0;
    };

    if (active) {
      start();
      const timer = window.setTimeout(stop, duration);
      return () => {
        clearTimeout(timer);
        stop();
        window.removeEventListener("resize", resizeCanvas);
      };
    }

    return () => {
      stop();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [active, duration]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    />
  );
}
