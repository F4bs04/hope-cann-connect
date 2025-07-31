import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useUnifiedAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Phone, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PerfilMedico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hopecann-teal"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !medico) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto py-8">
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Médico não encontrado</h2>
                <p className="text-gray-600">{error || 'O perfil solicitado não existe ou não está disponível.'}</p>
                <Button 
                  onClick={() => navigate('/medicos')} 
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Médicos
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        {/* Hero Section com informações do médico */}
        <section className="bg-white border-b">
          <div className="container mx-auto py-8">
            <Button 
              onClick={() => navigate('/medicos')} 
              variant="ghost" 
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Médicos
            </Button>
            
            {/* Card principal do médico - design unificado */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-all duration-200">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={medico.profiles?.avatar_url || '/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png'} 
                    alt={medico.profiles?.full_name || 'Médico'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dr(a). {medico.profiles?.full_name || 'Nome não informado'}
                      </h1>
                      <Badge className="bg-hopecann-teal text-white mb-2">
                        Especialista em cannabis medicinal
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>Atendimento online e presencial</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                        <Clock size={12} />
                        Disponível hoje
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-3">
                    {medico.biography || 'Médica graduada pela Universidade Federal de Pernambuco (UFPE) em 2018; Dedicou-se aos estudos do sistema endocanabinoide e suas aplicações clínicas realizando formações nacionais e internacionais nessa área (entre elas, WeCann Academy) desde 2022. Atualmente membra da APMC (Associação Pan-americana de Medicina Canabinoide).'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conteúdo detalhado */}
        <section className="py-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informações detalhadas */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre o médico</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {medico.biography || 'Médica graduada pela Universidade Federal de Pernambuco (UFPE) em 2018; Dedicou-se aos estudos do sistema endocanabinoide e suas aplicações clínicas realizando formações nacionais e internacionais nessa área (entre elas, WeCann Academy) desde 2022. Atualmente membra da APMC (Associação Pan-americana de Medicina Canabinoide).'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informações Profissionais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">CRM</h4>
                        <p className="text-gray-600">{medico.crm || '27383GO'}</p>
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

              {/* Sidebar com informações da consulta */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Consulta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Valor da consulta:</span>
                        <span className="font-semibold text-lg">
                          R$ 150,00
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Duração: 30-45 minutos</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-6 bg-hopecann-teal hover:bg-hopecann-teal/90" 
                      onClick={() => navigate('/agendar')}
                    >
                      Agendar Consulta
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
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PerfilMedico;