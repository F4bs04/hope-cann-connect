
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
    imageSrc: "https://nxiaxpgyqpmnkmebvvap.supabase.co/storage/v1/object/public/images//ChatGPT%20Image%2024%20de%20abr.%20de%202025,%2015_36_11.png"
  },
  {
    title: "Autismo",
    description: "Apoiamos famílias e indivíduos com autismo a encontrarem mais conforto e melhor qualidade de vida através de tratamentos personalizados.",
    icon: Puzzle,
    imageSrc: "https://nxiaxpgyqpmnkmebvvap.supabase.co/storage/v1/object/public/images//ChatGPT%20Image%2024%20de%20abr.%20de%202025,%2015_22_06.png"
  },
  {
    title: "Epilepsia",
    description: "Nossa abordagem ajuda no controle de convulsões, permitindo que pacientes com epilepsia vivam com mais segurança e tranquilidade.",
    icon: Zap,
    imageSrc: "https://nxiaxpgyqpmnkmebvvap.supabase.co/storage/v1/object/public/images//ChatGPT%20Image%2024%20de%20abr.%20de%202025,%2015_43_03.png"
  },
  {
    title: "Fibromialgia",
    description: "Oferecemos esperança e alívio para pessoas que convivem com as dores crônicas da fibromialgia, melhorando sua qualidade de vida diária.",
    icon: Activity,
    imageSrc: "https://nxiaxpgyqpmnkmebvvap.supabase.co/storage/v1/object/public/images//ChatGPT%20Image%2024%20de%20abr.%20de%202025,%2015_27_03.png"
  },
  {
    title: "Parkinson",
    description: "Auxiliamos pacientes com Parkinson a manterem sua independência e qualidade de vida através de tratamentos inovadores com cannabis medicinal.",
    icon: Hand,
    imageSrc: "https://nxiaxpgyqpmnkmebvvap.supabase.co/storage/v1/object/public/images//ChatGPT%20Image%2024%20de%20abr.%20de%202025,%2015_33_35.png"
  },
  {
    title: "Alzheimer",
    description: "Proporcionamos suporte e esperança para famílias que lidam com Alzheimer, oferecendo tratamentos que podem ajudar a manter a qualidade de vida.",
    icon: HelpCircle,
    imageSrc: "https://nxiaxpgyqpmnkmebvvap.supabase.co/storage/v1/object/public/images//ChatGPT%20Image%2024%20de%20abr.%20de%202025,%2015_54_39.png"
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
              duration: 2000 // Note: embla-carousel 'duration' is typically for animation speed, not autoplay delay. Autoplay delay is configured in the plugin.
            }}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: false, // Default is true, setting to false to keep autoplaying
                stopOnMouseEnter: false,  // Default is false, explicit for clarity
                // rootNode: (emblaRoot) => emblaRoot.parentElement, // This can sometimes cause issues if not needed, let's try without it first or ensure it's correctly used
              }) as any // Cast to any to resolve TypeScript error
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
