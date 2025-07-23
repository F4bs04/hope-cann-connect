import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: 'medico' | 'paciente' | 'admin_clinica';
  telefone?: string;
  // Campos específicos do médico
  crm?: string;
  especialidade?: string;
  aprovado?: boolean;
  foto_perfil?: string;
  valor_por_consulta?: number;
  // Campos específicos do paciente
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  genero?: string;
  condicao_medica?: string;
  // Campos específicos da clínica
  cnpj?: string;
  nome_clinica?: string;
}

interface AuthState {
  // Estado de autenticação
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  
  // Dados específicos por tipo
  medicoId: number | null;
  pacienteId: number | null;
  clinicaId: number | null;
  
  // Status de aprovação/permissões
  isApproved: boolean;
  permissions: string[];
  
  // Ações
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
  
  // Métodos internos
  loadUserProfile: (email: string) => Promise<void>;
  syncLocalStorage: () => void;
  clearAuth: () => void;
  
  // Helpers
  hasPermission: (permission: string) => boolean;
  getUserType: () => string | null;
  getCorrectPath: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      isAuthenticated: false,
      isLoading: true,
      session: null,
      user: null,
      userProfile: null,
      medicoId: null,
      pacienteId: null,
      clinicaId: null,
      isApproved: false,
      permissions: [],

      // Inicialização do store
      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // Verificar localStorage primeiro para evitar loops
          const localAuth = localStorage.getItem('isAuthenticated') === 'true';
          const localEmail = localStorage.getItem('userEmail');
          const authTimestamp = localStorage.getItem('authTimestamp');
          
