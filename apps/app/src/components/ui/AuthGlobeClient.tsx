"use client";

import React from "react";
import dynamic from "next/dynamic";

const ParticleGlobe = dynamic(
  () => import("./ParticleGlobe"),
  {
    ssr: false,
    loading: () => null,
  }
);

export function AuthGlobeClient() {
  return <ParticleGlobe layout="auth-crescent" />;
}
