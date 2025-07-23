
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AgendamentoTest } from '../components/test/AgendamentoTest';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';

const Contato = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você implementaria a lógica de envio dos dados
    console.log("Form data submitted:", formData);
    
    // Simular envio bem-sucedido
    setSubmitted(true);
    
    // Resetar formulário
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
    
    // Reset submission status after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };
  
  const contactInfo = [
    {
      icon: Phone,
      title: "Telefone",
      details: ["(11) 99999-9999", "(11) 5555-5555"],
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["contato@hopecann.com", "suporte@hopecann.com"],
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: MapPin,
      title: "Endereço",
      details: ["Av. Paulista, 1000", "São Paulo, SP - 01310-100"],
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Clock,
      title: "Horário de Atendimento",
      details: ["Segunda a Sexta: 8h - 18h", "Sábado: 8h - 12h"],
      color: "bg-purple-100 text-purple-600"
    }
  ];
  
  const faqs = [
    {
      question: "O tratamento com cannabis medicinal é legal no Brasil?",
      answer: "Sim, o tratamento com cannabis medicinal é legal no Brasil desde que prescrito por um médico habilitado e utilizando produtos aprovados ou importados seguindo os trâmites da ANVISA."
    },
    {
      question: "Quais condições médicas podem ser tratadas com cannabis medicinal?",
      answer: "A cannabis medicinal pode ser indicada para diversas condições, incluindo dor crônica, epilepsia, esclerose múltipla, ansiedade, insônia, fibromialgia, entre outras. A avaliação médica determinará se este tratamento é adequado para o seu caso."
    },
    {
      question: "Como funciona a primeira consulta?",
      answer: "Na primeira consulta, nosso médico especialista fará uma avaliação completa do seu histórico médico, sintomas atuais e tratamentos anteriores. Com base nisso, será discutido se o tratamento canábico é adequado e, em caso positivo, será elaborado um plano de tratamento personalizado."
    },
    {
      question: "A cannabis medicinal causa dependência?",
      answer: "Os medicamentos à base de cannabis utilizados na medicina, especialmente aqueles ricos em CBD, têm baixo potencial de dependência. O risco é minimizado quando utilizados sob orientação médica, com dosagens adequadas e para finalidades terapêuticas."
    },
    {
      question: "Os planos de saúde cobrem consultas e medicamentos canábicos?",
      answer: "Atualmente, a maioria dos planos de saúde não cobre consultas específicas para tratamento canábico nem os medicamentos. No entanto, alguns pacientes têm conseguido reembolso ou cobertura via decisões judiciais, especialmente para condições específicas como epilepsia refratária."
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Banner Principal */}
        <section className="bg-hopecann-teal text-white py-16">
          <div className="hopecann-container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Entre em Contato</h1>
            <p className="text-xl text-center max-w-3xl mx-auto text-white/90">
              Estamos aqui para responder suas dúvidas e ajudá-lo a iniciar seu tratamento canábico
            </p>
          </div>
        </section>
        
        {/* Informações de Contato */}
        <section className="py-16 bg-white">
          <div className="hopecann-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white shadow-sm rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 ${info.color} rounded-full flex items-center justify-center mb-4`}>
                    <info.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600">{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Formulário de Contato */}
        <section className="py-16 bg-gray-50">
          <div className="hopecann-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Envie-nos uma mensagem</h2>
                <p className="text-gray-600 mb-6">
                  Preencha o formulário abaixo e nossa equipe entrará em contato com você o mais breve possível.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-1">Nome Completo *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 mb-1">Telefone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-gray-700 mb-1">Assunto *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                        value={formData.subject}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-700 mb-1">Mensagem *</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-hopecann-teal/50"
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {submitted ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Mensagem enviada com sucesso! Em breve entraremos em contato.</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="bg-hopecann-teal text-white px-6 py-3 rounded-full hover:bg-hopecann-teal/90 transition-colors flex items-center gap-2"
                    >
                      <Send className="h-5 w-5" />
                      <span>Enviar Mensagem</span>
                    </button>
                  )}
                </form>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-6">Perguntas Frequentes</h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-semibold mb-3 flex items-start gap-3">
                        <MessageSquare className="h-5 w-5 text-hopecann-teal flex-shrink-0 mt-1" />
                        <span>{faq.question}</span>
                      </h3>
                      <p className="text-gray-700 pl-8">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Seção de teste removida */}
      </main>
      <Footer />
    </div>
  );
};

export default Contato;
