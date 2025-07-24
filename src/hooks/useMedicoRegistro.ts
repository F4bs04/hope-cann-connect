
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

        // Get user ID from our usuarios table
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          return;
        }

        // Get medico data if exists
        if (userData) {
          const { data: medicoData, error: medicoError } = await supabase
            .from('medicos')
            .select('*')
            .eq('id_usuario', userData.id)
            .single();

          if (!medicoError && medicoData) {
            setMedicoId(medicoData.id.toString());
            
            // Pre-fill form with existing data
            form.setValue('crm', medicoData.crm || '');
            form.setValue('telefone', medicoData.telefone || '');
            form.setValue('especialidade', medicoData.especialidade || '');
            form.setValue('biografia', medicoData.biografia || '');
            
            if (medicoData.foto_perfil) {
              setFotoPreview(medicoData.foto_perfil);
            }
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
      
      // Get user ID from usuarios table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', userInfo.email)
        .single();
      
      if (userError) {
        throw userError;
      }
      
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
          const certFilePath = `certificados/${userData.id}/${certFileName}`;
          
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
          
          // Create document record in the database
          const { error: docError } = await supabase
            .from('documentos')
            .insert({
              tipo: 'certificado_pfx',
              caminho_arquivo: certFilePath,
              descricao: `Certificado PFX de ${userInfo.name || 'médico'}`,
              id_usuario_upload: userData.id
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
      
      // Update or create medico record
      let medicoIdToUse = medicoId;
      
      if (!medicoId) {
        // Create new record if doesn't exist
        const { data: newMedico, error: createError } = await supabase
          .from('medicos')
          .insert({
            id_usuario: userData.id,
            nome: userInfo.name || '',
            crm: data.crm,
            cpf: '', // Required field in the database
            especialidade: data.especialidade,
            biografia: data.biografia || null,
            telefone: data.telefone,
            foto_perfil: fotoUrl,
            status_disponibilidade: true // Now active
          })
          .select()
          .single();
          
        if (createError) {
          throw createError;
        }
        
        medicoIdToUse = newMedico.id.toString();
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('medicos')
          .update({
            crm: data.crm,
            especialidade: data.especialidade,
            biografia: data.biografia || null,
            telefone: data.telefone,
            foto_perfil: fotoUrl,
            status_disponibilidade: true // Now active
          })
          .eq('id', parseInt(medicoId));
          
        if (updateError) {
          throw updateError;
        }
      }
      
      // Save schedule information
      for (const horario of horarios) {
        // Use raw query to insert into the horarios_disponiveis table
        const { error: horariosError } = await supabase
          .from('horarios_disponiveis')
          .insert({
            id_medico: medicoIdToUse ? parseInt(medicoIdToUse) : null,
            dia_semana: horario.dia,
            hora_inicio: horario.horaInicio,
            hora_fim: horario.horaFim
          });
          
        if (horariosError) {
          console.error("Error saving schedule:", horariosError);
          throw horariosError;
        }
      }
      
      // Update usuario status to active
      const { error: statusError } = await supabase
        .from('usuarios')
        .update({
          status: true
        })
        .eq('id', userData.id);
        
      if (statusError) {
        throw statusError;
      }
      
      toast({
        title: "Cadastro concluído com sucesso!",
        description: "Você já pode começar a atender pacientes na plataforma.",
      });
      
      // Redirect to doctor dashboard
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
