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
      console.log('=== SALVANDO AGENDA NO SUPABASE ===');
      console.log('Doctor ID:', doctorId);
      console.log('Schedule:', weeklySchedule);

      // Primeiro, deletar todos os horários existentes do médico
      const { error: deleteError } = await supabase
        .from('doctor_schedules')
        .delete()
        .eq('doctor_id', doctorId);

      if (deleteError) {
        console.error('Erro ao deletar horários existentes:', deleteError);
        throw new Error('Falha ao limpar horários existentes');
      }

      // Preparar dados para inserção
      const schedulesToInsert: any[] = [];
      
      weeklySchedule.forEach(daySchedule => {
        if (daySchedule.isActive && daySchedule.slots.length > 0) {
          daySchedule.slots.forEach(slot => {
            if (slot.isActive) {
              schedulesToInsert.push({
                doctor_id: doctorId,
                day_of_week: daySchedule.day,
                start_time: slot.startTime,
                end_time: slot.endTime,
                is_active: true
              });
            }
          });
        }
      });

      console.log('Dados para inserção:', schedulesToInsert);

      // Inserir novos horários se houver algum
      if (schedulesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('doctor_schedules')
          .insert(schedulesToInsert);

        if (insertError) {
          console.error('Erro ao inserir novos horários:', insertError);
          throw new Error('Falha ao salvar novos horários');
        }
      }
      
      console.log('✅ Agenda salva com sucesso no Supabase!');
      return true;

    } catch (error) {
      console.error('❌ Erro ao salvar agenda:', error);
      throw error;
    }
  }

  /**
   * Carregar agenda do médico do Supabase
   */
  static async loadDoctorSchedule(doctorId: string): Promise<DoctorSchedule[]> {
    try {
      console.log('=== CARREGANDO AGENDA DO SUPABASE ===');
      console.log('Doctor ID:', doctorId);

      // Buscar horários do médico na tabela doctor_schedules
      const { data: schedules, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) {
        console.error('Erro ao buscar agenda no Supabase:', error);
        return this.getEmptySchedule();
      }

      console.log('Horários encontrados no Supabase:', schedules);

      // Se não há horários salvos, retornar agenda vazia
      if (!schedules || schedules.length === 0) {
        console.log('Nenhuma agenda configurada encontrada');
        return this.getEmptySchedule();
      }

      // Converter dados do Supabase para o formato DoctorSchedule
      const weeklySchedule = this.getEmptySchedule();
      
      schedules.forEach((schedule: any) => {
        const daySchedule = weeklySchedule.find(day => day.day === schedule.day_of_week);
        if (daySchedule) {
          daySchedule.isActive = true;
          daySchedule.slots.push({
            id: schedule.id,
            dayOfWeek: schedule.day_of_week,
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            isActive: schedule.is_active,
            doctor_id: schedule.doctor_id
          });
        }
      });

      console.log('✅ Agenda carregada com sucesso do Supabase!');
      return weeklySchedule;

    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
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
      console.log('=== LIMPANDO AGENDA DO SUPABASE ===');
      console.log('Doctor ID:', doctorId);

      // Deletar todos os horários do médico
      const { error } = await supabase
        .from('doctor_schedules')
        .delete()
        .eq('doctor_id', doctorId);

      if (error) {
        console.error('Erro ao limpar agenda no Supabase:', error);
        throw new Error('Falha ao limpar agenda');
      }

      console.log('✅ Agenda limpa com sucesso no Supabase!');
      return true;
    } catch (error) {
      console.error('Erro ao limpar agenda:', error);
      throw error;
    }
  }
}

export default DoctorAvailabilityService;
