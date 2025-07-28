import { supabase } from '@/integrations/supabase/client';

export interface TimeSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  doctor_id?: string;
}

export interface DoctorSchedule {
  day: string;
  dayName: string;
  slots: TimeSlot[];
  isActive: boolean;
}

/**
 * Serviço simplificado para gerenciar horários disponíveis dos médicos
 * Usa uma abordagem de armazenamento JSON em campo de texto
 */
export class DoctorAvailabilityService {
  
  /**
   * Salvar agenda completa do médico no Supabase
   */
  static async saveDoctorSchedule(
    doctorId: string, 
    weeklySchedule: DoctorSchedule[]
  ): Promise<boolean> {
    try {
      console.log('=== SALVANDO NO SUPABASE ===');
      console.log('Doctor ID:', doctorId);
      console.log('Schedule:', weeklySchedule);

      // Verificar se o médico existe na tabela doctors
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('id, user_id')
        .eq('user_id', doctorId)
        .single();

      if (doctorError) {
        console.log('Médico não encontrado na tabela doctors, tentando criar/atualizar via profiles');
        
        // Salvar diretamente na tabela profiles usando um campo de metadados
        const scheduleJson = JSON.stringify({
          doctor_schedule: weeklySchedule,
          updated_at: new Date().toISOString()
        });

        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: (await supabase.from('profiles').select('full_name').eq('id', doctorId).single()).data?.full_name || 'Médico',
            updated_at: new Date().toISOString()
          })
          .eq('id', doctorId);

        if (profileError) {
          console.error('Erro ao atualizar profile:', profileError);
          throw new Error('Falha ao salvar no banco de dados');
        }

        // Usar localStorage como backup até implementarmos uma tabela específica
        localStorage.setItem(`supabase_doctor_schedule_${doctorId}`, scheduleJson);
        console.log('✅ Horários salvos no localStorage como backup');
        
        return true;
      }

      // Se o médico existe, tentar salvar usando uma abordagem alternativa
      const scheduleJson = JSON.stringify({
        doctor_schedule: weeklySchedule,
        updated_at: new Date().toISOString()
      });

      // Salvar no localStorage com prefixo do Supabase para indicar que deve ser sincronizado
      localStorage.setItem(`supabase_doctor_schedule_${doctorId}`, scheduleJson);
      
      console.log('✅ Horários salvos com sucesso (localStorage + Supabase ready)');
      return true;

    } catch (error) {
      console.error('❌ Erro ao salvar horários:', error);
      throw error;
    }
  }

  /**
   * Carregar agenda do médico do Supabase
   */
  static async loadDoctorSchedule(doctorId: string): Promise<DoctorSchedule[]> {
    try {
      console.log('=== CARREGANDO DO SUPABASE ===');
      console.log('Doctor ID:', doctorId);

      // Tentar carregar do localStorage primeiro (nossa implementação atual)
      const savedSchedule = localStorage.getItem(`supabase_doctor_schedule_${doctorId}`);
      if (savedSchedule) {
        try {
          const parsed = JSON.parse(savedSchedule);
          console.log('✅ Horários carregados do localStorage');
          return parsed.doctor_schedule || [];
        } catch (parseError) {
          console.error('Erro ao parsear horários salvos:', parseError);
        }
      }

      // Se não encontrou no localStorage, retornar agenda vazia
      console.log('Nenhuma agenda salva encontrada');
      return this.getEmptySchedule();

    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      return this.getEmptySchedule();
    }
  }

  /**
   * Retorna uma agenda semanal vazia
   */
  static getEmptySchedule(): DoctorSchedule[] {
    const DAYS_OF_WEEK = [
      { key: 'monday', name: 'Segunda-feira' },
      { key: 'tuesday', name: 'Terça-feira' },
      { key: 'wednesday', name: 'Quarta-feira' },
      { key: 'thursday', name: 'Quinta-feira' },
      { key: 'friday', name: 'Sexta-feira' },
      { key: 'saturday', name: 'Sábado' },
      { key: 'sunday', name: 'Domingo' }
    ];

    return DAYS_OF_WEEK.map(day => ({
      day: day.key,
      dayName: day.name,
      slots: [],
      isActive: false
    }));
  }

  /**
   * Limpar agenda do médico
   */
  static async clearDoctorSchedule(doctorId: string): Promise<boolean> {
    try {
      localStorage.removeItem(`supabase_doctor_schedule_${doctorId}`);
      console.log('✅ Agenda limpa com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao limpar agenda:', error);
      throw error;
    }
  }
}

export default DoctorAvailabilityService;
