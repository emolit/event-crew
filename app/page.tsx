import Advantages from "@/components/Advantages";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Process from "@/components/Process";
import Projects from "@/components/Projects";
import { getPublicContent } from "@/lib/content/repository";

export const dynamic = "force-dynamic";
export default async function Home() {
  const content = await getPublicContent();
  return (
    <div id="top">
      <Header />
      <main>
        <Hero content={content.homepage} />
        <Advantages />
        <Projects projects={content.projects} />
        <Process />
        <ContactForm />
      </main>
      <Footer clients={content.clients} content={content.footer} />
    </div>
  );
}
