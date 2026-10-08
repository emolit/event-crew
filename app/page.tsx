import Advantages from "@/components/Advantages";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Process from "@/components/Process";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <div id="top">
      <Header />
      <main>
        <Hero />
        <Advantages />
        <Projects />
        <Process />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
