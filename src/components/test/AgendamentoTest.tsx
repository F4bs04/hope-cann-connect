import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createConsulta } from '@/services/consultas/consultasService';
import { createHorarioDisponivel } from '@/services/horarios/horariosService';
import { supabase } from '@/integrations/supabase/client';

export const AgendamentoTest = () => {
  const [loading, setLoading] = useState(false);
  const [medicoId, setMedicoId] = useState('5'); // ID do médico de teste criado
  const [pacienteId, setPacienteId] = useState('32'); // ID do paciente de teste criado
  const [dataHora, setDataHora] = useState('');
  const [availableData, setAvailableData] = useState({ medicos: [], pacientes: [] });
  const { toast } = useToast();

  // Carregar dados disponíveis
  useEffect(() => {
    const loadAvailableData = async () => {
      try {
        const { data: medicos } = await supabase
          .from('medicos')
          .select('id, nome')
          .order('id');
        
        const { data: pacientes } = await supabase
          .from('pacientes')
          .select('id, nome')
          .order('id');
        
        setAvailableData({
          medicos: medicos || [],
          pacientes: pacientes || []
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    
    loadAvailableData();
  }, []);

  const testCreateHorario = async () => {
    setLoading(true);
    try {
      const result = await createHorarioDisponivel({
        id_medico: parseInt(medicoId),
        dia_semana: 'segunda-feira',
        hora_inicio: '08:00',
        hora_fim: '17:00'
      });

      if (result.error) {
        toast({
          title: "Erro ao criar horário",
          description: result.error.message || "Erro desconhecido",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Horário criado",
          description: "Horário disponível criado com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testCreateConsulta = async () => {
    if (!dataHora) {
      toast({
        title: "Erro",
        description: "Informe data e hora",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createConsulta({
        id_medico: parseInt(medicoId),
        id_paciente: parseInt(pacienteId),
        data_hora: dataHora,
        motivo: 'Consulta de teste',
        tipo_consulta: 'presencial'
      });

      if (result.error) {
        toast({
          title: "Erro ao criar consulta",
          description: result.error.message || "Erro desconhecido",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Consulta criada",
          description: "Consulta agendada com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Teste de Agendamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Médicos disponíveis:</strong> {availableData.medicos.map(m => `${m.id} (${m.nome})`).join(', ')}<br/>
            <strong>Pacientes disponíveis:</strong> {availableData.pacientes.map(p => `${p.id} (${p.nome})`).join(', ')}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">ID do Médico</label>
          <Input
            type="number"
            value={medicoId}
            onChange={(e) => setMedicoId(e.target.value)}
            placeholder="5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ID do Paciente</label>
          <Input
            type="number"
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
            placeholder="32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Data e Hora</label>
          <Input
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Button 
            onClick={testCreateHorario}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? 'Processando...' : 'Criar Horário Teste'}
          </Button>

          <Button 
            onClick={testCreateConsulta}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processando...' : 'Agendar Consulta'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};