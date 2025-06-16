
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedDeals } from '@/components/FeaturedDeals';
import { DealOfTheDay } from '@/components/DealOfTheDay';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <DealOfTheDay />
        <FeaturedDeals />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
