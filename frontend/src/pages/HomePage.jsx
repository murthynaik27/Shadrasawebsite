import Loader from "../components/Loader";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Products from "../components/Products";
import Categories from "../components/Categories";
import About from "../components/About";
import WhyUs from "../components/WhyUs";
import Gallery from "../components/Gallery";
import HeritageVideo from "../components/HeritageVideo";
import TrustCounters from "../components/TrustCounters";
import BusinessCTA from "../components/BusinessCTA";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import FloatingButtons from "../components/FloatingButtons";
import Footer from "../components/Footer";
import { useSiteData } from "../lib/siteData";

export default function HomePage() {
  const site = useSiteData();
  return (
    <div className="bg-[#fdfbf7] min-h-screen" data-testid="home-page">
      <Loader />
      <Navbar />
      <main>
        <Hero content={site.content} banners={site.banners} />
        <Categories categories={site.categories} loading={site.loading} />
        <About content={site.content} />
        <WhyUs />
        <Gallery gallery={site.gallery} />
        <HeritageVideo content={site.content} />
        <TrustCounters content={site.content} />
        <BusinessCTA content={site.content} />
        <Testimonials reviews={site.reviews} />
        <Contact content={site.content} />
      </main>
      <FloatingButtons content={site.content} />
      <Footer content={site.content} />
    </div>
  );
}
