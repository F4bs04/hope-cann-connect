
import React, { ReactNode } from 'react';
import Header from '../Header';
import Footer from '../Footer';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
}

const PageContainer = ({ children, title }: PageContainerProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm">
          {title && <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PageContainer;
