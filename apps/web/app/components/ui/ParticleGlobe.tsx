"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { globeScrollState } from "@/lib/globeState";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Tuning ───────────────────────────────────────────────────────────────────
const POINT_COUNT   = 700;   // 700 particle density
const SPHERE_RADIUS = 2.4;
const HOTSPOT_COUNT = 36;    // Number of particles illuminated in hover cone

const REST_DIR = new THREE.Vector3(0, 0, 1).normalize();

// ─── Luminous Blue Palette ───────────────────────────────────────────────────
const COL_NORMAL_NEAR = new THREE.Color(0x7dd3fc);   // Front face: crisp electric ice-blue
const COL_NORMAL_FAR  = new THREE.Color(0x06182c);   // Back face: deep sapphire navy
const COL_HOT_CORE    = new THREE.Color(0xf0f9ff);   // Interactive hover core: glowing brilliant white-cyan
const COL_HOT_EDGE    = new THREE.Color(0x0284c7);   // Interactive rim: vibrant azure blue

// ─── Texture factories ────────────────────────────────────────────────────────

/** Sharp core dot — crisp inner luminous center */
function makeCoreGlowTex(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  g.addColorStop(0,    "rgba(255,255,255,1.0)");
  g.addColorStop(0.22, "rgba(255,255,255,0.95)");
  g.addColorStop(0.50, "rgba(255,255,255,0.30)");
  g.addColorStop(0.80, "rgba(255,255,255,0.04)");
  g.addColorStop(1,    "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/** Wide feathered halo — soft diffused atmospheric bloom */
function makeHaloTex(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  g.addColorStop(0,    "rgba(255,255,255,0.55)");
  g.addColorStop(0.20, "rgba(255,255,255,0.28)");
  g.addColorStop(0.50, "rgba(255,255,255,0.09)");
  g.addColorStop(0.80, "rgba(255,255,255,0.015)");
  g.addColorStop(1,    "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// ─── Geometry helper ─────────────────────────────────────────────────────────
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

// ─── Module-scope geometry ───────────────────────────────────────────────────
const positions = fibonacciSphere(POINT_COUNT, SPHERE_RADIUS);
const normals   = positions.map(p => p.clone().normalize());

// ─── Component ────────────────────────────────────────────────────────────────
export default function ParticleGlobe() {
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
      console.warn("WebGL not supported, falling back to no-globe.");
      return;
    }

    const initW = container.clientWidth || window.innerWidth;
    const initH = container.clientHeight || window.innerHeight;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(initW, initH);
      renderer.setClearColor(0x010114, 1);
      container.appendChild(renderer.domElement);
    } catch {
      console.warn("WebGL renderer failed to initialize.");
      return;
    }

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // ── Dynamic Buffers ───────────────────────────────────────────────────────
    const hsTarget  = REST_DIR.clone();
    const hsCurrent = REST_DIR.clone();
    let   isPointerOver = false;
    let   hoverStrength = 0; // Continuous float: 0.0 (rest) to 1.0 (hovered)

    // Dynamic position buffer (allows smooth micro-forcefield particle displacement)
    const posBuf  = new Float32Array(POINT_COUNT * 3);
    positions.forEach((p, i) => {
      posBuf[i * 3 + 0] = p.x;
      posBuf[i * 3 + 1] = p.y;
      posBuf[i * 3 + 2] = p.z;
    });
    const posAttr = new THREE.BufferAttribute(posBuf, 3);
    posAttr.setUsage(THREE.DynamicDrawUsage);

    // Shared colour buffer
    const colBuf  = new Float32Array(POINT_COUNT * 3);
    const colAttr = new THREE.BufferAttribute(colBuf, 3);
    colAttr.setUsage(THREE.DynamicDrawUsage);

    // ── Layer 1: sharp core dots ──────────────────────────────────────────────
    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute("position", posAttr);
    coreGeo.setAttribute("color", colAttr);

    const coreTex = makeCoreGlowTex(128);
    const coreMat = new THREE.PointsMaterial({
      size: 0.12,
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

    const haloTex = makeHaloTex(256);
    const haloMat = new THREE.PointsMaterial({
      size: 0.65,
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

    // ── Group (Pure Dots only) ────────────────────────────────────────────────
    const group = new THREE.Group();
    group.add(haloMesh, coreMesh);
    scene.add(group);

    // ── Particle & Color Updates with Zero-Allocation Pre-Allocated Buffers ───
    const invQuat    = new THREE.Quaternion();
    const localDir   = new THREE.Vector3();
    const camDir     = new THREE.Vector3(0, 0, 1);
    const camLocal   = new THREE.Vector3();
    const tmpCNormal = new THREE.Color();
    const tmpCHot    = new THREE.Color();
    const tmpLocalHit = new THREE.Vector3();

    // Pre-allocated static buffers to eliminate all per-frame Garbage Collection churn
    const hotDotArray   = new Float32Array(POINT_COUNT);
    const depthDotArray = new Float32Array(POINT_COUNT);
    const particleIndices = new Int32Array(POINT_COUNT);
    const hotRankArray  = new Int32Array(POINT_COUNT);
    for (let i = 0; i < POINT_COUNT; i++) {
      particleIndices[i] = i;
    }

    function updateParticles(t: number) {
      camDir.subVectors(camera.position, group.position).normalize();

      invQuat.copy(group.quaternion).invert();
      localDir.copy(hsCurrent).applyQuaternion(invQuat).normalize();
      camLocal.copy(camDir).applyQuaternion(invQuat).normalize();

      // Compute dot products into flat Float32 buffers
      for (let i = 0; i < POINT_COUNT; i++) {
        const n = normals[i]!;
        hotDotArray[i] = n.dot(localDir);
        depthDotArray[i] = n.dot(camLocal);
        particleIndices[i] = i;
      }

      // Sort index buffer in-place without creating objects
      particleIndices.sort((a, b) => (hotDotArray[b] ?? 0) - (hotDotArray[a] ?? 0));

      hotRankArray.fill(-1);
      for (let r = 0; r < HOTSPOT_COUNT; r++) {
        const idx = particleIndices[r];
        if (idx !== undefined) {
          hotRankArray[idx] = r;
        }
      }

      // Update positions & colors with seamless continuous decay
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i]!;
        const n = normals[i]!;
        const depthDot = depthDotArray[i] ?? 0;
        const rank     = hotRankArray[i] ?? -1;
        const hotDot   = hotDotArray[i] ?? 0;

        // 🌟 Smooth continuous displacement with zero snapping on exit
        let displacement = 0;
        if (hoverStrength > 0.005 && hotDot > 0.45) {
          const intensity = Math.min(1, Math.max(0, (hotDot - 0.45) / 0.55));
          displacement = intensity * hoverStrength * (0.16 + Math.sin(t * 4.5 + hotDot * 6) * 0.03);
        }

        posBuf[i * 3 + 0] = p.x + n.x * displacement;
        posBuf[i * 3 + 1] = p.y + n.y * displacement;
        posBuf[i * 3 + 2] = p.z + n.z * displacement;

        // 🌟 Base natural blue depth gradient
        const depthFactor = Math.pow(Math.max(0, depthDot), 1.25);
        tmpCNormal.lerpColors(COL_NORMAL_FAR, COL_NORMAL_NEAR, depthFactor);

        // 🌟 Smooth color crossfade based on hoverStrength
        if (rank >= 0 && hoverStrength > 0.005) {
          const rankT = rank / (HOTSPOT_COUNT - 1);
          const spotDepth = 0.72 + 0.28 * Math.max(0, depthDot);
          tmpCHot.lerpColors(COL_HOT_CORE, COL_HOT_EDGE, rankT).multiplyScalar(spotDepth);

          const blend = hoverStrength * (1 - rankT * 0.65);
          tmpCNormal.lerp(tmpCHot, blend);
        }

        // 🌟 Atmospheric particle shimmer (organic life at rest)
        const shimmer = 0.88 + Math.sin(t * 1.6 + i * 0.35) * 0.12;

        colBuf[i * 3 + 0] = tmpCNormal.r * shimmer;
        colBuf[i * 3 + 1] = tmpCNormal.g * shimmer;
        colBuf[i * 3 + 2] = tmpCNormal.b * shimmer;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }

    // ── Mouse & Pointer tracking ──────────────────────────────────────────────
    const mouseTarget = new THREE.Vector2(0, 0);
    const mouseSmooth = new THREE.Vector2(0, 0);
    const raycaster   = new THREE.Raycaster();
    const sphereObj   = new THREE.Sphere(new THREE.Vector3(0, 0, 0), SPHERE_RADIUS);
    const rayTarget   = new THREE.Vector3();

    const onPointerMove = (e: MouseEvent) => {
      // If in Phase 2, disable pointer tracking
      if ((globeScrollState.interactiveWeight ?? 1) < 0.05) {
        isPointerOver = false;
        return;
      }

      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Synchronize raycast sphere with actual 3D group position and scale
      sphereObj.center.copy(group.position);
      sphereObj.radius = SPHERE_RADIUS * Math.max(0.1, group.scale.x) * 1.15;

      raycaster.setFromCamera(mouseTarget, camera);
      const hit = raycaster.ray.intersectSphere(sphereObj, rayTarget);
      if (hit) {
        isPointerOver = true;
        // Transform hit point to local orientation direction without allocation
        tmpLocalHit.copy(rayTarget).sub(group.position).normalize();
        hsTarget.lerp(tmpLocalHit, 0.28).normalize();
      } else {
        isPointerOver = false;
        hsTarget.lerp(REST_DIR, 0.04).normalize();
      }
    };

    const onPointerLeave = () => {
      isPointerOver = false;
      mouseTarget.set(0, 0);
      hsTarget.lerp(REST_DIR, 0.04).normalize();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave, { passive: true });

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    const FADE_DURATION     = 1.8;
    const HALO_BASE_OPACITY = 0.35;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth intro fade
      const introProgress = Math.min(1, t / FADE_DURATION);
      const eased = 1 - Math.pow(1 - introProgress, 3);

      // Phase 1 vs Phase 2 interactive weight (1 in Phase 1, 0 in Phase 2)
      const interactiveWeight = Math.max(0, Math.min(1, globeScrollState.interactiveWeight ?? 1));

      // Smooth continuous hover strength transition (disabled when interactiveWeight is 0)
      const targetHover = (isPointerOver && interactiveWeight > 0.05) ? 1.0 : 0.0;
      hoverStrength += (targetHover - hoverStrength) * 0.07;

      // Smooth pointer lerp for magnetic inertia (dampened to 0 in Phase 2)
      mouseSmooth.x += (mouseTarget.x * interactiveWeight - mouseSmooth.x) * 0.06;
      mouseSmooth.y += (mouseTarget.y * interactiveWeight - mouseSmooth.y) * 0.06;

      // Halo opacity smoothly increases with hoverStrength
      const currentHaloOpacity = HALO_BASE_OPACITY + hoverStrength * 0.16;

      // Scroll-driven warp opacity (fades out as particles fly past camera)
      const scrollOpacity = globeScrollState.opacity !== undefined ? globeScrollState.opacity : 1;

      coreMat.opacity = eased * scrollOpacity;
      haloMat.opacity = eased * (currentHaloOpacity + Math.sin(t * 1.2) * 0.03) * scrollOpacity;

      // Magnetic Parallax Inertial Tilt with smooth damping
      group.rotation.x = Math.sin(t * 0.05) * 0.06 - mouseSmooth.y * 0.14;
      group.rotation.y = t * 0.09 + globeScrollState.offset + mouseSmooth.x * 0.20;

      group.position.y = globeScrollState.yOffset;
      group.position.x = globeScrollState.xOffset;

      // Subtle breathing scale with smooth hover expansion
      const breathe = (1 + Math.sin(t * 0.8) * 0.01) * (1 + hoverStrength * 0.025);
      group.scale.setScalar(breathe * globeScrollState.scale);

      hsCurrent.lerp(hsTarget, 0.10).normalize();

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
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
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
