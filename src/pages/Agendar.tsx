
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HomeScheduling from '../components/home-scheduling/HomeScheduling';

const Agendar = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HomeScheduling />
      </main>
      <Footer />
    </div>
  );
};

export default Agendar;