import { supabase } from '@/integrations/supabase/client';

interface AuthDiagnosticResult {
  issue: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  solution: string;
}

export class AuthDiagnostics {
  static async runDiagnostics(): Promise<AuthDiagnosticResult[]> {
    const issues: AuthDiagnosticResult[] = [];

    // 1. Verificar usuários médicos órfãos
    try {
      const { data: orphanMedicos } = await supabase
        .from('usuarios')
        .select(`
          id, email, tipo_usuario,
          medicos!left(id, nome, aprovado)
        `)
        .eq('tipo_usuario', 'medico');

      orphanMedicos?.forEach(usuario => {
        if (!usuario.medicos || usuario.medicos.length === 0) {
          issues.push({
            issue: 'MEDICO_ORFAO',
            severity: 'CRITICAL',
            description: `Usuário médico ${usuario.email} (ID: ${usuario.id}) não possui registro na tabela medicos`,
            solution: 'Criar registro médico ou alterar tipo_usuario para paciente'
          });
        }
      });
    } catch (error) {
      issues.push({
        issue: 'QUERY_ERROR',
        severity: 'HIGH',
        description: 'Erro ao verificar usuários médicos órfãos',
        solution: 'Verificar permissões RLS e estrutura da query'
      });
    }

    // 2. Verificar usuários pacientes órfãos
    try {
      const { data: orphanPacientes } = await supabase
        .from('usuarios')
        .select(`
          id, email, tipo_usuario,
          pacientes!left(id, nome)
        `)
        .eq('tipo_usuario', 'paciente');

      orphanPacientes?.forEach(usuario => {
        if (!usuario.pacientes || usuario.pacientes.length === 0) {
          issues.push({
            issue: 'PACIENTE_ORFAO',
            severity: 'HIGH',
            description: `Usuário paciente ${usuario.email} (ID: ${usuario.id}) não possui registro na tabela pacientes`,
            solution: 'Criar registro paciente ou corrigir tipo_usuario'
          });
        }
      });
    } catch (error) {
      issues.push({
        issue: 'QUERY_ERROR',
        severity: 'HIGH',
        description: 'Erro ao verificar usuários pacientes órfãos',
        solution: 'Verificar permissões RLS e estrutura da query'
      });
    }

    // 3. Verificar médicos não aprovados
    try {
      const { data: unapprovedMedicos } = await supabase
        .from('medicos')
        .select('id, nome, aprovado, id_usuario')
        .eq('aprovado', false);

      if (unapprovedMedicos && unapprovedMedicos.length > 0) {
        issues.push({
          issue: 'MEDICOS_NAO_APROVADOS',
          severity: 'MEDIUM',
          description: `${unapprovedMedicos.length} médicos não aprovados encontrados`,
          solution: 'Implementar fluxo de aprovação de médicos na área administrativa'
        });
      }
    } catch (error) {
      issues.push({
        issue: 'QUERY_ERROR',
        severity: 'HIGH',
        description: 'Erro ao verificar médicos não aprovados',
        solution: 'Verificar permissões RLS'
      });
    }

    // 4. Verificar inconsistências de tipos de usuário
    try {
      const { data: allUsers } = await supabase
        .from('usuarios')
        .select('tipo_usuario');

      const userTypes = allUsers?.map(u => u.tipo_usuario) || [];
      const invalidTypes = userTypes.filter(type => 
        !['medico', 'paciente', 'admin_clinica'].includes(type)
      );

      if (invalidTypes.length > 0) {
        issues.push({
          issue: 'TIPOS_USUARIO_INVALIDOS',
          severity: 'HIGH',
          description: `Tipos de usuário inválidos encontrados: ${[...new Set(invalidTypes)].join(', ')}`,
          solution: 'Normalizar tipos de usuário para: medico, paciente, admin_clinica'
        });
      }
    } catch (error) {
      issues.push({
        issue: 'QUERY_ERROR',
        severity: 'HIGH',
        description: 'Erro ao verificar tipos de usuário',
        solution: 'Verificar permissões RLS'
      });
    }

    // 5. Verificar clínicas sem admin
    try {
      const { data: clinicas } = await supabase
        .from('clinicas')
        .select('id, nome, email');

      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('email')
        .eq('tipo_usuario', 'admin_clinica');

      const clinicasEmails = clinicas?.map(c => c.email) || [];
      const adminEmails = usuarios?.map(u => u.email) || [];

      clinicas?.forEach(clinica => {
        if (!adminEmails.includes(clinica.email)) {
          issues.push({
            issue: 'CLINICA_SEM_ADMIN',
            severity: 'MEDIUM',
            description: `Clínica ${clinica.nome} (${clinica.email}) não possui usuário admin_clinica correspondente`,
            solution: 'Criar usuário admin_clinica ou ajustar sistema de autenticação de clínicas'
          });
        }
      });
    } catch (error) {
      issues.push({
        issue: 'QUERY_ERROR',
        severity: 'HIGH',
        description: 'Erro ao verificar clínicas sem admin',
        solution: 'Verificar permissões RLS'
      });
    }

    return issues;
  }

  static generateReport(issues: AuthDiagnosticResult[]): string {
    if (issues.length === 0) {
      return '✅ DIAGNÓSTICO COMPLETO: Nenhum problema de autenticação encontrado.';
    }

    const critical = issues.filter(i => i.severity === 'CRITICAL');
    const high = issues.filter(i => i.severity === 'HIGH');
    const medium = issues.filter(i => i.severity === 'MEDIUM');
    const low = issues.filter(i => i.severity === 'LOW');

    let report = '🔍 RELATÓRIO DE DIAGNÓSTICO DE AUTENTICAÇÃO\n\n';
    
    if (critical.length > 0) {
      report += '🚨 CRÍTICOS:\n';
      critical.forEach(issue => {
        report += `- ${issue.description}\n  Solução: ${issue.solution}\n\n`;
      });
    }

    if (high.length > 0) {
      report += '⚠️ ALTA PRIORIDADE:\n';
      high.forEach(issue => {
        report += `- ${issue.description}\n  Solução: ${issue.solution}\n\n`;
      });
    }

    if (medium.length > 0) {
      report += '🔔 MÉDIA PRIORIDADE:\n';
      medium.forEach(issue => {
        report += `- ${issue.description}\n  Solução: ${issue.solution}\n\n`;
      });
    }

    if (low.length > 0) {
      report += 'ℹ️ BAIXA PRIORIDADE:\n';
      low.forEach(issue => {
        report += `- ${issue.description}\n  Solução: ${issue.solution}\n\n`;
      });
    }

    return report;
  }
}