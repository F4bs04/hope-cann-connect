
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "Como funciona o tratamento com cannabis medicinal?",
    answer: "O tratamento com cannabis medicinal envolve a prescrição de medicamentos à base de cannabis por médicos especializados. Após uma avaliação inicial, o médico determina o tipo de produto, dosagem e forma de administração mais adequados para a sua condição específica. O acompanhamento é contínuo para ajustes no tratamento conforme necessário."
  },
  {
    question: "Quais condições médicas podem ser tratadas com cannabis medicinal?",
    answer: "A cannabis medicinal tem sido utilizada para tratar diversas condições, incluindo dor crônica, epilepsia, esclerose múltipla, efeitos colaterais da quimioterapia, ansiedade, insônia, doença de Parkinson, entre outras. No entanto, a eficácia pode variar de pessoa para pessoa."
  },
  {
    question: "É legal usar cannabis medicinal no Brasil?",
    answer: "Sim, a cannabis medicinal é legal no Brasil desde que prescrita por um médico e adquirida conforme as regulamentações da ANVISA. Existem produtos registrados e também a possibilidade de importação de produtos específicos mediante autorização."
  },
  {
    question: "Os medicamentos à base de cannabis causam efeitos psicoativos?",
    answer: "Nem todos os medicamentos à base de cannabis causam efeitos psicoativos. Produtos ricos em CBD (canabidiol) geralmente não causam alterações na percepção. Já os produtos que contêm THC podem causar efeitos psicoativos, mas são utilizados em doses controladas e sob supervisão médica."
  },
  {
    question: "Como posso agendar uma consulta com um médico especializado em cannabis medicinal?",
    answer: "Você pode agendar uma consulta diretamente pelo nosso site, selecionando o médico de sua preferência e a data disponível, ou entrando em contato por telefone. Nossa equipe está pronta para ajudar a encontrar o especialista mais adequado para sua condição."
  },
  {
    question: "O plano de saúde cobre o tratamento com cannabis medicinal?",
    answer: "Atualmente, a maioria dos planos de saúde no Brasil não cobre o tratamento com cannabis medicinal ou a compra dos medicamentos. No entanto, alguns planos podem cobrir as consultas médicas. Recomendamos verificar diretamente com seu plano de saúde."
  }
];

const FAQSection = () => {
  return (
    <section className="hopecann-section py-16 bg-gray-50">
      <div className="hopecann-container">
        <h2 className="hopecann-section-title mb-12">Perguntas Frequentes</h2>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
