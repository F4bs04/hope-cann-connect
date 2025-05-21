
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FAQSection from '../components/FAQSection';
import PageContainer from '@/components/layout/PageContainer';

const FAQPage = () => {
  return (
    <PageContainer title="Perguntas Frequentes">
      <FAQSection />
    </PageContainer>
  );
};

export default FAQPage;
