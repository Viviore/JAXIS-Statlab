import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CoreInfrastructure from "./components/CoreInfrastructure";
import Solutions from "./components/Solutions";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import FooterCTA from "./components/FooterCTA";

export default function Home() {
  return (
    <div className="site-root">
      <Navbar />
      <main>
        <Hero />
        <CoreInfrastructure />
        <Solutions />
        <Pricing />
        <FAQ />
        <FooterCTA />
      </main>
    </div>
  );
}
