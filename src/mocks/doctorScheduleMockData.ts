
import { Paciente, Consulta, Receita, Mensagem, HistoricoPaciente, AcompanhamentoPaciente } from '@/types/doctorScheduleTypes';

export const horariosDisponiveis = {
  manha: ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
  tarde: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00']
};

export const todosHorariosDisponiveis = [...horariosDisponiveis.manha, ...horariosDisponiveis.tarde];

// Mock data
export const pacientesMock: Paciente[] = [
  { id: 1, nome: 'João Silva', idade: 42, condicao: 'Dor crônica', ultimaConsulta: '2025-03-15' },
  { id: 2, nome: 'Maria Oliveira', idade: 35, condicao: 'Ansiedade', ultimaConsulta: '2025-03-28' },
  { id: 3, nome: 'Carlos Souza', idade: 57, condicao: 'Parkinson', ultimaConsulta: '2025-04-02' },
  { id: 4, nome: 'Ana Pereira', idade: 29, condicao: 'Epilepsia', ultimaConsulta: '2025-03-20' },
  { id: 5, nome: 'Roberto Almeida', idade: 63, condicao: 'Fibromialgia', ultimaConsulta: '2025-04-05' }
];

export const consultasMock: Consulta[] = [
  { id: 1, paciente: 'João Silva', data: '2025-04-15', horario: '09:00', status: 'agendada' },
  { id: 2, paciente: 'Maria Oliveira', data: '2025-04-16', horario: '14:30', status: 'agendada' },
  { id: 3, paciente: 'Carlos Souza', data: '2025-04-12', horario: '10:15', status: 'realizada' },
  { id: 4, paciente: 'Ana Pereira', data: '2025-04-03', horario: '15:45', status: 'realizada' },
  { id: 5, paciente: 'Roberto Almeida', data: '2025-04-18', horario: '11:00', status: 'agendada' }
];

export const receitasMock: Receita[] = [
  { id: 1, paciente: 'João Silva', medicamento: 'Óleo CBD 5%', posologia: '10 gotas, 2x ao dia', data: '2025-04-12' },
  { id: 2, paciente: 'Maria Oliveira', medicamento: 'Óleo CBD:THC 20:1', posologia: '5 gotas, à noite', data: '2025-04-10' },
  { id: 3, paciente: 'Ana Pereira', medicamento: 'Óleo CBD 3%', posologia: '8 gotas, 3x ao dia', data: '2025-04-03' }
];

export const mensagensMock: Mensagem[] = [
  { id: 1, paciente: 'João Silva', mensagem: 'Doutor, estou sentindo uma melhora significativa com o tratamento.', data: '2025-04-11', lida: true },
  { id: 2, paciente: 'Maria Oliveira', mensagem: 'Tenho algumas dúvidas sobre os efeitos colaterais do medicamento.', data: '2025-04-14', lida: false },
  { id: 3, paciente: 'Roberto Almeida', mensagem: 'Posso aumentar a dosagem? Ainda estou sentindo dores.', data: '2025-04-13', lida: false }
];

export const historicosPacientesMock: HistoricoPaciente[] = [
  { 
    id: 1, 
    id_paciente: 1, 
    condicoes_medicas: 'Dor crônica lombar, hipertensão controlada', 
    alergias: 'Penicilina, sulfas', 
    medicamentos_atuais: 'Losartana 50mg 1x/dia', 
    historico_familiar: 'Pai com diabetes, mãe com hipertensão',
    ultima_atualizacao: '2025-03-15T14:30:00Z'
  },
  { 
    id: 2, 
    id_paciente: 2, 
    condicoes_medicas: 'Transtorno de ansiedade generalizada, enxaqueca', 
    alergias: 'Dipirona', 
    medicamentos_atuais: 'Escitalopram 10mg 1x/dia', 
    historico_familiar: 'Irmã com depressão',
    ultima_atualizacao: '2025-03-28T10:15:00Z'
  }
];

export const acompanhamentosPacientesMock: AcompanhamentoPaciente[] = [
  {
    id: 1,
    id_paciente: 1,
    data_registro: '2025-03-15T14:30:00Z',
    sintomas: 'Dor moderada na região lombar, dificuldade para dormir',
    efeitos_colaterais: 'Sonolência leve pela manhã',
    eficacia: 'Alívio parcial da dor após o uso do medicamento',
    notas_adicionais: 'Paciente relata melhora na qualidade do sono'
  },
  {
    id: 2,
    id_paciente: 2,
    data_registro: '2025-03-28T10:15:00Z',
    sintomas: 'Episódios de ansiedade menos frequentes, melhor controle da respiração',
    efeitos_colaterais: 'Boca seca ocasional',
    eficacia: 'Boa resposta ao tratamento com CBD',
    notas_adicionais: 'Considerar redução gradual da dose de ansiolítico'
  }
];
