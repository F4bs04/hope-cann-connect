
import { supabase } from "@/integrations/supabase/client";

export const getDocumentUrl = async (path: string) => {
  try {
    const { data } = await supabase.storage
      .from('documentos_medicos')
      .getPublicUrl(path);
    
    return data.publicUrl;
  } catch (error) {
    console.error("Erro ao obter URL do documento:", error);
    return null;
  }
};

export const downloadDocument = async (filePath: string, fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('documentos_medicos')
      .download(filePath);
    
    if (error) {
      console.error("Erro ao fazer download do documento:", error);
      return false;
    }
    
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Erro ao fazer download do documento:", error);
    return false;
  }
};
