
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Puzzle, Zap, Activity, Hand, HelpCircle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const conditions = [
  {
    title: "Ansiedade e Depressão",
    description: "Ajudamos pessoas a recuperarem sua qualidade de vida através do tratamento com cannabis medicinal, proporcionando alívio dos sintomas de ansiedade e depressão.",
    icon: Brain,
    imageSrc: "/lovable-uploads/fdb4047f-8998-45c3-92d1-3af66294139a.png" // Imagem mais adequada para ansiedade/depressão
  },
  {
    title: "Autismo",
    description: "Apoiamos famílias e indivíduos com autismo a encontrarem mais conforto e melhor qualidade de vida através de tratamentos personalizados.",
    icon: Puzzle,
    imageSrc: "/lovable-uploads/85346101-1749-48db-abe2-b28eb3687e1e.png" // Imagem mais adequada para autismo
  },
  {
    title: "Epilepsia",
    description: "Nossa abordagem ajuda no controle de convulsões, permitindo que pacientes com epilepsia vivam com mais segurança e tranquilidade.",
    icon: Zap,
    imageSrc: "/lovable-uploads/54efb4d4-b8e5-4450-be5f-00aadc8c6c37.png" // Imagem mais adequada para epilepsia
  },
  {
    title: "Fibromialgia",
    description: "Oferecemos esperança e alívio para pessoas que convivem com as dores crônicas da fibromialgia, melhorando sua qualidade de vida diária.",
    icon: Activity,
    imageSrc: "/lovable-uploads/83dc9ade-cea8-47db-99de-498db4ce2767.png" // Imagem mais adequada para fibromialgia
  },
  {
    title: "Parkinson",
    description: "Auxiliamos pacientes com Parkinson a manterem sua independência e qualidade de vida através de tratamentos inovadores com cannabis medicinal.",
    icon: Hand,
    imageSrc: "/lovable-uploads/b4f41f98-f9b2-43e0-8610-e1948a67aa51.png" // Imagem mais adequada para Parkinson
  },
  {
    title: "Alzheimer",
    description: "Proporcionamos suporte e esperança para famílias que lidam com Alzheimer, oferecendo tratamentos que podem ajudar a manter a qualidade de vida.",
    icon: HelpCircle,
    imageSrc: "/lovable-uploads/9826141f-2e80-41ba-8792-01e2ed93ac69.png" // Imagem mais adequada para Alzheimer
  }
];

const MedicalConditionsSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="hopecann-container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-hopecann-green">
            Principais condições médicas
          </h2>
          <p className="text-lg text-gray-600">
            Conheça as principais condições em que a cannabis medicinal pode fazer a diferença na vida das pessoas
          </p>
        </div>
        
        <div className="px-4 md:px-8">
          <Carousel
            opts={{
              align: "center",
              loop: true,
              dragFree: true,
              containScroll: "trimSnaps",
              slidesToScroll: 1,
              duration: 2000 // Aumentei a duration para tornar a transição mais lenta
            }}
            plugins={[
              Autoplay({
                delay: 5000, // Aumentei o delay para 5 segundos para girar mais devagar
                stopOnInteraction: false,
                stopOnMouseEnter: false,
                rootNode: (emblaRoot) => emblaRoot.parentElement,
              })
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {conditions.map((condition, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/2">
                  <Card className="overflow-hidden transition-all hover:shadow-lg border-green-100">
                    <div className="relative h-64 md:h-80 bg-gray-200">
                      <img
                        src={condition.imageSrc}
                        alt={condition.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <condition.icon className="w-8 h-8 text-hopecann-teal" />
                        <h3 className="text-2xl font-semibold text-hopecann-green">{condition.title}</h3>
                      </div>
                      <p className="text-gray-600 text-lg">{condition.description}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default MedicalConditionsSection;
