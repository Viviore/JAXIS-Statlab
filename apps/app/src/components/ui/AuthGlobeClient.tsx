"use client";

import React from "react";
import dynamic from "next/dynamic";

const AuthParticleGlobe = dynamic(
  () => import("./AuthParticleGlobe"),
  {
    ssr: false,
    loading: () => null,
  }
);

export function AuthGlobeClient() {
  return <AuthParticleGlobe />;
}
