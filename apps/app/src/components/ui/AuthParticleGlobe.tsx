"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Tuning: Crisp, High-Definition Spherical Starfield ────────────────────────
const POINT_COUNT   = 850;   // Crisp particle density
const SPHERE_RADIUS = 2.4;

// ─── Luminous Palette ─────────────────────────────────────────────────────────
const COL_NORMAL_NEAR = new THREE.Color(0x7dd3fc);   // Front: crisp ice-cyan
const COL_NORMAL_FAR  = new THREE.Color(0x06182c);   // Back: deep sapphire navy

// ─── Texture factories ────────────────────────────────────────────────────────

/** Sharp core dot — crisp luminous center */
function makeCoreGlowTex(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  g.addColorStop(0,    "rgba(255,255,255,1.0)");
  g.addColorStop(0.20, "rgba(255,255,255,0.9)");
  g.addColorStop(0.50, "rgba(255,255,255,0.25)");
  g.addColorStop(0.80, "rgba(255,255,255,0.03)");
  g.addColorStop(1,    "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/** Soft feathered halo bloom */
function makeHaloTex(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  g.addColorStop(0,    "rgba(125,211,252,0.50)");
  g.addColorStop(0.25, "rgba(56,189,248,0.22)");
  g.addColorStop(0.55, "rgba(2,132,199,0.07)");
  g.addColorStop(0.85, "rgba(2,132,199,0.01)");
  g.addColorStop(1,    "rgba(2,132,199,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// ─── Geometry helper: Fibonacci Sphere ───────────────────────────────────────
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const t = phi * i;
    pts.push(new THREE.Vector3(Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius));
  }
  return pts;
}

const positions = fibonacciSphere(POINT_COUNT, SPHERE_RADIUS);
const normals   = positions.map(p => p.clone().normalize());

// ─── Component ────────────────────────────────────────────────────────────────
export default function AuthParticleGlobe() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // ── Renderer ─────────────────────────────────────────────────────────────
    let isWebGLSupported = false;
    try {
      const testCanvas = document.createElement("canvas");
      isWebGLSupported = !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
      );
    } catch {
      isWebGLSupported = false;
    }

    if (!isWebGLSupported) {
      console.warn("WebGL not supported.");
      return;
    }

    const initW = container.clientWidth || window.innerWidth;
    const initH = container.clientHeight || window.innerHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(initW, initH);
      renderer.setClearColor(0x010114, 1);
      container.appendChild(renderer.domElement);
    } catch {
      console.warn("WebGL renderer failed.");
      return;
    }

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    // ── Static Particle Buffers ───────────────────────────────────────────────
    const posBuf  = new Float32Array(POINT_COUNT * 3);
    positions.forEach((p, i) => {
      posBuf[i * 3 + 0] = p.x;
      posBuf[i * 3 + 1] = p.y;
      posBuf[i * 3 + 2] = p.z;
    });
    const posAttr = new THREE.BufferAttribute(posBuf, 3);

    const colBuf  = new Float32Array(POINT_COUNT * 3);
    const colAttr = new THREE.BufferAttribute(colBuf, 3);
    colAttr.setUsage(THREE.DynamicDrawUsage);

    // ── Layer 1: sharp core dots ──────────────────────────────────────────────
    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute("position", posAttr);
    coreGeo.setAttribute("color", colAttr);

    const coreTex = makeCoreGlowTex(64);
    const coreMat = new THREE.PointsMaterial({
      size: 0.10,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: coreTex,
      alphaTest: 0.001,
    });
    const coreMesh = new THREE.Points(coreGeo, coreMat);

    // ── Layer 2: wide halo bloom ──────────────────────────────────────────────
    const haloGeo = new THREE.BufferGeometry();
    haloGeo.setAttribute("position", posAttr);
    haloGeo.setAttribute("color", colAttr);

    const haloTex = makeHaloTex(128);
    const haloMat = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: haloTex,
      alphaTest: 0.001,
    });
    const haloMesh = new THREE.Points(haloGeo, haloMat);

    // ── Group: Dramatic Half-Moon Framing on Right Edge ──────────────────────
    const group = new THREE.Group();
    group.add(haloMesh, coreMesh);

    group.position.set(2.35, 0, 0);
    group.scale.setScalar(1.35);

    scene.add(group);

    // ── Color and Shimmer Updates ────────────────────────────────────────────
    const camDir     = new THREE.Vector3(0, 0, 1);
    const camLocal   = new THREE.Vector3();
    const invQuat    = new THREE.Quaternion();
    const tmpCNormal = new THREE.Color();

    function updateParticles(t: number) {
      camDir.subVectors(camera.position, group.position).normalize();
      invQuat.copy(group.quaternion).invert();
      camLocal.copy(camDir).applyQuaternion(invQuat).normalize();

      for (let i = 0; i < positions.length; i++) {
        const n = normals[i]!;
        const depthDot = n.dot(camLocal);
        const depthFactor = Math.pow(Math.max(0, depthDot), 1.25);
        tmpCNormal.lerpColors(COL_NORMAL_FAR, COL_NORMAL_NEAR, depthFactor);

        const shimmer = 0.88 + Math.sin(t * 1.6 + i * 0.35) * 0.12;

        colBuf[i * 3 + 0] = tmpCNormal.r * shimmer;
        colBuf[i * 3 + 1] = tmpCNormal.g * shimmer;
        colBuf[i * 3 + 2] = tmpCNormal.b * shimmer;
      }

      colAttr.needsUpdate = true;
    }

    // ── Interactive Mouse Parallax ─────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetMouseX = nx * 0.35;
        targetMouseY = ny * 0.25;
      }
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const FADE_DURATION     = 1.8;
    const HALO_BASE_OPACITY = 0.35;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      const introProgress = Math.min(1, t / FADE_DURATION);
      const eased = 1 - Math.pow(1 - introProgress, 3);

      coreMat.opacity = eased;
      haloMat.opacity = eased * (HALO_BASE_OPACITY + Math.sin(t * 1.2) * 0.03);

      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Smooth ambient axial spin + interactive tilt
      group.rotation.x = Math.sin(t * 0.05) * 0.04 + mouseY;
      group.rotation.y = t * 0.08 + mouseX;

      const breathe = 1 + Math.sin(t * 0.8) * 0.01;
      group.scale.setScalar(1.25 * breathe);

      updateParticles(t);
      renderer.render(scene, camera);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      coreMat.opacity = 1;
      haloMat.opacity = HALO_BASE_OPACITY;
      group.rotation.y = 0;
      updateParticles(0);
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      coreGeo.dispose(); coreMat.dispose(); coreTex.dispose();
      haloGeo.dispose(); haloMat.dispose(); haloTex.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
