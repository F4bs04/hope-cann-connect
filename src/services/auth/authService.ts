
import { supabase } from "@/integrations/supabase/client";

export const verifyClinicPassword = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('verify_clinic_password', {
      p_email: email,
      p_password: password
    });
    
    if (error) {
      console.error("Erro ao verificar senha da clínica:", error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error("Erro ao verificar senha da clínica:", error);
    return false;
  }
};
