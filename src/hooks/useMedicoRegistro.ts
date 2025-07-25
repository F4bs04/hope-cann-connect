
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { CadastroMedicoFormValues, cadastroMedicoFormSchema } from '@/schemas/cadastroMedicoSchema';

// Types
export interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFim: string;
}

export interface UserInfo {
  name?: string;
  email?: string;
  photoUrl?: string;
  userId?: string;
}

export const useMedicoRegistro = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [termoDialogOpen, setTermoDialogOpen] = useState(false);
  const [certificadoNome, setCertificadoNome] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [horarios, setHorarios] = useState<DiaHorario[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [medicoId, setMedicoId] = useState<string | null>(null);

  const form = useForm<CadastroMedicoFormValues>({
    resolver: zodResolver(cadastroMedicoFormSchema),
    defaultValues: {
      crm: '',
      telefone: '',
      especialidade: '',
      biografia: '',
      termoConciencia: false,
      certificado: undefined, // Include certificado in defaultValues
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Sua sessão expirou ou você não está autenticado. Redirecionando para a página de login.",
        });
        navigate('/cadastro-medico');
        return;
      }
      
      const user = session.user;
      if (user) {
        // Get user info from auth
        setUserInfo({
          name: user.user_metadata?.full_name,
          email: user.email,
          photoUrl: user.user_metadata?.avatar_url,
          userId: user.id
        });
        
        if (user.user_metadata?.avatar_url) {
          setFotoPreview(user.user_metadata.avatar_url);
        }

        // Get doctor data if exists using the new table structure
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!doctorError && doctorData) {
          setMedicoId(doctorData.id);
          
          // Pre-fill form with existing data
          form.setValue('crm', doctorData.crm || '');
          form.setValue('telefone', ''); // Will be filled later
          form.setValue('especialidade', doctorData.specialty || '');
          form.setValue('biografia', doctorData.biography || '');
          
          // Get avatar from profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
            
          if (profileData?.avatar_url) {
            setFotoPreview(profileData.avatar_url);
          }
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'certificado' | 'foto') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (type === 'certificado') {
        if (file.name.endsWith('.pfx')) {
          form.setValue('certificado', file);
          setCertificadoNome(file.name);
        } else {
          toast({
            variant: "destructive",
            title: "Arquivo inválido",
            description: "Apenas certificados PFX são aceitos",
          });
        }
      } else if (type === 'foto') {
        if (file.type.startsWith('image/')) {
          form.setValue('foto', file);
          setFotoPreview(URL.createObjectURL(file));
        } else {
          toast({
            variant: "destructive",
            title: "Arquivo inválido",
            description: "Apenas imagens são aceitas",
          });
        }
      }
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelefone(e.target.value);
    form.setValue('telefone', formattedValue);
  };

  const handleCRMChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCRM(e.target.value);
    form.setValue('crm', formattedValue);
  };

  const onSubmit = async (data: CadastroMedicoFormValues) => {
    console.log('Dados complementares:', data);
    setIsLoading(true);
    
    if (horarios.length === 0) {
      toast({
        variant: "destructive",
        title: "Horários não definidos",
        description: "Você precisa adicionar pelo menos um horário de atendimento",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      if (!userInfo?.email) {
        throw new Error("Informações de usuário não encontradas");
      }
      
      // Get current session to get user_id
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
      }
      
      const currentUserId = session.user.id;
      
      // Upload profile photo if provided
      let fotoUrl = fotoPreview;
      if (data.foto) {
        try {
          console.log("Iniciando upload da foto...");
          const fileExt = data.foto.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `medicos/${fileName}`;
          
          console.log("Arquivo:", { nome: data.foto.name, tamanho: data.foto.size, tipo: data.foto.type });
          console.log("Caminho do upload:", filePath);
          
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('profiles')
            .upload(filePath, data.foto, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            console.error("Erro detalhado no upload:", uploadError);
            throw new Error(`Erro ao fazer upload da foto: ${uploadError.message}`);
          }
          
          console.log("Upload realizado com sucesso:", uploadData);
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);
            
          console.log("URL pública gerada:", publicUrl);
          fotoUrl = publicUrl;
        } catch (photoError: any) {
          console.error("Erro no processo de upload da foto:", photoError);
          toast({
            variant: "destructive",
            title: "Erro no upload da foto",
            description: photoError.message || "Erro desconhecido ao fazer upload da foto",
          });
          throw photoError;
        }
      }
      
      // Upload certificate if provided
      if (data.certificado) {
        try {
          console.log("Iniciando upload do certificado...");
          const certFileName = `${crypto.randomUUID()}.pfx`;
          const certFilePath = `certificados/${currentUserId}/${certFileName}`;
          
          console.log("Certificado:", { nome: data.certificado.name, tamanho: data.certificado.size, tipo: data.certificado.type });
          console.log("Caminho do certificado:", certFilePath);
          
          // Upload certificate to storage
          const { error: certUploadError } = await supabase.storage
            .from('documentos_medicos')
            .upload(certFilePath, data.certificado, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (certUploadError) {
            console.error("Erro detalhado no upload do certificado:", certUploadError);
            throw new Error(`Erro ao fazer upload do certificado: ${certUploadError.message}`);
          }
          
          console.log("Upload do certificado realizado com sucesso");
          
          // Create document record in the new database structure
          const { error: docError } = await supabase
            .from('documents')
            .insert({
              document_type: 'medical_certificate',
              title: `Certificado PFX de ${userInfo.name || 'médico'}`,
              file_path: certFilePath,
              file_bucket: 'documentos_medicos',
              patient_id: currentUserId // Temporary, will be adjusted
            });
            
          if (docError) {
            console.error("Erro ao salvar registro do certificado:", docError);
            // Não joga erro aqui para não bloquear o cadastro por causa do registro do documento
          }
        } catch (certError: any) {
          console.error("Erro no processo de upload do certificado:", certError);
          toast({
            variant: "destructive",
            title: "Erro no upload do certificado",
            description: certError.message || "Erro desconhecido ao fazer upload do certificado",
          });
          // Continua o processo mesmo se o certificado falhar, pois é opcional
        }
      }
      
      // Update profile with avatar if uploaded
      if (fotoUrl) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ avatar_url: fotoUrl })
          .eq('id', currentUserId);
          
        if (profileError) {
          console.error("Error updating profile avatar:", profileError);
        }
      }
      
      // Update or create doctor record in new structure
      let doctorIdToUse = medicoId;
      
      if (!medicoId) {
        // Create new doctor record
        const { data: newDoctor, error: createError } = await supabase
          .from('doctors')
          .insert({
            user_id: currentUserId,
            crm: data.crm,
            cpf: '', // Will be filled in complete registration
            specialty: data.especialidade,
            biography: data.biografia || null,
            consultation_fee: 150.00, // Default fee
            is_available: true,
            is_approved: false // Needs approval
          })
          .select()
          .single();
          
        if (createError) {
          throw createError;
        }
        
        doctorIdToUse = newDoctor.id;
      } else {
        // Update existing doctor record
        const { error: updateError } = await supabase
          .from('doctors')
          .update({
            crm: data.crm,
            specialty: data.especialidade,
            biography: data.biografia || null,
            is_available: true
          })
          .eq('id', medicoId);
          
        if (updateError) {
          throw updateError;
        }
      }
      
      // Save schedule information in new structure
      for (const horario of horarios) {
        // Map Portuguese day names to English enum values
        const dayMapping: Record<string, string> = {
          'segunda-feira': 'monday',
          'terça-feira': 'tuesday',
          'quarta-feira': 'wednesday',
          'quinta-feira': 'thursday',
          'sexta-feira': 'friday',
          'sábado': 'saturday',
          'domingo': 'sunday'
        };
        
        const dayOfWeek = dayMapping[horario.dia.toLowerCase()] || horario.dia.toLowerCase();
        
        const { error: scheduleError } = await supabase
          .from('doctor_schedules')
          .insert({
            doctor_id: doctorIdToUse,
            day_of_week: dayOfWeek,
            start_time: horario.horaInicio,
            end_time: horario.horaFim,
            is_active: true
          });
          
        if (scheduleError) {
          console.error("Error saving schedule:", scheduleError);
          throw scheduleError;
        }
      }
      
      // Update profile role to doctor
      const { error: roleError } = await supabase
        .from('profiles')
        .update({
          role: 'doctor'
        })
        .eq('id', currentUserId);
        
      if (roleError) {
        console.error("Error updating user role:", roleError);
      }
      
      toast({
        title: "Cadastro concluído com sucesso!",
        description: "Seu perfil está completo! Aguarde a aprovação para começar a atender.",
      });
      
      // Force user to be logged in as doctor and redirect
      localStorage.setItem('userType', 'doctor');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', userInfo.email || '');
      localStorage.setItem('userId', currentUserId);
      
      // Redirect to doctor area
      navigate('/area-medico');
      
    } catch (error: any) {
      console.error("Erro ao enviar dados complementares:", error);
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    userInfo,
    fotoPreview,
    certificadoNome,
    termoDialogOpen,
    horarios,
    handleFileChange,
    handleTelefoneChange,
    handleCRMChange,
    onSubmit,
    setHorarios,
    setTermoDialogOpen,
    setCertificadoNome,
  };
};

// Import utilities from external files
import { formatTelefone, formatCRM } from '@/utils/formatters';
