import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { cadastroMedicoFormSchema, type CadastroMedicoFormValues } from '@/schemas/cadastroMedicoSchema';
import { supabase } from '@/integrations/supabase/client';

export interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFim: string;
}

export const useMedicoRegistro = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile, loadUserProfile } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [certificadoNome, setCertificadoNome] = useState('');
  const [termoDialogOpen, setTermoDialogOpen] = useState(false);
  const [horarios, setHorarios] = useState<DiaHorario[]>([]);
  
  const form = useForm<CadastroMedicoFormValues>({
    resolver: zodResolver(cadastroMedicoFormSchema),
    defaultValues: {
      telefone: '',
      crm: '',
      especialidade: '',
      termoConciencia: false
    }
  });

  // Carregar informações do usuário autenticado
  useEffect(() => {
    if (user?.email && !userProfile) {
      loadUserProfile(user.email);
    }
  }, [user, userProfile, loadUserProfile]);

  const handleFileChange = (file: File | null, type: 'foto' | 'certificado') => {
    if (type === 'foto' && file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === 'certificado' && file) {
      setCertificadoNome(file.name);
    }
  };

  const handleTelefoneChange = (value: string) => {
    // Formatar telefone (11) 99999-9999
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 11) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    } else if (cleaned.length >= 7) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length >= 2) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    }
    
    form.setValue('telefone', formatted);
  };

  const handleCRMChange = (value: string) => {
    // Formatar CRM - apenas números e letras
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    form.setValue('crm', formatted);
  };

  const onSubmit = async (data: CadastroMedicoFormValues) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return { success: false };
    }

    setIsLoading(true);
    
    try {
      // Verificar se já existe um registro de médico para este usuário
      const { data: existingDoctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingDoctor) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('doctors')
          .update({
            crm: data.crm,
            specialty: data.especialidade,
            is_approved: false // Resetar aprovação para revisão
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('doctors')
          .insert({
            user_id: user.id,
            crm: data.crm,
            cpf: 'PENDENTE', // Será preenchido posteriormente
            specialty: data.especialidade,
            is_approved: false
          });

        if (error) throw error;
      }

      // Atualizar perfil com telefone
      if (data.telefone) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone: data.telefone })
          .eq('id', user.id);

        if (profileError) {
          console.warn('Erro ao atualizar telefone no perfil:', profileError);
        }
      }

      toast({
        title: "Sucesso!",
        description: "Cadastro completado com sucesso. Aguarde a aprovação.",
      });

      // Recarregar perfil do usuário
      if (user.email) {
        await loadUserProfile(user.email);
      }

      // Redirecionar para área do médico
      navigate('/area-medico');
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
      toast({
        title: "Erro",
        description: "Erro ao completar cadastro. Tente novamente.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Criar userInfo a partir dos dados do usuário autenticado
  const userInfo = user ? {
    id: user.id,
    email: user.email || '',
    name: userProfile?.nome || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    photoUrl: userProfile?.foto_perfil || user.user_metadata?.avatar_url || null
  } : null;

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
    handleSubmit: form.handleSubmit(onSubmit),
    nextStep: () => {},
    prevStep: () => {},
    updateFormData: () => {}
  };
};