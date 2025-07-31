import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string; // UUID como string
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
        
        // Timeout de segurança para evitar travamentos
        const initTimeout = setTimeout(() => {
          console.warn("[AuthStore] Timeout na inicialização - finalizando com estado padrão");
          set({ 
            isInitialized: true,
            isLoading: false,
            isAuthenticated: false,
            session: null,
            user: null,
            userProfile: null
          });
        }, 10000); // 10 segundos de timeout
        
        try {
          // Verificar sessão do Supabase 
          console.log("[AuthStore] Verificando sessão do Supabase...");
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("[AuthStore] Erro ao obter sessão:", sessionError);
            throw sessionError;
          }
          
          if (session?.user) {
            console.log("[AuthStore] Sessão encontrada para usuário:", session.user.email);
            console.log("[AuthStore] Dados da sessão:", session);
            try {
              await get().loadUserProfile(session.user.email!);
              set({ 
                session, 
                user: session.user, 
                isAuthenticated: true
              });
              console.log("[AuthStore] Perfil carregado com sucesso");
            } catch (profileError) {
              console.error("[AuthStore] Erro ao carregar perfil:", profileError);
              console.log("[AuthStore] Tentando recuperar autenticação com dados mínimos");
              
              // Usuário tem sessão válida no Supabase, vamos tentar criar perfil mínimo
              try {
                // Criar perfil básico para permitir acesso
                const basicProfile: UserProfile = {
                  id: session.user.id,
                  nome: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
                  email: session.user.email!,
                  tipo_usuario: 'paciente' // Assumir paciente por padrão
                };
                
                console.log("[AuthStore] Criando perfil básico:", basicProfile);
                
                set({ 
                  session, 
                  user: session.user, 
                  isAuthenticated: true, // Permitir acesso com perfil básico
                  userProfile: basicProfile,
                  permissions: ['consultas', 'receitas', 'historico']
                });
                
                console.log("[AuthStore] Usuário autenticado com perfil básico");
              } catch (fallbackError) {
                console.error("[AuthStore] Erro ao criar perfil básico:", fallbackError);
                set({ 
                  session, 
                  user: session.user, 
                  isAuthenticated: false
                });
              }
            }
          } else {
            console.log("[AuthStore] Nenhuma sessão encontrada");
          }
          
        } catch (error) {
          console.error('[AuthStore] Erro:', error);
        } finally {
          // Limpar timeout
          clearTimeout(initTimeout);
          
          // SEMPRE finalizar o loading
          console.log("[AuthStore] Inicialização finalizada");
          set({ 
            isInitialized: true,
            isLoading: false 
          });
        }
      },

      // Login unificado
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          
          // Clínica verification temporarily disabled
          const clinicData = null;

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

          // Login com Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (authError) {
            return { success: false, error: authError.message };
          }

          if (!authData.user) {
            return { success: false, error: 'Erro na autenticação' };
          }

          try {
            await get().loadUserProfile(email);
            set({ isAuthenticated: true });
          } catch (profileError) {
            console.error('[AuthStore] Erro ao carregar perfil no login:', profileError);
            
            // Criar perfil básico para permitir acesso mesmo com erro
            const basicProfile: UserProfile = {
              id: authData.user.id,
              nome: authData.user.user_metadata?.full_name || email.split('@')[0] || 'Usuário',
              email: email,
              tipo_usuario: 'paciente' // Assumir paciente por padrão
            };
            
            set({ 
              isAuthenticated: true,
              userProfile: basicProfile,
              session: authData.session,
              user: authData.user,
              permissions: ['consultas', 'receitas', 'historico']
            });
            
            console.log('[AuthStore] Login realizado com perfil básico devido a erro no carregamento');
          }
          
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
        try {
          // Primeiro, buscar no profiles
          const { data: userAuth } = await supabase.auth.getUser();
          if (!userAuth.user) throw new Error('Usuário não autenticado');

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (profileError) throw profileError;
          if (!profileData) {
            // Redirecionar para cadastro complementar se perfil não encontrado
            window.location.replace('/cadastro-complementar');
            return;
          }

          let profile: UserProfile = {
            id: profileData.id, // UUID como string
            nome: profileData.full_name || '',
            email: profileData.email,
            tipo_usuario: profileData.role === 'doctor' ? 'medico' : 
                         profileData.role === 'patient' ? 'paciente' : 'admin_clinica',
          };

          console.log("[AuthStore] Profile inicial criado:", profile);

          let permissions: string[] = [];
          let isApproved = true;

          if (profileData.role === 'doctor') {
            const { data: doctorData, error: doctorError } = await supabase
              .from('doctors')
              .select('*')
              .eq('user_id', profileData.id)
              .maybeSingle();

            if (doctorError) {
              console.error('Erro ao buscar dados do médico:', doctorError);
              throw new Error('Erro ao carregar dados do médico');
            }

            if (doctorData) {
              profile = {
                ...profile,
                nome: profileData.full_name || '',
                crm: doctorData.crm,
                especialidade: doctorData.specialty,
                telefone: profileData.phone,
                // foto_perfil: doctorData.foto_perfil,
                valor_por_consulta: doctorData.consultation_fee
              };
              
              isApproved = doctorData.is_approved;
              permissions = ['dashboard', 'agenda', 'pacientes', 'receitas'];
              
              set({ 
                medicoId: parseInt(doctorData.id),
                isApproved,
                permissions 
              });
            } else {
              // Médico sem dados: criar registro automaticamente para login social
              console.warn('Usuário médico sem dados na tabela doctors - criando registro automático');
              
              try {
                const { data: newDoctor, error: createError } = await supabase
                  .from('doctors')
                  .insert({
                    user_id: profileData.id,
                    crm: `TEMP_${Date.now()}`,
                    cpf: `TEMP_${Date.now()}`,
                    specialty: 'A definir',
                    is_approved: false,
                    consultation_fee: 100
                  })
                  .select()
                  .single();

                if (createError) {
                  console.error('Erro ao criar registro de médico:', createError);
                  throw new Error('Erro ao criar perfil de médico. Tente novamente.');
                }

                profile = {
                  ...profile,
                  nome: profileData.full_name || '',
                  crm: 'PENDENTE',
                  especialidade: 'A definir',
                  telefone: profileData.phone,
                  valor_por_consulta: 100
                };
                
                isApproved = false;
                permissions = ['dashboard', 'agenda', 'pacientes', 'receitas'];
                
                set({ 
                  medicoId: parseInt(newDoctor.id),
                  isApproved: false,
                  permissions 
                });
              } catch (createError) {
                console.error('Erro ao criar registro de médico:', createError);
                throw new Error('Perfil de médico incompleto. Entre em contato com o administrador.');
              }
            }
          } else if (profileData.role === 'patient') {
            const { data: patientData } = await supabase
              .from('patients')
              .select('*')
              .eq('user_id', profileData.id)
              .maybeSingle();

            if (patientData) {
              profile = {
                ...profile,
                nome: profileData.full_name || '',
                cpf: patientData.cpf,
                telefone: profileData.phone,
                data_nascimento: patientData.birth_date,
                endereco: patientData.address,
                genero: patientData.gender,
                condicao_medica: patientData.medical_condition
              };
              
              permissions = ['consultas', 'receitas', 'historico'];
              
              set({ 
                pacienteId: parseInt(patientData.id),
                permissions 
              });
            } else {
              // Paciente sem dados: criar registro automaticamente para login social
              console.warn('Usuário paciente sem dados na tabela patients - criando registro automático');
              
              try {
                const { data: newPatient, error: createError } = await supabase
                  .from('patients')
                  .insert({
                    user_id: profileData.id,
                    cpf: 'PENDENTE',
                    birth_date: '1990-01-01',
                    gender: 'Não informado',
                    address: 'A definir',
                    medical_condition: 'Não informado'
                  })
                  .select()
                  .single();

                if (createError) {
                  console.error('Erro ao criar registro de paciente:', createError);
                  throw new Error('Erro ao criar perfil de paciente. Tente novamente.');
                }

                profile = {
                  ...profile,
                  nome: profileData.full_name || '',
                  cpf: 'PENDENTE',
                  telefone: profileData.phone,
                  data_nascimento: '1990-01-01',
                  endereco: 'A definir',
                  genero: 'Não informado',
                  condicao_medica: 'Não informado'
                };
                
                permissions = ['consultas', 'receitas', 'historico'];
                
                set({ 
                  pacienteId: parseInt(newPatient.id),
                  permissions 
                });
              } catch (createError) {
                console.error('Erro ao criar registro de paciente:', createError);
                // Não bloquear o acesso, apenas logar o erro
                permissions = ['consultas', 'receitas', 'historico'];
              }
            }
          }

          console.log("[AuthStore] Profile final:", profile);
          set({ userProfile: profile });
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
          throw error; // Re-throw para ser capturado na inicialização
        }
      },

      // Sincronizar com localStorage
      syncLocalStorage: () => {
        const state = get();
        if (state.isAuthenticated && state.userProfile) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', state.userProfile.email);
          localStorage.setItem('userId', state.userProfile.id); // ID como string
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
let authListener: { data: { subscription: any } } | null = null;

if (typeof window !== 'undefined') {
  let authListenerSetup = false;
  
  const setupAuthListener = () => {
    if (authListenerSetup) return;
    authListenerSetup = true;
    
    console.log("[AuthStore] Configurando auth listener...");
    authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthStore] Auth state change:", event);
      const store = useAuthStore.getState();
      
      // Apenas reagir a eventos específicos para evitar loops
      if (event === 'SIGNED_OUT') {
        console.log("[AuthStore] Usuário fez logout via Supabase");
        store.clearAuth();
      }
    });
  };
  
  setupAuthListener();
  
  // Cleanup listener when window unloads
  window.addEventListener('beforeunload', () => {
    if (authListener) {
      authListener.data.subscription.unsubscribe();
    }
  });
}
