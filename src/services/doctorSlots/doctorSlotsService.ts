import { supabase } from '@/integrations/supabase/client';

export interface DoctorSlot {
  id: string;
  doctor_id: string;
  starts_at: string; // ISO string
  ends_at: string;   // ISO string
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

async function getDoctorIdByUserId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar doctor_id:', error);
    return null;
  }
  return data?.id ?? null;
}

function toDateAtTime(date: Date, timeHHmm: string): Date {
  const [h, m] = timeHHmm.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m || 0, 0, 0);
  return d;
}

export const doctorSlotsService = {
  getDoctorIdByUserId,

  async listSlotsForRange(doctorId: string, from: Date, to: Date): Promise<DoctorSlot[]> {
    const { data, error } = await supabase
      .from('doctor_slots')
      .select('*')
      .eq('doctor_id', doctorId)
      .gte('starts_at', from.toISOString())
      .lt('starts_at', to.toISOString())
      .order('starts_at', { ascending: true });

    if (error) {
      console.error('Erro ao listar slots:', error);
      return [];
    }
    return (data as DoctorSlot[]) || [];
  },

  async createSlot(doctorId: string, date: Date, startTimeHHmm: string, durationMin = 30): Promise<DoctorSlot | null> {
    const start = toDateAtTime(date, startTimeHHmm);
    const end = new Date(start.getTime() + durationMin * 60000);

    const { data, error } = await supabase
      .from('doctor_slots')
      .insert({
        doctor_id: doctorId,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        is_available: true,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar slot:', error);
      return null;
    }
    return data as DoctorSlot;
  },

  async deleteSlot(slotId: string): Promise<boolean> {
    const { error } = await supabase
      .from('doctor_slots')
      .delete()
      .eq('id', slotId);

    if (error) {
      console.error('Erro ao excluir slot:', error);
      return false;
    }
    return true;
  }
};
