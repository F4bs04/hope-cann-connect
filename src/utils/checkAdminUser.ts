import { supabase } from '@/integrations/supabase/client';

// Script para verificar se existe usuário admin cadastrado
export const checkAdminUser = async () => {
  try {
    console.log('=== VERIFICANDO USUÁRIO ADMIN ===');
    
    // Buscar usuários com role 'system_admin' (administrador do sistema)
    const { data: adminUsers, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, created_at')
      .eq('role', 'system_admin');
    
    if (error) {
      console.error('Erro ao buscar usuários admin:', error);
      return { exists: false, error: error.message };
    }
    
    console.log('Usuários admin encontrados:', adminUsers);
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('❌ NENHUM USUÁRIO ADMIN ENCONTRADO');
      return { 
        exists: false, 
        message: 'Nenhum usuário admin cadastrado no sistema',
        adminUsers: []
      };
    }
    
    console.log(`✅ ${adminUsers.length} USUÁRIO(S) ADMIN ENCONTRADO(S):`);
    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. Email: ${admin.email}`);
      console.log(`   Nome: ${admin.full_name || 'Não informado'}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Ativo: ${admin.is_active ? 'Sim' : 'Não'}`);
      console.log(`   Criado em: ${new Date(admin.created_at).toLocaleDateString('pt-BR')}`);
      console.log('---');
    });
    
    return {
      exists: true,
      count: adminUsers.length,
      adminUsers: adminUsers,
      message: `${adminUsers.length} usuário(s) admin encontrado(s)`
    };
    
  } catch (error) {
    console.error('Erro na verificação:', error);
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

// Função para criar usuário admin (se necessário)
export const createAdminUser = async (email: string, password: string, fullName?: string) => {
  try {
    console.log('=== CRIANDO USUÁRIO ADMIN ===');
    
    // Primeiro, criar o usuário na autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      console.error('Erro ao criar usuário na autenticação:', authError);
      return { success: false, error: authError.message };
    }
    
    if (!authData.user) {
      return { success: false, error: 'Usuário não foi criado na autenticação' };
    }
    
    console.log('Usuário criado na autenticação:', authData.user.id);
    
    // Aguardar um pouco para garantir que o trigger do profile foi executado
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Atualizar o profile para role system_admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'system_admin',
        full_name: fullName || 'Administrador',
        is_active: true
      })
      .eq('id', authData.user.id)
      .select();
    
    if (profileError) {
      console.error('Erro ao atualizar profile para admin:', profileError);
      return { success: false, error: profileError.message };
    }
    
    console.log('✅ Usuário admin criado com sucesso!');
    console.log('Profile atualizado:', profileData);
    
    return {
      success: true,
      user: authData.user,
      profile: profileData?.[0],
      message: 'Usuário admin criado com sucesso'
    };
    
  } catch (error) {
    console.error('Erro na criação do admin:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

// Executar verificação automaticamente quando importado
if (typeof window !== 'undefined') {
  // Só executar no browser, não durante build
  console.log('Módulo checkAdminUser carregado. Use checkAdminUser() para verificar.');
}
