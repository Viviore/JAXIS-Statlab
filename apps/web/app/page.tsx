import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ParticleGlobe from "./components/ParticleGlobe";
import JaxisIntro from "./components/JaxisIntro";
import CoreInfrastructure from "./components/CoreInfrastructure";
import PixelTransition from "./components/PixelTransition";
import Solutions from "./components/Solutions";
import Pricing from "./components/Pricing";
import FooterCTA from "./components/FooterCTA";

export default function Home() {
  return (
    <div className="site-root">
      <Navbar />
      <main>
        <div className="hero-intro-wrapper" style={{ position: "relative", backgroundColor: "var(--bg-primary)" }}>
          {/* ── Shared Background Gradients & 3D Globe for Hero & Intro ── */}
          <div style={{ position: "sticky", top: 0, height: "100vh", width: "100%", overflow: "hidden", zIndex: 1 }}>
            <ParticleGlobe />
            
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, background: "radial-gradient(ellipse 90% 60% at 50% 110%, rgba(1,22,57,0.80) 0%, rgba(0,4,20,0) 65%)" }} />
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, background: "linear-gradient(to bottom, rgba(0,0,8,0.55) 0%, transparent 20%, transparent 75%, rgba(0,0,8,0.5) 100%)" }} />
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4, background: "radial-gradient(ellipse 62% 56% at 50% 50%, transparent 20%, rgba(0,8,20,0.38) 58%, rgba(0,8,20,0.90) 80%)" }} />
          </div>
          
          <div style={{ position: "relative", zIndex: 10, marginTop: "-100vh" }}>
            <Hero />
            <JaxisIntro />
          </div>
        </div>
        <CoreInfrastructure />
        <PixelTransition />
        <Solutions />
        <PixelTransition direction="light-to-dark" />
        <Pricing />
        <FooterCTA />
      </main>
    </div>
  );
}
