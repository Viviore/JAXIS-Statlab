import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CoreInfrastructure from "./components/CoreInfrastructure";
import PixelTransition from "./components/PixelTransition";
import Solutions from "./components/Solutions";
import Pricing from "./components/Pricing";

export default function Home() {
  return (
    <div className="site-root">
      <Navbar />
      <main>
        <Hero />
        <CoreInfrastructure />
        <PixelTransition />
        <Solutions />
        <PixelTransition direction="light-to-dark" />
        <Pricing />
      </main>
    </div>
  );
}
