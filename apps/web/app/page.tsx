import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CoreInfrastructure from "./components/CoreInfrastructure";

export default function Home() {
  return (
    <div className="site-root">
      <Navbar />
      <main>
        <Hero />
        <CoreInfrastructure />
      </main>
    </div>
  );
}
