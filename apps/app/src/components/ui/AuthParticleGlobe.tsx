"use client";

import React, { useEffect, useRef } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseAlpha: number;
  size: number;
  isHotspot: boolean;
}

export default function AuthParticleGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1000);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate Fibonacci Sphere points
    const POINT_COUNT = 1100;
    const SPHERE_RADIUS = Math.min(width, height) * 0.42;
    const points: Point3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      const isHotspot = Math.sin(x * 3 + y * 2) * Math.cos(z * 3) > 0.3;

      points.push({
        x: x * SPHERE_RADIUS,
        y: y * SPHERE_RADIUS,
        z: z * SPHERE_RADIUS,
        baseAlpha: isHotspot ? 0.85 : 0.2 + Math.random() * 0.3,
        size: isHotspot ? 2.0 : 0.9 + Math.random() * 0.8,
        isHotspot,
      });
    }

    let rotX = 0.2;
    let rotY = 0;
    const speed = prefersReducedMotion ? 0 : 0.003;

    let targetRotY = 0;
    let targetRotX = 0.2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / width - 0.5;
      const ny = (e.clientY - rect.top) / height - 0.5;
      targetRotY = nx * 0.5;
      targetRotX = 0.2 + ny * 0.25;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      if (!prefersReducedMotion) {
        rotY += speed;
      }

      const centerX = width * 0.5; // Centered
      const centerY = height * 0.5;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Background atmospheric glow
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        SPHERE_RADIUS * 0.1,
        centerX,
        centerY,
        SPHERE_RADIUS * 1.3
      );
      bgGrad.addColorStop(0, "rgba(2, 132, 199, 0.25)");
      bgGrad.addColorStop(0.45, "rgba(1, 46, 87, 0.15)");
      bgGrad.addColorStop(0.85, "rgba(1, 1, 20, 0.05)");
      bgGrad.addColorStop(1, "rgba(1, 1, 20, 0)");
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, SPHERE_RADIUS * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Outer luminous crescent highlight
      const rimGrad = ctx.createRadialGradient(
        centerX - SPHERE_RADIUS * 0.3,
        centerY - SPHERE_RADIUS * 0.2,
        SPHERE_RADIUS * 0.5,
        centerX,
        centerY,
        SPHERE_RADIUS * 1.02
      );
      rimGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
      rimGrad.addColorStop(0.75, "rgba(56, 189, 248, 0.06)");
      rimGrad.addColorStop(0.97, "rgba(125, 211, 252, 0.4)");
      rimGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, SPHERE_RADIUS * 1.02, 0, Math.PI * 2);
      ctx.fill();

      // Project & Render 3D Points
      for (const pt of points) {
        if (!pt) continue;

        const x1 = pt.x * cosY + pt.z * sinY;
        const z1 = -pt.x * sinY + pt.z * cosY;

        const y2 = pt.y * cosX - z1 * sinX;
        const z2 = pt.y * sinX + z1 * cosX;

        const perspective = 1200 / (1200 + z2);
        const projX = centerX + x1 * perspective;
        const projY = centerY + y2 * perspective;

        const depthRatio = (z2 + SPHERE_RADIUS) / (SPHERE_RADIUS * 2);
        if (depthRatio < 0.08) continue;

        const alpha = Math.min(1, Math.max(0.05, pt.baseAlpha * depthRatio * (0.35 + 0.65 * depthRatio)));
        const pointSize = Math.max(0.6, pt.size * perspective * (0.5 + 0.5 * depthRatio));

        ctx.beginPath();
        ctx.arc(projX, projY, pointSize, 0, Math.PI * 2);

        if (pt.isHotspot && depthRatio > 0.6) {
          ctx.fillStyle = `rgba(240, 249, 255, ${alpha})`;
          ctx.shadowColor = "rgba(56, 189, 248, 0.85)";
          ctx.shadowBlur = 8;
        } else if (depthRatio > 0.45) {
          ctx.fillStyle = `rgba(125, 211, 252, ${alpha * 0.95})`;
          ctx.shadowColor = "rgba(14, 165, 233, 0.45)";
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = `rgba(14, 116, 144, ${alpha * 0.7})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ display: "block" }}
      />
    </div>
  );
}
