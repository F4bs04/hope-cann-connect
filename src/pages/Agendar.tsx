
import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DoctorSelection from '../components/scheduling/DoctorSelection';
import DateTimeSelection from '../components/scheduling/DateTimeSelection';
import UserDataForm from '../components/scheduling/UserDataForm';
import ConfirmationScreen from '../components/scheduling/ConfirmationScreen';
import StepsIndicator from '../components/scheduling/StepsIndicator';
import { useConsultationData } from '../hooks/useConsultationData';

const Agendar = () => {
  const {
    step,
    selectedDoctor,
    selectedDate,
    selectedTime,
    formData,
    doctorInfo,
    setSelectedDoctor,
    setSelectedDate,
    setSelectedTime,
    handleFormChange,
    handleNext,
    handleBack,
    handleSubmit,
  } = useConsultationData();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-8 sm:py-12">
        <div className="hopecann-container max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-center">Agende sua Consulta</h1>
          <p className="text-base sm:text-lg text-center text-gray-600 mb-6 sm:mb-10">
            Preencha os dados abaixo para agendar sua consulta com um de nossos especialistas
          </p>
          
          <StepsIndicator currentStep={step} />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
            {step === 1 && (
              <DoctorSelection 
                selectedDoctor={selectedDoctor} 
                onSelectDoctor={setSelectedDoctor} 
                onNext={handleNext} 
              />
            )}
            
            {step === 2 && (
              <DateTimeSelection 
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                setSelectedDate={setSelectedDate}
                setSelectedTime={setSelectedTime}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            
            {step === 3 && (
              <UserDataForm 
                formData={formData}
                handleFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onBack={handleBack}
              />
            )}
            
            {step === 4 && (
              <ConfirmationScreen 
                selectedDoctor={doctorInfo}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Agendar;
