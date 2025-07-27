import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Database integration
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppointmentRow = Database['public']['Tables']['appointments']['Row'];
type AppointmentStatus = Database['public']['Enums']['appointment_status'];
type ConsultationType = Database['public']['Enums']['consultation_type'];

// Status mapping from database to component
const STATUS_MAPPING: Record<AppointmentStatus, 'confirmed' | 'pending' | 'completed' | 'cancelled'> = {
  'scheduled': 'pending',
  'confirmed': 'confirmed',
  'in_progress': 'confirmed',
  'completed': 'completed',
  'cancelled': 'cancelled',
  'no_show': 'cancelled'
};

// Consultation type mapping
const CONSULTATION_TYPE_MAPPING: Record<ConsultationType, string> = {
  'in_person': 'Consulta Presencial',
  'telemedicine': 'Telemedicina',
  'follow_up': 'Retorno',
  'emergency': 'Emergência'
};

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Appointment {
  id: string;
  patient: Patient;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  type: string;
  notes?: string;
  createdAt: string;
}

interface DayAppointments {
  date: string;
  dayName: string;
  appointments: Appointment[];
}

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  completed: { label: 'Realizada', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: AlertCircle }
};

export default function AgendaMedica() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = appointments;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }
    
    if (dateFilter) {
      filtered = filtered.filter(apt => apt.date === dateFilter);
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Get current doctor ID from localStorage or auth
      const doctorId = localStorage.getItem('userId');
      
      if (!doctorId) {
        toast({
          title: "Erro",
          description: "ID do médico não encontrado. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      // Fetch appointments with patient data
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            id,
            profiles (
              full_name,
              email,
              phone,
              avatar_url
            )
          )
        `)
        .eq('doctor_id', doctorId)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar consultas. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Transform database data to component format
      const transformedAppointments: Appointment[] = (appointmentsData || []).map((apt: any) => {
        const scheduledDate = new Date(apt.scheduled_at);
        const endTime = new Date(scheduledDate.getTime() + 60 * 60 * 1000); // Add 1 hour
        
        return {
          id: apt.id,
          patient: {
            id: apt.patient_id,
            name: apt.patients?.profiles?.full_name || 'Nome não informado',
            email: apt.patients?.profiles?.email || 'Email não informado',
            phone: apt.patients?.profiles?.phone || 'Telefone não informado',
            avatar: apt.patients?.profiles?.avatar_url || '/placeholder.svg'
          },
          date: scheduledDate.toISOString().split('T')[0],
          startTime: scheduledDate.toTimeString().slice(0, 5),
          endTime: endTime.toTimeString().slice(0, 5),
          status: STATUS_MAPPING[apt.status as AppointmentStatus] || 'pending',
          type: CONSULTATION_TYPE_MAPPING[apt.consultation_type as ConsultationType] || 'Consulta',
          notes: apt.notes || '',
          createdAt: apt.created_at
        };
      });

      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('Error in fetchAppointments:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar consultas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusIcon = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
    const IconComponent = config.icon;
    return <IconComponent className="h-4 w-4" />;
  };

  const groupAppointmentsByDate = (appointments: Appointment[]): DayAppointments[] => {
    const grouped = appointments.reduce((acc, appointment) => {
      const date = appointment.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          dayName: formatDate(date),
          appointments: []
        };
      }
      acc[date].appointments.push(appointment);
      return acc;
    }, {} as Record<string, DayAppointments>);

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getAppointmentStats = () => {
    const total = filteredAppointments.length;
    const confirmed = filteredAppointments.filter(apt => apt.status === 'confirmed').length;
    const pending = filteredAppointments.filter(apt => apt.status === 'pending').length;
    const completed = filteredAppointments.filter(apt => apt.status === 'completed').length;
    
    return { total, confirmed, pending, completed };
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      // Map component status back to database status
      const dbStatusMapping: Record<string, AppointmentStatus> = {
        'pending': 'scheduled',
        'confirmed': 'confirmed',
        'completed': 'completed',
        'cancelled': 'cancelled'
      };

      const dbStatus = dbStatusMapping[newStatus] || 'scheduled';

      const { error } = await supabase
        .from('appointments')
        .update({ status: dbStatus })
        .eq('id', appointmentId);

      if (error) {
        console.error('Error updating appointment status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status da consulta.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      const updatedAppointments = appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus as any } : apt
      );
      setAppointments(updatedAppointments);
      
      toast({
        title: "Sucesso",
        description: "Status da consulta atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Error in updateAppointmentStatus:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status.",
        variant: "destructive"
      });
    }
  };

  const stats = getAppointmentStats();
  const groupedAppointments = groupAppointmentsByDate(filteredAppointments);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-hopecann-teal" />
            Consultas Marcadas
          </h2>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie as consultas confirmadas pelos pacientes
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{stats.total}</span> consultas
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{stats.confirmed}</span> confirmadas
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-hopecann-teal"
        >
          <option value="all">Todos os status</option>
          <option value="confirmed">Confirmadas</option>
          <option value="pending">Pendentes</option>
          <option value="completed">Realizadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-hopecann-teal"
          placeholder="Filtrar por data"
        />
        {(statusFilter !== 'all' || dateFilter) && (
          <Button
            onClick={() => {
              setStatusFilter('all');
              setDateFilter('');
            }}
            variant="outline"
            size="sm"
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Appointments by Date */}
      {groupedAppointments.length > 0 ? (
        <div className="space-y-6">
          {groupedAppointments.map((dayGroup) => (
            <Card key={dayGroup.date} className="border-hopecann-teal shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {dayGroup.dayName}
                  </CardTitle>
                  <Badge variant="outline">
                    {dayGroup.appointments.length} consulta{dayGroup.appointments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dayGroup.appointments.map((appointment) => {
                  const statusConfig = STATUS_CONFIG[appointment.status];
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div
                      key={appointment.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={appointment.patient.avatar} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {appointment.patient.name}
                              </h4>
                              <Badge className={`${statusConfig.color} text-xs`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{appointment.patient.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                <span>{appointment.patient.phone}</span>
                              </div>
                            </div>
                            
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Tipo:</span>
                              <span className="ml-1 text-gray-600">{appointment.type}</span>
                            </div>
                            
                            {appointment.notes && (
                              <div className="text-sm mt-2">
                                <span className="font-medium text-gray-700">Observações:</span>
                                <p className="text-gray-600 mt-1">{appointment.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          {appointment.status === 'pending' && (
                            <Button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          
                          {appointment.status === 'confirmed' && (
                            <Button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              size="sm"
                              variant="outline"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marcar como Realizada
                            </Button>
                          )}
                          
                          <select
                            value={appointment.status}
                            onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                            className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-hopecann-teal"
                          >
                            <option value="pending">Pendente</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="completed">Realizada</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma consulta encontrada</h3>
            <p className="text-gray-600">
              {statusFilter !== 'all' || dateFilter 
                ? 'Nenhuma consulta corresponde aos filtros selecionados.' 
                : 'Ainda não há consultas marcadas pelos pacientes.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo das Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-hopecann-teal">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Consultas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-600">Confirmadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Realizadas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}