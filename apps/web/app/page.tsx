import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import Approach from "./components/sections/Approach";
import Solutions from "./components/sections/Solutions";
import Pricing from "./components/sections/Pricing";
import FAQ from "./components/sections/FAQ";
import FooterCTA from "./components/sections/FooterCTA";

export default function Home() {
  return (
    <div className="site-root">
      <Navbar />
      <main>
        <Hero />
        <Approach />
        <Solutions />
        <Pricing />
        <FAQ />
        <FooterCTA />
      </main>
    </div>
  );
}
