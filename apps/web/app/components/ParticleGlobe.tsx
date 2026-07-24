"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const POINT_COUNT      = 320;
const SPHERE_RADIUS    = 2.4;
const CONNECT_DISTANCE = 0.92;
const HOTSPOT_COUNT    = 18;

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

function makeCircleTex(size = 64): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

export default function ParticleGlobe() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // ─── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ─── Scene & Camera ──────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // ─── Sphere points ────────────────────────────────────────────────────────
    const positions = fibonacciSphere(POINT_COUNT, SPHERE_RADIUS);

    // Default hotspot direction (left-center, like the reference)
    const hsTarget = new THREE.Vector3(-0.85, -0.15, 0.5).normalize();
    // Current smoothed hotspot direction (lerps toward hsTarget each frame)
    const hsCurrent = hsTarget.clone();

    // ─── Build geometry with dynamic colors ───────────────────────────────────
    const allPos: number[] = [];
    positions.forEach(p => allPos.push(p.x, p.y, p.z));

    const pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute("position", new THREE.Float32BufferAttribute(allPos, 3));

    // Color buffer — will be updated every frame
    const colBuf = new Float32Array(POINT_COUNT * 3);
    const colAttr = new THREE.BufferAttribute(colBuf, 3);
    colAttr.setUsage(THREE.DynamicDrawUsage);
    pointGeo.setAttribute("color", colAttr);

    const circleTex = makeCircleTex();
    const pointMat  = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      map: circleTex,
    });
    const pointMesh = new THREE.Points(pointGeo, pointMat);

    // ─── Network edges (static, built once) ──────────────────────────────────
    const edgePos: number[] = [];
    const edgeCol: number[] = [];
    const colEdgeNormal = new THREE.Color(0x2a4a7a);
    const colEdgeHot    = new THREE.Color(0x882200);

    // We'll identify initial hotspot set for edge colors (static — edges don't move)
    // Just use a fixed direction for edge coloring; the dynamic effect is on dots only
    const initScored = positions.map((p, i) => ({ i, dot: p.clone().normalize().dot(hsTarget) }));
    initScored.sort((a, b) => b.dot - a.dot);
    const initHotSet = new Set(initScored.slice(0, HOTSPOT_COUNT).map(s => s.i));

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        if (dist < CONNECT_DISTANCE) {
          const tf    = 1 - dist / CONNECT_DISTANCE;
          const isHot = initHotSet.has(i) || initHotSet.has(j);
          const base  = (isHot ? colEdgeHot : colEdgeNormal).clone().multiplyScalar(tf * 0.9);
          edgePos.push(positions[i].x, positions[i].y, positions[i].z,
                       positions[j].x, positions[j].y, positions[j].z);
          edgeCol.push(base.r, base.g, base.b, base.r, base.g, base.b);
        }
      }
    }

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePos, 3));
    edgeGeo.setAttribute("color",    new THREE.Float32BufferAttribute(edgeCol, 3));
    const edgeMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const edgeMesh = new THREE.LineSegments(edgeGeo, edgeMat);

    // ─── Group ────────────────────────────────────────────────────────────────
    const group = new THREE.Group();
    group.add(pointMesh, edgeMesh);
    scene.add(group);

    // ─── Color update helper ──────────────────────────────────────────────────
    const colNormal = new THREE.Color(0xaaccff);
    const colHot1   = new THREE.Color(0xff3300);
    const colHot2   = new THREE.Color(0xff7722);

    // Temp vector in group-local space to avoid allocating per frame
    const localDir  = new THREE.Vector3();
    const invQuat   = new THREE.Quaternion();

    function updateColors() {
      // Transform hsCurrent into group's local coordinate space
      invQuat.copy(group.quaternion).invert();
      localDir.copy(hsCurrent).applyQuaternion(invQuat).normalize();

      // Score all points by dot product with local hotspot direction
      const dots = positions.map((p, i) => ({
        i,
        dot: p.clone().normalize().dot(localDir),
      }));
      dots.sort((a, b) => b.dot - a.dot);

      // Paint top N as hotspot, rest as normal
      const hotSet = new Set(dots.slice(0, HOTSPOT_COUNT).map(d => d.i));
      for (let i = 0; i < positions.length; i++) {
        let c: THREE.Color;
        if (hotSet.has(i)) {
          const rank = dots.findIndex(d => d.i === i);
          const t    = rank / HOTSPOT_COUNT;
          c = colHot1.clone().lerp(colHot2, t);
        } else {
          c = colNormal;
        }
        colBuf[i * 3 + 0] = c.r;
        colBuf[i * 3 + 1] = c.g;
        colBuf[i * 3 + 2] = c.b;
      }
      colAttr.needsUpdate = true;
    }

    // ─── Mouse → sphere intersection ─────────────────────────────────────────
    // We track whether the mouse is over the canvas at all
    const mouse     = new THREE.Vector2(9999, 9999); // off-screen by default
    let   isHovered = false;

    const raycaster  = new THREE.Raycaster();
    const sphereObj  = new THREE.Sphere(new THREE.Vector3(0, 0, 0), SPHERE_RADIUS);
    const rayTarget  = new THREE.Vector3();

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)   / rect.height) * 2 + 1;
    };

    const onMouseEnter = () => { isHovered = true; };
    const onMouseLeave = () => { isHovered = false; };

    // Attach to the parent hero section so we get events even through the overlay divs
    const hero = container.parentElement ?? container;
    hero.addEventListener("mousemove",  onMouseMove,  { passive: true });
    hero.addEventListener("mouseenter", onMouseEnter, { passive: true });
    hero.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // ─── Animation ───────────────────────────────────────────────────────────
    let animId: number;
    const clock  = new THREE.Clock();
    const LERP_SPEED = 0.06; // how fast the hotspot chases the cursor

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Slow auto-rotation
      group.rotation.y = t * 0.12;
      group.rotation.x = Math.sin(t * 0.07) * 0.08;

      if (isHovered) {
        // Cast ray from camera into scene
        raycaster.setFromCamera(mouse, camera);
        const ray = raycaster.ray;

        // Test against the bounding sphere (world space = scene origin since group rotation is applied)
        // We test against the UNrotated sphere (radius SPHERE_RADIUS at origin) and then
        // transform the hit point into the group's local space ourselves
        const hit = ray.intersectSphere(sphereObj, rayTarget);
        if (hit) {
          // Convert hit point to group-local normalised direction
          const localHit = rayTarget.clone().applyQuaternion(invQuat).normalize();
          // Lerp current hotspot target toward cursor direction
          hsTarget.lerp(localHit, LERP_SPEED);
          hsTarget.normalize();
        }
      } else {
        // Drift back toward the default rest position smoothly
        const rest = new THREE.Vector3(-0.85, -0.15, 0.5).normalize();
        hsTarget.lerp(rest, 0.02);
        hsTarget.normalize();
      }

      // Smooth the visual position with an additional lag
      hsCurrent.lerp(hsTarget, 0.08);
      hsCurrent.normalize();

      updateColors();

      renderer.render(scene, camera);
    };
    animate();

    // ─── Resize ──────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ─── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      hero.removeEventListener("mousemove",  onMouseMove);
      hero.removeEventListener("mouseenter", onMouseEnter);
      hero.removeEventListener("mouseleave", onMouseLeave);
      renderer.dispose();
      pointGeo.dispose(); pointMat.dispose(); circleTex.dispose();
      edgeGeo.dispose();  edgeMat.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
