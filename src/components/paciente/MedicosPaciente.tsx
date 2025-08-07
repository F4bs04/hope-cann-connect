
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useUnifiedAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Stethoscope, Calendar, MessageCircle } from 'lucide-react';
import ChatMedicoTexto from '@/components/chat/ChatMedicoTexto';

interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  crm: string;
  profile: {
    full_name: string;
    avatar_url?: string;
  };
  appointment_count: number;
  last_appointment: string;
}

const MedicosPaciente: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile) {
      fetchDoctorsFromAppointments();
    }
  }, [userProfile]);

  const fetchDoctorsFromAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar médicos através das consultas do paciente
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          doctor_id,
          scheduled_at,
          status,
          doctor:doctors!inner(
            id,
            user_id,
            specialty,
            crm,
            profile:profiles!inner(
              full_name,
              avatar_url
            )
          ),
          patient:patients!inner(
            user_id
          )
        `)
        .eq('patient.user_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Agrupar por médico e contar consultas
      const doctorMap = new Map<string, Doctor>();
      
      appointmentsData?.forEach((appointment: any) => {
        const doctorId = appointment.doctor.id;
        const doctor = appointment.doctor;
        
        if (doctorMap.has(doctorId)) {
          const existingDoctor = doctorMap.get(doctorId)!;
          existingDoctor.appointment_count += 1;
        } else {
          doctorMap.set(doctorId, {
            id: doctor.id,
            user_id: doctor.user_id,
            specialty: doctor.specialty,
            crm: doctor.crm,
            profile: doctor.profile,
            appointment_count: 1,
            last_appointment: appointment.scheduled_at
          });
        }
      });

      setDoctors(Array.from(doctorMap.values()));
    } catch (err: any) {
      console.error('Erro ao buscar médicos:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Carregando médicos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Erro: {error}</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-lg font-medium">Nenhum médico encontrado</p>
        <p className="text-sm">Você ainda não tem consultas marcadas com médicos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Stethoscope className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Meus Médicos</h2>
        <Badge variant="secondary">{doctors.length}</Badge>
      </div>

      <div className="grid gap-4">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {doctor.profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'DR'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">
                    Dr. {doctor.profile.full_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {doctor.specialty} • CRM: {doctor.crm}
                  </p>
                </div>

                <Badge variant="outline" className="ml-auto">
                  {doctor.appointment_count} consulta{doctor.appointment_count !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Última consulta: {new Date(doctor.last_appointment).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Iniciar Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ChatMedicoTexto
            doctor={selectedDoctor}
            onClose={() => setSelectedDoctor(null)}
          />
        </div>
      )}
    </div>
  );
};

export default MedicosPaciente;
