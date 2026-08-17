import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import Approach from "./components/sections/Approach";
import Solutions from "./components/sections/Solutions";
import Pricing from "./components/sections/Pricing";
import FAQ from "./components/sections/FAQ";
import FooterCTA from "./components/sections/FooterCTA";
import ParticlesBackground from "./components/ui/ParticlesBackground";

export default function Home() {
  return (
    <div className="site-root">
      <Navbar />
      <main>
        <Hero />
        <Approach />

        {/* ── Single Unified 3-in-1 White Zone (Solutions + Pricing + FAQ) ── */}
        <div
          id="white-zone"
          style={{
            position: "relative",
            backgroundColor: "#FFFFFF",
            color: "#010114",
            width: "100%",
          }}
        >
          {/* Smooth Dark Approach to White Particle Zone Horizon Transition */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "160px",
              background: `linear-gradient(
                180deg,
                #010114 0%,
                rgba(1, 1, 20, 0.92) 18%,
                rgba(1, 1, 20, 0.70) 36%,
                rgba(1, 1, 20, 0.42) 55%,
                rgba(1, 1, 20, 0.18) 74%,
                rgba(1, 1, 20, 0.04) 90%,
                rgba(255, 255, 255, 0) 100%
              )`,
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Sticky Fullscreen Particles Canvas pinned to viewport for the entire 3 sections */}
          <div
            style={{
              position: "sticky",
              top: 0,
              left: 0,
              width: "100%",
              height: "100vh",
              overflow: "hidden",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <ParticlesBackground
              particleColor="#0284C7"
              lineColor="#0284C7"
              particleCount={120}
              maxDistance={150}
            />
          </div>

          {/* Content Layer sitting on top of the sticky canvas */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              marginTop: "-100vh",
            }}
          >
            <Solutions />
            <Pricing />
            <FAQ />
          </div>
        </div>

        <FooterCTA />
      </main>
    </div>
  );
}
