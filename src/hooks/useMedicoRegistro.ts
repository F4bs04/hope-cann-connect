
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

  // Função para criar um novo usuário quando um usuário autenticado via Google não existe no banco
  const createNewUser = async (user: any) => {
    try {
      console.log('Criando novo usuário a partir da autenticação OAuth...');
      
      // Criar o registro na tabela usuarios
      // Gerar uma senha aleatória para o requisito do campo na tabela
      // (Essa senha não será usada já que o login é feito via Google)
      const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      
      const { data: newUser, error: createError } = await supabase
        .from('usuarios')
        .insert({
          email: user.email,
          senha: tempPassword, // Campo obrigatório na tabela
          tipo_usuario: 'medico', // Como estamos na página de registro médico
          status: false // Ainda precisa completar o registro
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Erro ao criar usuário:', createError);
        toast({
          variant: "destructive",
          title: "Erro ao criar usuário",
          description: "Não foi possível criar seu registro. Por favor, tente novamente.",
        });
        return;
      }
      
      toast({
        title: "Usuário criado com sucesso",
        description: "Por favor, complete seu perfil médico.",
      });
      
      // Recarregar a página para iniciar o fluxo de preenchimento do perfil
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar seu registro.",
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Verificando autenticação...');
      
      // Obter a sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      // Log para debug
      console.log('Sessão encontrada:', !!session);
      
      if (!session) {
        // Se não houver sessão, verificar se estamos numa URL com hash de autenticação
        // Isso é comum em redirecionamentos OAuth
        if (window.location.hash) {
          console.log('Hash de URL detectado, tentando processar autenticação...');
          
          try {
            // Tentar processar o hash da URL (comum em autenticações OAuth)
            const { data, error } = await supabase.auth.getSession();
            
            if (error || !data.session) {
              throw new Error('Falha ao processar autenticação');
            }
            
            console.log('Autenticação processada com sucesso');
            // Recarrega a página para limpar os parâmetros da URL
            window.location.href = window.location.pathname;
            return;
          } catch (error) {
            console.error('Erro ao processar autenticação:', error);
          }
        }
        
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
        console.log('Usuário autenticado:', user.email);
        
        // Verifica se o usuário autenticou via Google (para debug)
        if (user.app_metadata?.provider === 'google') {
          console.log('Usuário autenticado via Google');
        }
        
        // Get user info from auth
        const userName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.user_metadata?.preferred_username;
                        
        setUserInfo({
          name: userName,
          email: user.email,
          photoUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          userId: user.id
        });
        
        if (user.user_metadata?.avatar_url || user.user_metadata?.picture) {
          setFotoPreview(user.user_metadata?.avatar_url || user.user_metadata?.picture);
        }

        // Verificar se já existe um usuário com este email
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (userError) {
          console.error("Erro ao buscar dados do usuário:", userError);
          
          // Se o erro for que a tabela não existe, criamos o usuário
          if (userError.code === '42P01') { // Table does not exist
            console.log('Tabela de usuários não encontrada, criando novo usuário...');
            await createNewUser(user);
            return;
          }
          
          return;
        }
        
        // Se não encontrou o usuário, criamos um novo
        if (!userData) {
          console.log('Usuário não encontrado, criando novo usuário...');
          await createNewUser(user);
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
        const fileExt = data.foto.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `medicos/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('profiles')
          .upload(filePath, data.foto);
          
        if (uploadError) {
          console.error("Error uploading photo:", uploadError);
          throw new Error("Erro ao fazer upload da foto");
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);
          
        fotoUrl = publicUrl;
      }
      
      // Upload certificate if provided
      if (data.certificado) {
        const certFileName = `${crypto.randomUUID()}.pfx`;
        const certFilePath = `certificados/${userData.id}/${certFileName}`;
        
        // Upload certificate to storage
        const { error: certUploadError } = await supabase.storage
          .from('documentos_medicos')
          .upload(certFilePath, data.certificado);
          
        if (certUploadError) {
          console.error("Error uploading certificate:", certUploadError);
          throw new Error("Erro ao fazer upload do certificado");
        }
        
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
          console.error("Error saving certificate record:", docError);
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
