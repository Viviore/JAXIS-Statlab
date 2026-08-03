"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { globeScrollState } from "./globeState";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Tuning ───────────────────────────────────────────────────────────────────
const POINT_COUNT      = 480;
const SPHERE_RADIUS    = 2.4;
const CONNECT_DISTANCE = 0.78;
const HOTSPOT_COUNT    = 32;

const REST_DIR = new THREE.Vector3(0, 0, 1).normalize();

// ─── Palette ──────────────────────────────────────────────────────────────────
const COL_NORMAL_NEAR = new THREE.Color(0x6ab4e8);   // front-face, ice-blue
const COL_NORMAL_FAR  = new THREE.Color(0x091828);   // back-face, near-black
const COL_HOT_CORE    = new THREE.Color(0xff6010);   // hotspot centre, vivid orange
const COL_HOT_EDGE    = new THREE.Color(0xffd060);   // hotspot rim, warm gold
const COL_EDGE_NORMAL = new THREE.Color(0x1e4a7c);
const COL_EDGE_HOT    = new THREE.Color(0x993010);

// ─── Texture factories ────────────────────────────────────────────────────────

/** Sharp core dot — tight bright centre for the crisp layer */
function makeCoreGlowTex(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  g.addColorStop(0,    "rgba(255,255,255,1.0)");
  g.addColorStop(0.25, "rgba(255,255,255,0.95)");
  g.addColorStop(0.55, "rgba(255,255,255,0.35)");
  g.addColorStop(0.85, "rgba(255,255,255,0.05)");
  g.addColorStop(1,    "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

/** Wide feathered halo — large soft bloom for the glow layer */
function makeHaloTex(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  g.addColorStop(0,    "rgba(255,255,255,0.55)");
  g.addColorStop(0.2,  "rgba(255,255,255,0.30)");
  g.addColorStop(0.5,  "rgba(255,255,255,0.10)");
  g.addColorStop(0.8,  "rgba(255,255,255,0.025)");
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

// ─── Module-scope geometry (computed once at module load, not per mount) ──────────
type EdgePair = { a: number; b: number };

const positions = fibonacciSphere(POINT_COUNT, SPHERE_RADIUS);
const normals   = positions.map(p => p.clone().normalize());

const edgePairs: EdgePair[] = [];
for (let i = 0; i < positions.length; i++) {
  for (let j = i + 1; j < positions.length; j++) {
    if (positions[i]!.distanceTo(positions[j]!) < CONNECT_DISTANCE) {
      edgePairs.push({ a: i, b: j });
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────────
export default function ParticleGlobe() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // ── Renderer ─────────────────────────────────────────────────────────────
    // Check if WebGL is supported before initializing to prevent console.error from Next.js overlay
    let isWebGLSupported = false;
    try {
      const testCanvas = document.createElement('canvas');
      isWebGLSupported = !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
    } catch (e) {
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
    } catch (e) {
      console.warn("WebGL renderer failed to initialize. Displaying fallback.");
      const fallbackMsg = document.createElement("div");
      fallbackMsg.style.position = "absolute";
      fallbackMsg.style.inset = "0";
      fallbackMsg.style.display = "flex";
      fallbackMsg.style.alignItems = "center";
      fallbackMsg.style.justifyContent = "center";
      fallbackMsg.style.color = "var(--text-muted)";
      fallbackMsg.style.fontFamily = "var(--font-inter)";
      fallbackMsg.style.fontSize = "0.75rem";
      fallbackMsg.style.letterSpacing = "2px";
      fallbackMsg.style.textTransform = "uppercase";
      fallbackMsg.style.background = "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(204,102,0,0.05) 0%, transparent 100%)";
      fallbackMsg.innerHTML = "<span style='color: var(--accent-orange)'>[WARN]</span> WEBGL_CONTEXT_FAILED // 3D_VISUALIZATION_OFFLINE";
      container.appendChild(fallbackMsg);
      return;
    }

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, initW / initH, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // ── Geometry ───────────────────────────────────────────────────────────────────────
    const hsTarget  = REST_DIR.clone();
    const hsCurrent = REST_DIR.clone();
    let   isHovered = false;

    // Flat position buffer shared by both particle layers
    const allPos: number[] = [];
    positions.forEach(p => allPos.push(p.x, p.y, p.z));

    // Shared colour buffer — both layers read from the same colour values
    const colBuf  = new Float32Array(POINT_COUNT * 3);
    const colAttr = new THREE.BufferAttribute(colBuf, 3);
    colAttr.setUsage(THREE.DynamicDrawUsage);

    // ── Layer 1: sharp core dots ──────────────────────────────────────────────
    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute("position", new THREE.Float32BufferAttribute(allPos, 3));
    coreGeo.setAttribute("color",    colAttr);

    const coreTex = makeCoreGlowTex(128);
    const coreMat = new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      transparent: true,
      opacity: 0,           // start invisible — fades in via the animation loop
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: coreTex,
      alphaTest: 0.001,
    });
    const coreMesh = new THREE.Points(coreGeo, coreMat);

    // ── Layer 2: wide halo bloom ──────────────────────────────────────────────
    // Same geometry/colours — just a much larger, semi-transparent overlay
    const haloGeo = new THREE.BufferGeometry();
    haloGeo.setAttribute("position", new THREE.Float32BufferAttribute(allPos, 3));
    haloGeo.setAttribute("color",    colAttr);   // same colour buffer — stays in sync

    const haloTex = makeHaloTex(256);
    const haloMat = new THREE.PointsMaterial({
      size: 0.72,
      vertexColors: true,
      transparent: true,
      opacity: 0,           // start invisible
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: haloTex,
      alphaTest: 0.001,
    });
    const haloMesh = new THREE.Points(haloGeo, haloMat);

    // ── Edges ─────────────────────────────────────────────────────────────────────────
    const edgePosArr = new Float32Array(edgePairs.length * 6);
    const edgeColArr = new Float32Array(edgePairs.length * 6);
    edgePairs.forEach(({ a, b }, ei) => {
      const base = ei * 6;
      edgePosArr[base + 0] = positions[a]!.x; edgePosArr[base + 1] = positions[a]!.y; edgePosArr[base + 2] = positions[a]!.z;
      edgePosArr[base + 3] = positions[b]!.x; edgePosArr[base + 4] = positions[b]!.y; edgePosArr[base + 5] = positions[b]!.z;
    });

    const edgeGeo     = new THREE.BufferGeometry();
    const edgeColAttr = new THREE.BufferAttribute(edgeColArr, 3);
    edgeColAttr.setUsage(THREE.DynamicDrawUsage);
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(edgePosArr, 3));
    edgeGeo.setAttribute("color",    edgeColAttr);

    const edgeMat  = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0, // start invisible
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);

    // ── Group — render order: edges → halo → core ─────────────────────────────
    const group = new THREE.Group();
    group.add(edgeMesh, haloMesh, coreMesh);
    scene.add(group);

    // ── Color update ──────────────────────────────────────────────────────────
    const invQuat  = new THREE.Quaternion();
    const localDir = new THREE.Vector3();
    const camDir   = new THREE.Vector3(0, 0, 1);
    const camLocal = new THREE.Vector3();
    const tmpC     = new THREE.Color();

    function updateColors() {
      // Dynamically calculate camera direction relative to the globe's position
      camDir.subVectors(camera.position, group.position).normalize();

      invQuat.copy(group.quaternion).invert();
      localDir.copy(hsCurrent).applyQuaternion(invQuat).normalize();
      camLocal.copy(camDir).applyQuaternion(invQuat).normalize();

      const scored = normals.map((n, i) => ({
        i,
        hotDot:   n.dot(localDir),
        depthDot: n.dot(camLocal),
      }));
      scored.sort((a, b) => b.hotDot - a.hotDot);

      const hotRank = new Map<number, number>();
      // Build O(1) depth lookup at the same time to avoid scored.find() in the loop
      const depthLookup = new Map<number, number>();
      scored.forEach((s, rank) => {
        depthLookup.set(s.i, s.depthDot);
        if (rank < HOTSPOT_COUNT) hotRank.set(s.i, rank);
      });

      // — Points — O(n) total, no inner search
      for (let i = 0; i < positions.length; i++) {
        const depthDot = depthLookup.get(i) ?? 0;
        const rank     = hotRank.get(i);

        if (rank !== undefined) {
          const t           = rank / (HOTSPOT_COUNT - 1);
          const depthFactor = 0.60 + 0.40 * Math.max(0, depthDot);
          tmpC.lerpColors(COL_HOT_CORE, COL_HOT_EDGE, t).multiplyScalar(depthFactor);
        } else {
          const depthFactor = Math.max(0, depthDot);
          tmpC.lerpColors(COL_NORMAL_FAR, COL_NORMAL_NEAR, depthFactor);
        }
        colBuf[i * 3]     = tmpC.r;
        colBuf[i * 3 + 1] = tmpC.g;
        colBuf[i * 3 + 2] = tmpC.b;
      }
      colAttr.needsUpdate = true;   // propagates to both coreGeo and haloGeo

      // — Edges —
      edgePairs.forEach(({ a, b }, ei) => {
        const aHot  = hotRank.has(a);
        const bHot  = hotRank.has(b);
        const base  = ei * 6;
        const baseC = aHot || bHot ? COL_EDGE_HOT : COL_EDGE_NORMAL;
        const dA    = Math.max(0, depthLookup.get(a) ?? 0);
        const dB    = Math.max(0, depthLookup.get(b) ?? 0);
        const sA    = (aHot || bHot) ? (0.55 + 0.45 * dA) : dA;
        const sB    = (aHot || bHot) ? (0.55 + 0.45 * dB) : dB;
        edgeColArr[base]     = baseC.r * sA; edgeColArr[base + 1] = baseC.g * sA; edgeColArr[base + 2] = baseC.b * sA;
        edgeColArr[base + 3] = baseC.r * sB; edgeColArr[base + 4] = baseC.g * sB; edgeColArr[base + 5] = baseC.b * sB;
      });
      edgeColAttr.needsUpdate = true;
    }

    // ── Mouse tracking ────────────────────────────────────────────────────────
    const mouse     = new THREE.Vector2(9999, 9999);
    const raycaster = new THREE.Raycaster();
    const sphereObj = new THREE.Sphere(new THREE.Vector3(0, 0, 0), SPHERE_RADIUS);
    const rayTarget = new THREE.Vector3();

    let eventRoot: Element = container;
    let el: Element | null = container.parentElement;
    while (el) {
      const tag = el.tagName.toLowerCase();
      if (tag === "section" || tag === "main" || tag === "body") { eventRoot = el; break; }
      el = el.parentElement;
    }

    const onMouseMove  = (evt: Event) => {
      const e = evt as MouseEvent;
      const rect = eventRoot.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    };
    const onMouseEnter = () => { isHovered = true; };
    const onMouseLeave = () => { isHovered = false; mouse.set(9999, 9999); };

    eventRoot.addEventListener("mousemove",  onMouseMove,  { passive: true });
    eventRoot.addEventListener("mouseenter", onMouseEnter, { passive: true });
    eventRoot.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // ── GSAP ScrollTrigger (Removed in favor of centralized animation in Hero.tsx) ──

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number;
    const clock = new THREE.Clock();

    // ── Intro fade-in (handled in loop — immune to CSS/hydration timing issues) ─
    // FADE_DURATION: how long (seconds) the globe takes to reach full opacity
    const FADE_DURATION     = 2.0;
    const HALO_MAX_OPACITY  = 0.38;
    const EDGE_MAX_OPACITY  = 0.65;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth intro ramp: 0→1 over FADE_DURATION seconds
      const introProgress = Math.min(1, t / FADE_DURATION);
      // Ease-out curve for a premium feel
      const eased = 1 - Math.pow(1 - introProgress, 3);

      coreMat.opacity  = eased;
      haloMat.opacity  = eased * HALO_MAX_OPACITY;
      edgeMat.opacity  = eased * EDGE_MAX_OPACITY;

      group.rotation.y = t * 0.10 + globeScrollState.offset;
      group.rotation.x = Math.sin(t * 0.06) * 0.07;
      
      group.position.y = globeScrollState.yOffset;
      group.position.x = globeScrollState.xOffset;

      // Breathing scale
      const breathe = 1 + Math.sin(t * 0.9) * 0.012;
      group.scale.setScalar(breathe * globeScrollState.scale);

      // Bug fix: pulse must be scaled by eased so halo stays at 0 during intro.
      // Previously this line overwrote the fade-in, causing immediate 0.34 opacity on frame 1.
      haloMat.opacity = eased * (HALO_MAX_OPACITY + Math.sin(t * 1.1) * 0.06);

      if (isHovered) {
        raycaster.setFromCamera(mouse, camera);
        const hit = raycaster.ray.intersectSphere(sphereObj, rayTarget);
        if (hit) {
          hsTarget.lerp(rayTarget.clone().normalize(), 0.28).normalize();
        }
      } else {
        hsTarget.lerp(REST_DIR, 0.022).normalize();
      }
      hsCurrent.lerp(hsTarget, 0.12).normalize();

      updateColors();
      renderer.render(scene, camera);
    };
    // ── Reduced motion: static render, skip animation loop ───────────────────
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      coreMat.opacity  = 1;
      haloMat.opacity  = HALO_MAX_OPACITY;
      edgeMat.opacity  = EDGE_MAX_OPACITY;
      group.rotation.y = 0;
      updateColors();
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // ── Resize ─────────────────────────────────────────────────────────────────────────────
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
      eventRoot.removeEventListener("mousemove",  onMouseMove);
      eventRoot.removeEventListener("mouseenter", onMouseEnter);
      eventRoot.removeEventListener("mouseleave", onMouseLeave);
      renderer.dispose();
      coreGeo.dispose(); coreMat.dispose(); coreTex.dispose();
      haloGeo.dispose(); haloMat.dispose(); haloTex.dispose();
      edgeGeo.dispose(); edgeMat.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
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
