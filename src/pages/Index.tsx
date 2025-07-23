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
import WhyChooseUs from '../components/WhyChooseUs';
// HomeScheduling removido - agora está apenas na área autenticada
import FAQSection from '../components/FAQSection';
import DoctorCTA from '../components/DoctorCTA';
import MedicalConditionsSection from '../components/MedicalConditionsSection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <WhyChooseUs />
        <ProcessSteps />
        {/* HomeScheduling movido para área autenticada */}
        <BenefitsSection />
        <MedicalConditionsSection />
        {/* We can keep only one of the two conditions sections */}
        {/* <ConditionsSection /> */}
        <DoctorsSection />
        <DoctorCTA />
        <TestimonialSection />
        <FAQSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
