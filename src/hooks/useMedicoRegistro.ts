import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { CadastroMedicoFormValues, cadastroMedicoFormSchema } from '@/schemas/cadastroMedicoSchema';

// Import utilities from external files
// formatCPF will be defined locally as src/utils/formatters.ts is not in the editable file list
import { formatTelefone, formatCRM } from '@/utils/formatters';

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

// Local CPF formatter function
const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '') // Remove all non-digit characters
    .slice(0, 11) // Ensure it's not longer than 11 digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

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
      cpf: '', // Added CPF
      telefone: '',
      especialidade: '',
      biografia: '',
      termoConciencia: false,
      certificado: undefined,
      foto: undefined,
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
        // Redirect to main doctor registration page if not authenticated, 
        // as this hook is for *completing* registration.
        navigate('/cadastro-medico'); 
        return;
      }
      
      const user = session.user;
      if (user) {
        setUserInfo({
          name: user.user_metadata?.full_name,
          email: user.email,
          photoUrl: user.user_metadata?.avatar_url,
          userId: user.id
        });
        
        if (user.user_metadata?.avatar_url && !form.getValues('foto')) {
          setFotoPreview(user.user_metadata.avatar_url);
        }

        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) {
          console.error("Error fetching user data from 'usuarios':", userError);
          // If user record doesn't exist in 'usuarios' table, it's an issue.
          // This could happen if Google Sign-In created an auth.user but the trigger/logic to create a 'usuarios' entry failed.
          // For now, we'll let it proceed, but this part of the flow might need hardening.
          // A robust solution would create the 'usuarios' record here if missing.
          return;
        }

        if (userData) {
          const { data: medicoData, error: medicoError } = await supabase
            .from('medicos')
            .select('*')
            .eq('id_usuario', userData.id)
            .single();

          if (!medicoError && medicoData) {
            setMedicoId(medicoData.id.toString());
            
            form.reset({
              crm: medicoData.crm || '',
              cpf: medicoData.cpf ? formatCPF(medicoData.cpf) : '', // Format CPF for display
              telefone: medicoData.telefone ? formatTelefone(medicoData.telefone) : '',
              especialidade: medicoData.especialidade || '',
              biografia: medicoData.biografia || '',
              termoConciencia: form.getValues('termoConciencia'), // Keep existing form state for this
              certificado: form.getValues('certificado'), // Keep existing file if already staged
              foto: form.getValues('foto'), // Keep existing file if already staged
            });
            
            if (medicoData.foto_perfil && !form.getValues('foto')) {
              setFotoPreview(medicoData.foto_perfil);
            }
          }
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast, form]); // form added to dependency array for reset

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
          form.setValue('certificado', undefined); // Clear invalid file
          setCertificadoNome(null);
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
          form.setValue('foto', undefined); // Clear invalid file
          setFotoPreview(userInfo?.photoUrl || null); // Revert to original or null
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

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(e.target.value);
    form.setValue('cpf', formattedValue);
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
        throw new Error("Informações de usuário não encontradas. Faça login novamente.");
      }
      
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', userInfo.email)
        .single();
      
      if (userError || !userData) {
        console.error("User not found in 'usuarios' table during submit:", userError);
        throw new Error("Usuário não encontrado no sistema. Por favor, contate o suporte.");
      }
      
      let fotoUrl = fotoPreview; // Use existing preview if no new photo uploaded
      if (data.foto instanceof File) { // Check if data.foto is a File object
        const fileExt = data.foto.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `medicos/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, data.foto);
          
        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          throw new Error("Erro ao fazer upload da foto");
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);
          
        fotoUrl = publicUrl;
      }
      
      if (data.certificado instanceof File) { // Check if data.certificado is a File object
        const certFileName = `${crypto.randomUUID()}.pfx`;
        const certFilePath = `certificados/${userData.id}/${certFileName}`;
        
        const { error: certUploadError } = await supabase.storage
          .from('documentos_medicos')
          .upload(certFilePath, data.certificado);
          
        if (certUploadError) {
          console.error("Error uploading certificate:", certUploadError);
          throw new Error("Erro ao fazer upload do certificado");
        }
        
        const { error: docError } = await supabase
          .from('documentos')
          .insert({
            tipo: 'certificado_pfx',
            caminho_arquivo: certFilePath,
            descricao: `Certificado PFX de ${userInfo.name || 'médico'}`,
            id_usuario_upload: userData.id
          });
          
        if (docError) {
          console.error("Error saving certificate record:", docError);
          // Non-fatal, continue
        }
      }
      
      const formattedCpf = data.cpf.replace(/\D/g, '');
      let medicoIdToUse = medicoId;
      
      if (!medicoIdToUse) {
        const { data: newMedico, error: createError } = await supabase
          .from('medicos')
          .insert({
            id_usuario: userData.id,
            nome: userInfo.name || data.crm, // Fallback to CRM if name somehow missing
            crm: data.crm,
            cpf: formattedCpf, // Use formatted CPF
            especialidade: data.especialidade,
            biografia: data.biografia || null,
            telefone: data.telefone,
            foto_perfil: fotoUrl,
            status_disponibilidade: true,
            // aprovado defaults to false in DB
          })
          .select('id') // Select id
          .single();
          
        if (createError) {
          console.error("Error creating medico record:", createError);
          throw createError;
        }
        
        medicoIdToUse = newMedico.id.toString();
      } else {
        const { error: updateError } = await supabase
          .from('medicos')
          .update({
            crm: data.crm,
            cpf: formattedCpf, // Use formatted CPF
            especialidade: data.especialidade,
            biografia: data.biografia || null,
            telefone: data.telefone,
            foto_perfil: fotoUrl,
            status_disponibilidade: true,
            // aprovado is not changed here, managed by admin
          })
          .eq('id', parseInt(medicoIdToUse));
          
        if (updateError) {
          console.error("Error updating medico record:", updateError);
          throw updateError;
        }
      }
      
      // Clear existing horarios for this medico before inserting new ones to avoid duplicates
      // This assumes that schedules are fully replaced each time.
      if (medicoIdToUse) {
          const { error: deleteHorariosError } = await supabase
              .from('horarios_disponiveis')
              .delete()
              .eq('id_medico', parseInt(medicoIdToUse));

          if (deleteHorariosError) {
              console.error("Error clearing existing schedule:", deleteHorariosError);
              // Potentially non-fatal, but could lead to duplicate schedules
          }
      }
      
      for (const horario of horarios) {
        const { error: horariosError } = await supabase
          .from('horarios_disponiveis')
          .insert({
            id_medico: medicoIdToUse ? parseInt(medicoIdToUse) : null, // Should always have medicoIdToUse here
            dia_semana: horario.dia,
            hora_inicio: horario.horaInicio,
            hora_fim: horario.horaFim
          });
          
        if (horariosError) {
          console.error("Error saving schedule:", horariosError);
          // Potentially non-fatal, but worth logging.
        }
      }
      
      const { error: statusError } = await supabase
        .from('usuarios')
        .update({
          status: true // Mark user as active in 'usuarios' table
        })
        .eq('id', userData.id);
        
      if (statusError) {
        console.error("Error updating usuario status:", statusError);
        // Non-fatal
      }
      
      toast({
        title: "Cadastro atualizado!",
        description: "Seus dados foram enviados com sucesso! Seu perfil aguarda aprovação administrativa para ser listado publicamente e você poder atender consultas.",
      });
      
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
    handleCPFChange,
    onSubmit,
    setHorarios,
    setTermoDialogOpen,
    setCertificadoNome,
  };
};
