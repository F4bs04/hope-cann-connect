import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useUnifiedAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PerfilMedico = () => {
  const { id } = useParams();
  const { userProfile } = useAuth();
  const [medico, setMedico] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedico = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Buscar dados do médico nas tabelas atuais
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select(`
            *,
            profiles!inner(*)
          `)
          .eq('id', id)
          .single();

        if (doctorError) {
          console.error('Erro ao buscar médico:', doctorError);
          setError('Médico não encontrado');
          return;
        }

        setMedico(doctorData);
      } catch (err) {
        console.error('Erro geral:', err);
        setError('Erro ao carregar perfil do médico');
      } finally {
        setLoading(false);
      }
    };

    fetchMedico();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hopecann-teal"></div>
        </div>
      </div>
    );
  }

  if (error || !medico) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Médico não encontrado</h2>
            <p className="text-gray-600">{error || 'O perfil solicitado não existe ou não está disponível.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Perfil Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-full bg-hopecann-teal/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-hopecann-teal">
                    {medico.profiles?.full_name?.charAt(0) || 'M'}
                  </span>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    Dr(a). {medico.profiles?.full_name || 'Nome não informado'}
                  </CardTitle>
                  <Badge variant="secondary" className="mb-2">
                    {medico.specialty || 'Especialidade não informada'}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>Atendimento online e presencial</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Sobre o médico</h3>
                  <p className="text-gray-600">
                    {medico.biography || 'Informações sobre o médico não disponíveis no momento.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">CRM</h3>
                  <p className="text-gray-600">{medico.crm || 'CRM não informado'}</p>
                </div>
                
                {medico.profiles?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{medico.profiles.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Consulta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valor da consulta:</span>
                  <span className="font-semibold">
                    {medico.consultation_fee 
                      ? `R$ ${medico.consultation_fee.toFixed(2).replace('.', ',')}` 
                      : 'Valor sob consulta'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Duração: 30-45 minutos</span>
                </div>
              </div>
              <Button className="w-full mt-4" disabled={!medico.is_available}>
                {medico.is_available ? 'Agendar Consulta' : 'Médico indisponível'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-lg font-semibold">5.0</p>
                <p className="text-sm text-gray-600">Baseado em avaliações anteriores</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerfilMedico;