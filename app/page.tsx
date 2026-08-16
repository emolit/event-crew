import Advantages from "@/components/Advantages";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Process from "@/components/Process";
import Projects from "@/components/Projects";
import Services from "@/components/Services";

export default function Home() {
  return (
    <div id="top">
      <Header />
      <main>
        <Hero />
        <Services />
        <Advantages />
        <Projects />
        <Process />
        <div aria-hidden="true" className="scroll-mt-24" id="contact" />
      </main>
      <Footer />
    </div>
  );
}
