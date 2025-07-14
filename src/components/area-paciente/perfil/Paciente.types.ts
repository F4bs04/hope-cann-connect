
// Define Paciente interface here to be shared
export interface Paciente {
  id: number;
  id_usuario?: number;
  nome?: string;
  email?: string;
  cpf?: string;
  data_nascimento?: string; // Expected as yyyy-MM-dd from DB/form submission state
  endereco?: string;
  telefone?: string;
  genero?: string;
  foto_perfil?: string;
}
