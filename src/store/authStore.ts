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
  isInitialized: boolean;
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
      isInitialized: false,
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
        const state = get();
        
        console.log("[AuthStore] Initialize chamado");
        
        // Evitar múltiplas inicializações
        if (state.isInitialized) {
          console.log("[AuthStore] Já inicializado");
          return;
        }
        
        console.log("[AuthStore] Iniciando inicialização...");
        set({ isLoading: true });
        
        try {
          // Verificar sessão do Supabase 
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            console.log("[AuthStore] Sessão encontrada");
            await get().loadUserProfile(session.user.email!);
            set({ 
              session, 
              user: session.user, 
              isAuthenticated: true,
              isInitialized: true,
              isLoading: false 
            });
            return;
          }
          
          // Nenhuma autenticação
          console.log("[AuthStore] Nenhuma autenticação");
          set({ 
            isInitialized: true,
            isLoading: false,
            isAuthenticated: false 
          });
          
        } catch (error) {
          console.error('[AuthStore] Erro:', error);
          set({ 
            isInitialized: true,
            isLoading: false,
            isAuthenticated: false 
          });
        }
        
        console.log("[AuthStore] Inicialização finalizada");
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

          const { data: verificationResult, error: verifyError } = await supabase.rpc('verify_user_password_v2', {
            p_email: email,
            p_password: password
          });

          if (verifyError || !verificationResult || verificationResult.length === 0) {
            return { success: false, error: 'Erro na verificação de senha' };
          }

          const result = verificationResult[0];
          if (!result.is_valid) {
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

// Setup listener para mudanças de autenticação do Supabase (apenas uma vez)
if (typeof window !== 'undefined') {
  let authListenerSetup = false;
  
  const setupAuthListener = () => {
    if (authListenerSetup) return;
    authListenerSetup = true;
    
    console.log("[AuthStore] Configurando auth listener...");
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthStore] Auth state change:", event);
      const store = useAuthStore.getState();
      
      // Apenas reagir a mudanças reais de autenticação, não a verificações iniciais
      if (event === 'SIGNED_IN' && session?.user && !store.isAuthenticated) {
        console.log("[AuthStore] Usuário fez login via Supabase");
        await store.loadUserProfile(session.user.email!);
        useAuthStore.setState({ 
          session, 
          user: session.user, 
          isAuthenticated: true 
        });
      } else if (event === 'SIGNED_OUT' && store.isAuthenticated) {
        console.log("[AuthStore] Usuário fez logout via Supabase");
        store.clearAuth();
      }
    });
  };
  
  setupAuthListener();
}
