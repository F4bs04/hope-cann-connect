
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Medicos = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-16">
        <div className="hopecann-container">
          <h1 className="text-4xl font-bold mb-8">Médicos</h1>
          <p className="text-lg">Conteúdo em desenvolvimento. Volte em breve.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Medicos;
