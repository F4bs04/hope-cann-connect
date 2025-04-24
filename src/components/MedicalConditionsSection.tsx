
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

const conditions = [
  {
    title: "Ansiedade e Depressão",
    description: "Ajudamos pessoas a recuperarem sua qualidade de vida através do tratamento com cannabis medicinal, proporcionando alívio dos sintomas de ansiedade e depressão.",
    icon: Brain,
    imageSrc: "/lovable-uploads/4c61ba35-b917-48df-a2d5-424e22a77db2.png"
  },
  {
    title: "Autismo",
    description: "Apoiamos famílias e indivíduos com autismo a encontrarem mais conforto e melhor qualidade de vida através de tratamentos personalizados.",
    icon: Puzzle,
    imageSrc: "/lovable-uploads/38500e89-61f6-4f91-902b-2b4d1b1bb1ba.png"
  },
  {
    title: "Epilepsia",
    description: "Nossa abordagem ajuda no controle de convulsões, permitindo que pacientes com epilepsia vivam com mais segurança e tranquilidade.",
    icon: Zap,
    imageSrc: "/lovable-uploads/3ad8bd40-7607-47d2-a32d-7c5a0e8286fb.png"
  },
  {
    title: "Fibromialgia",
    description: "Oferecemos esperança e alívio para pessoas que convivem com as dores crônicas da fibromialgia, melhorando sua qualidade de vida diária.",
    icon: Activity,
    imageSrc: "/lovable-uploads/4357c3c3-e33d-4756-b440-f505e4170615.png"
  },
  {
    title: "Parkinson",
    description: "Auxiliamos pacientes com Parkinson a manterem sua independência e qualidade de vida através de tratamentos inovadores com cannabis medicinal.",
    icon: Hand,
    imageSrc: "/lovable-uploads/906d320d-17b6-4919-8bd3-30ecf3d226e7.png"
  },
  {
    title: "Alzheimer",
    description: "Proporcionamos suporte e esperança para famílias que lidam com Alzheimer, oferecendo tratamentos que podem ajudar a manter a qualidade de vida.",
    icon: HelpCircle,
    imageSrc: "/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png"
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
              autoplay: true,
              interval: 4000
            }}
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

