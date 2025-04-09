
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import ConditionsSection from '../components/ConditionsSection';
import DoctorsSection from '../components/DoctorsSection';
import CtaSection from '../components/CtaSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ConditionsSection />
        <DoctorsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
