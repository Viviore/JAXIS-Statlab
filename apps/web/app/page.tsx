import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CoreInfrastructure from "./components/CoreInfrastructure";
import PixelTransition from "./components/PixelTransition";
import Solutions from "./components/Solutions";

export default function Home() {
  return (
    <div className="site-root">
      <Navbar />
      <main>
        <Hero />
        <CoreInfrastructure />
        <PixelTransition />
        <Solutions />
      </main>
    </div>
  );
}
