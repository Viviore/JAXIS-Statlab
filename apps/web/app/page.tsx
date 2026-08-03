import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ParticleGlobe from "./components/ParticleGlobe";
import CoreInfrastructure from "./components/CoreInfrastructure";
import PixelTransition from "./components/PixelTransition";
import Solutions from "./components/Solutions";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import FooterCTA from "./components/FooterCTA";

export default function Home() {
  return (
    <div className="site-root">
      <Navbar />
      <main>
        {/* -- GSAP Pin Trigger -- */}
        <div className="hero-pin-trigger" style={{ position: "relative", width: "100%", height: "100dvh" }}>
          
          {/* -- Animated Wrapper (Scales down at the end of the pin) -- */}
          <div className="hero-intro-wrapper" style={{ position: "relative", width: "100%", height: "100dvh", backgroundColor: "var(--bg-primary)", overflow: "hidden", transformOrigin: "top center", willChange: "transform, filter, border-radius" }}>
            
            {/* -- Shared Background Gradients & 3D Globe for Hero & Intro -- */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 1 }}>
              <ParticleGlobe />
              
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, background: "radial-gradient(ellipse 90% 60% at 50% 110%, rgba(1,22,57,0.80) 0%, rgba(0,4,20,0) 65%)" }} />
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, background: "linear-gradient(to bottom, rgba(0,0,8,0.55) 0%, transparent 20%, transparent 75%, rgba(0,0,8,0.5) 100%)" }} />
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4, background: "radial-gradient(ellipse 62% 56% at 50% 50%, transparent 20%, rgba(0,8,20,0.38) 58%, rgba(0,8,20,0.90) 80%)" }} />
            </div>
            
            <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
              <Hero />
            </div>
          </div>
        </div>

        <CoreInfrastructure />
        <PixelTransition />
        <Solutions />
        <PixelTransition direction="light-to-dark" />
        <Pricing />
        <FAQ />
        <FooterCTA />
      </main>
    </div>
  );
}
