"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface ParticlesBackgroundProps {
  className?: string;
  particleColor?: string;
  lineColor?: string;
  particleCount?: number;
  maxDistance?: number;
}

export default function ParticlesBackground({
  className = "",
  particleColor = "#0284C7",
  lineColor = "#0284C7",
  particleCount = 120,
  maxDistance = 150,
}: ParticlesBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth || window.innerWidth);
    let height = (canvas.height = container.clientHeight || window.innerHeight);

    // Mouse coordinates relative to canvas
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180,
    };

    // Initialize particles across the entire viewport
    const particles: Particle[] = [];

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          radius: Math.random() * 1.4 + 1.6, // 1.6px - 3.0px clear, crisp nodes
          opacity: Math.random() * 0.35 + 0.50, // 0.50 - 0.85 solid visibility
        });
      }
    };

    initParticles();

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.clientWidth || window.innerWidth;
      height = canvas.height = container.clientHeight || window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Push nearby particles on click
      particles.forEach((p) => {
        if (!p) return;
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200;
          p.vx += (dx / dist) * force * 3.5;
          p.vy += (dy / dist) * force * 3.5;
        }
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);

    // Animation render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const maxDistanceSq = maxDistance * maxDistance;
      const mouseRadiusSq = mouse.radius * mouse.radius;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p) continue;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Velocity damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Gentle organic drift
        if (Math.abs(p.vx) < 0.12) p.vx += (Math.random() - 0.5) * 0.06;
        if (Math.abs(p.vy) < 0.12) p.vy += (Math.random() - 0.5) * 0.06;

        // Bounce on borders
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        // Connect lines between nearby particles using squared-distance gating
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (!p2) continue;

          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistanceSq) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / maxDistance) * 0.26; // Crisp, clearly visible network lines
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }

        // Connect line to mouse if within mouse.radius
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdistSq = mdx * mdx + mdy * mdy;

        if (mdistSq < mouseRadiusSq) {
          const mdist = Math.sqrt(mdistSq);
          const mouseLineAlpha = (1 - mdist / mouse.radius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = "#0284C7";
          ctx.globalAlpha = mouseLineAlpha;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleColor, lineColor, particleCount, maxDistance]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0, backgroundColor: "#FFFFFF" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100vw",
          height: "100dvh",
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}
