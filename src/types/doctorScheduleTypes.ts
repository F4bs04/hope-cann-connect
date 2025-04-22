
export type Paciente = {
  id: number;
  nome: string;
  idade: number;
  condicao: string;
  ultimaConsulta: string;
};

export type Consulta = {
  id: number;
  paciente: string;
  data: string;
  horario: string;
  status: 'agendada' | 'realizada' | 'cancelada';
};

export type Receita = {
  id: number;
  paciente: string;
  medicamento: string;
  posologia: string;
  data: string;
};

export type Mensagem = {
  id: number;
  paciente: string;
  mensagem: string;
  data: string;
  lida: boolean;
};

export type Anamnese = {
  queixa_principal: string;
  historia_doenca_atual: string;
  historia_medica_pregressa: string;
  historia_familiar: string;
  habitos_vida: string;
  medicamentos_em_uso: string;
};

export type SOAP = {
  subjetivo: string;
  objetivo: string;
  avaliacao: string;
  plano: string;
};

export type HistoricoPaciente = {
  id?: number;
  id_paciente: number;
  condicoes_medicas: string;
  alergias: string;
  medicamentos_atuais: string;
  historico_familiar: string;
  ultima_atualizacao: string;
  anamnese?: Anamnese;
  soap?: SOAP;
};

export type AcompanhamentoPaciente = {
  id?: number;
  id_paciente: number;
  data_registro: string;
  sintomas: string;
  efeitos_colaterais: string;
  eficacia: string;
  notas_adicionais: string;
};

export type HorariosConfig = {
  segunda: string[];
  terca: string[];
  quarta: string[];
  quinta: string[];
  sexta: string[];
  sabado: string[];
  domingo: string[];
};
