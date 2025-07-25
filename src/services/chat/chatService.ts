// Chat service temporarily disabled due to database schema updates
export const verificarChatAtivo = async () => false;
export const enviarMensagem = async () => ({ success: false });
export const getMensagensChat = async () => [];
export const marcarMensagensComoLidas = async () => false;
export const getChatsAtivos = async () => [];
export const getChatsAtivosPaciente = async () => [];

export const chatService = {
  startChat: async () => ({ success: false, message: 'Chat temporarily disabled' }),
  sendMessage: async () => ({ success: false, message: 'Chat temporarily disabled' }),
  getChatMessages: async () => ({ success: false, data: [], message: 'Chat temporarily disabled' }),
  markMessageAsRead: async () => ({ success: false, message: 'Chat temporarily disabled' }),
  endChat: async () => ({ success: false, message: 'Chat temporarily disabled' })
};