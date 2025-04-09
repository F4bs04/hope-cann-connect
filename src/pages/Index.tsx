
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import ConditionsSection from '../components/ConditionsSection';
import DoctorsSection from '../components/DoctorsSection';
import CtaSection from '../components/CtaSection';
import BenefitsSection from '../components/BenefitsSection';
import TestimonialSection from '../components/TestimonialSection';
import ProcessSteps from '../components/ProcessSteps';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <BenefitsSection />
        <ConditionsSection />
        <ProcessSteps />
        <DoctorsSection />
        <TestimonialSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
