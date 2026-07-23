import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import WorkflowStepper from "./components/WorkflowStepper";
import SecurityGates from "./components/SecurityGates";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#010114] text-white selection:bg-[#CC6600] selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section with 3D Motion Telemetry */}
        <Hero />

        {/* Enterprise Compliance & Trust Bar */}
        <TrustBar />

        {/* Master 9-Stage Operational Workflow Stepper */}
        <WorkflowStepper />

        {/* Security, Payment Release Gates & Fraud Prevention */}
        <SecurityGates />

        {/* Enterprise Quotation & Pricing Tiers */}
        <Pricing />
      </main>

      {/* Footer & Sitemap */}
      <Footer />
    </div>
  );
}