          if (localAuth && localEmail && authTimestamp) {
            const isExpired = Date.now() - parseInt(authTimestamp) > 24 * 60 * 60 * 1000;
            
            if (!isExpired) {
              await get().loadUserProfile(localEmail);
              set({ isAuthenticated: true });
            } else {
              get().clearAuth();
            }
          } else {
            // Verificar sessão do Supabase apenas se não houver auth local
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
              await get().loadUserProfile(session.user.email!);
              set({ 
                session, 
                user: session.user, 
                isAuthenticated: true 
              });
            }
          }
        } catch (error) {
          console.error('Erro na inicialização:', error);
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },

      // Login unificado
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          // Verificar se é clínica primeiro
          const { data: clinicData } = await supabase
            .from('clinicas')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (clinicData) {
            // Login de clínica
            const { data: isValid } = await supabase.rpc('verify_clinic_password', {
              p_email: email,
              p_password: password
            });

            if (!isValid) {
              return { success: false, error: 'Senha incorreta' };
            }

            const profile: UserProfile = {
              id: clinicData.id,
              nome: clinicData.nome,
              email: clinicData.email,
              tipo_usuario: 'admin_clinica',
              nome_clinica: clinicData.nome,
              cnpj: clinicData.cnpj
            };

            set({
              isAuthenticated: true,
              userProfile: profile,
              clinicaId: clinicData.id,
              permissions: ['admin', 'medicos', 'agenda', 'relatorios']
            });

            get().syncLocalStorage();
            return { success: true };
          }

          // Login de usuário regular
          const { data: userData } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (!userData) {
            return { success: false, error: 'Usuário não encontrado' };
          }

          const { data: isValid } = await supabase.rpc('verify_user_password', {
            p_email: email,
            p_password: password
          });

          if (!isValid) {
            return { success: false, error: 'Senha incorreta' };
          }

          await get().loadUserProfile(email);
          set({ isAuthenticated: true });
          get().syncLocalStorage();

          return { success: true };
        } catch (error) {
          console.error('Erro no login:', error);
          return { success: false, error: 'Erro interno do servidor' };
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout
      logout: async () => {
        await supabase.auth.signOut();
        get().clearAuth();
      },

      // Carregar perfil do usuário
      loadUserProfile: async (email: string) => {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .single();

        if (!userData) return;

        let profile: UserProfile = {
          id: userData.id,
          nome: '',
          email: userData.email,
          tipo_usuario: userData.tipo_usuario as 'medico' | 'paciente' | 'admin_clinica',
        };

        let permissions: string[] = [];
        let isApproved = true;

        if (userData.tipo_usuario === 'medico') {
          const { data: medicoData } = await supabase
            .from('medicos')
            .select('*')
            .eq('id_usuario', userData.id)
            .maybeSingle();

          if (medicoData) {
            profile = {
              ...profile,
              nome: medicoData.nome,
              crm: medicoData.crm,
              especialidade: medicoData.especialidade,
              telefone: medicoData.telefone,
              foto_perfil: medicoData.foto_perfil,
              valor_por_consulta: medicoData.valor_por_consulta
            };
            
            isApproved = medicoData.aprovado;
            permissions = ['dashboard', 'agenda', 'pacientes', 'receitas'];
            
            set({ 
              medicoId: medicoData.id,
              isApproved,
              permissions 
            });
          }
        } else if (userData.tipo_usuario === 'paciente') {
          const { data: pacienteData } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id_usuario', userData.id)
            .maybeSingle();

          if (pacienteData) {
            profile = {
              ...profile,
              nome: pacienteData.nome,
              cpf: pacienteData.cpf,
              telefone: pacienteData.telefone,
              data_nascimento: pacienteData.data_nascimento,
              endereco: pacienteData.endereco,
              genero: pacienteData.genero,
              condicao_medica: pacienteData.condicao_medica
            };
            
            permissions = ['consultas', 'receitas', 'historico'];
            
            set({ 
              pacienteId: pacienteData.id,
              permissions 
            });
          }
        }

        set({ userProfile: profile });
      },

      // Sincronizar com localStorage
      syncLocalStorage: () => {
        const state = get();
        if (state.isAuthenticated && state.userProfile) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', state.userProfile.email);
          localStorage.setItem('userId', state.userProfile.id.toString());
          localStorage.setItem('userType', state.userProfile.tipo_usuario);
          localStorage.setItem('authTimestamp', Date.now().toString());
        }
      },

      // Limpar autenticação
      clearAuth: () => {
        set({
          isAuthenticated: false,
          session: null,
          user: null,
          userProfile: null,
          medicoId: null,
          pacienteId: null,
          clinicaId: null,
          isApproved: false,
          permissions: []
        });
        
        // Limpar localStorage
        ['isAuthenticated', 'userEmail', 'userId', 'userType', 'authTimestamp']
          .forEach(key => localStorage.removeItem(key));
      },

      // Atualizar perfil
      updateProfile: (profile: Partial<UserProfile>) => {
        set(state => ({
          userProfile: state.userProfile ? { ...state.userProfile, ...profile } : null
        }));
      },

      // Definir loading
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Verificar permissão
      hasPermission: (permission: string) => {
        return get().permissions.includes(permission);
      },

      // Obter tipo de usuário
      getUserType: () => {
        return get().userProfile?.tipo_usuario || null;
      },

      // Obter caminho correto
      getCorrectPath: () => {
        const userType = get().getUserType();
        switch (userType) {
          case 'medico': return '/area-medico';
          case 'paciente': return '/area-paciente';
          case 'admin_clinica': return '/admin';
          default: return '/area-paciente';
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userProfile: state.userProfile,
        medicoId: state.medicoId,
        pacienteId: state.pacienteId,
        clinicaId: state.clinicaId,
        isApproved: state.isApproved,
        permissions: state.permissions,
      }),
    }
  )
);

// Setup listener para mudanças de autenticação do Supabase
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    await store.loadUserProfile(session.user.email!);
    useAuthStore.setState({ 
      session, 
      user: session.user, 
      isAuthenticated: true 
    });
  } else if (event === 'SIGNED_OUT') {
    store.clearAuth();
  }
});