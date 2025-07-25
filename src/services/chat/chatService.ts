// Chat service temporarily disabled due to database schema updates
export const verificarChatAtivo = async (medicoId: any, pacienteId: any) => false;
export const enviarMensagem = async (data: any) => ({ success: false });
export const getMensagensChat = async (medicoId: any, pacienteId: any) => [];
export const marcarMensagensComoLidas = async (medicoId: any, pacienteId: any, tipo: any) => false;
export const getChatsAtivos = async (medicoId: any) => [];
export const getChatsAtivosPaciente = async (pacienteId: any) => [];

export const chatService = {
  startChat: async () => ({ success: false, message: 'Chat temporarily disabled' }),
  sendMessage: async () => ({ success: false, message: 'Chat temporarily disabled' }),
  getChatMessages: async () => ({ success: false, data: [], message: 'Chat temporarily disabled' }),
  markMessageAsRead: async () => ({ success: false, message: 'Chat temporarily disabled' }),
  endChat: async () => ({ success: false, message: 'Chat temporarily disabled' })
};