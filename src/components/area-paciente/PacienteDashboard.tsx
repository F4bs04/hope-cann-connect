
import React, { useState, useEffect } from 'react';
import { CalendarDays, FileText, HeartPulse } from 'lucide-react';
import ReceitasRecentes from "@/components/paciente/ReceitasRecentes";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CardData {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

const CARD_DATA: CardData[] = [
  {
    label: "Próxima Consulta",
    value: "25/04 às 14:00",
    icon: <CalendarDays className="w-6 h-6 text-hopecann-teal" />,
    colorClass: "bg-hopecann-teal/10",
  },
  {
    label: "Consultas Pendentes",
    value: "2",
    icon: <HeartPulse className="w-6 h-6 text-hopecann-green" />,
    colorClass: "bg-hopecann-green/10",
  },
  {
    label: "Novos Documentos",
    value: "1 receita",
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    colorClass: "bg-blue-100",
  },
];

const PacienteDashboard = () => {
  const [receitas, setReceitas] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchReceitas = async () => {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;
      
      try {
        const { data, error } = await supabase
          .from('receitas_app')
          .select('*')
          .eq('email_paciente', userEmail)
          .order('data', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        if (data) setReceitas(data);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast({
          title: "Erro ao carregar receitas",
          description: "Não foi possível carregar suas receitas.",
          variant: "destructive"
        });
      }
    };
    
    fetchReceitas();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 mb-2">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-4">Resumo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CARD_DATA.map((card) => (
              <div
                key={card.label}
                className={`rounded-xl p-5 flex items-center gap-3 shadow-sm ${card.colorClass}`}
              >
                <span>{card.icon}</span>
                <div>
                  <div className="font-semibold text-lg text-gray-800">
                    {card.value}
                  </div>
                  <div className="text-gray-500 text-sm">{card.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <ReceitasRecentes receitas={receitas} />
      </div>
    </div>
  );
};

export default PacienteDashboard;
