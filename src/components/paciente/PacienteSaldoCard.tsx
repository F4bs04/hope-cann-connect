
import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PacienteSaldoCardProps {
  pacienteId: number;
}

const PacienteSaldoCard: React.FC<PacienteSaldoCardProps> = ({ pacienteId }) => {
  const [saldo, setSaldo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaldo = async () => {
      if (!pacienteId) return;
      
      try {
        const { data, error } = await supabase
          .from('saldo_pacientes')
          .select('saldo_total')
          .eq('id_paciente', pacienteId)
          .single();
        
        if (error) {
          console.error('Error fetching saldo:', error);
          setSaldo(0);
        } else {
          setSaldo(data?.saldo_total || 0);
        }
      } catch (error) {
        console.error('Error:', error);
        setSaldo(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSaldo();
  }, [pacienteId]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Wallet className="h-5 w-5 text-hopecann-teal mr-2" />
        <span className="text-gray-700 font-medium">Saldo disponível:</span>
      </div>
      
      {loading ? (
        <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        <span className="font-bold text-hopecann-teal">
          R$ {saldo?.toFixed(2).replace('.', ',') || '0,00'}
        </span>
      )}
    </div>
  );
};

export default PacienteSaldoCard;
