
// This file is kept for backward compatibility and will be deprecated in the future.
// Import all services from their respective modules and re-export them.

import * as authService from './auth/authService';
import * as pacientesService from './pacientes/pacientesService';
import * as medicosService from './medicos/medicosService';
import * as consultasService from './consultas/consultasService';
import * as documentosService from './documentos/documentosService';
import * as prontuariosService from './prontuarios/prontuariosService';
import * as receitasService from './receitas/receitasService';
import * as atestadosService from './documentos/atestadosService';
import * as laudosService from './documentos/laudosService';
import * as examesService from './exames/examesService';
import * as chatService from './chat/chatService';

// Re-export everything from all services
export const {
  verifyClinicPassword
} = authService;

export const {
  getPacientes,
  createPaciente,
  getSaldoPacientes
} = pacientesService;

export const {
  getMedicos,
  getSaldoMedico,
  getSaldoMedicos,
  getTransacoesMedico,
  getTransacoesMedicos,
} = medicosService;

export const {
  getConsultas,
  createConsulta
} = consultasService;

export const {
  getDocumentUrl,
  downloadDocument
} = documentosService;

export const {
  getProntuarios,
  createProntuario
} = prontuariosService;

export const {
  getReceitas,
  createReceita
} = receitasService;

export const {
  createAtestado
} = atestadosService;

export const {
  createLaudo
} = laudosService;

export const {
  createPedidoExame
} = examesService;

export const {
  verificarChatAtivo,
  enviarMensagem,
  getMensagensChat,
  marcarMensagensComoLidas,
  getChatsAtivos,
  getChatsAtivosPaciente
} = chatService;
