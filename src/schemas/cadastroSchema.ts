import { z } from "zod";

// Define the registration form schema
export const cadastroSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  data_nascimento: z.string().refine(date => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, "Data de nascimento inválida"),
  endereco: z.string().min(5, "Endereço inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

export type CadastroFormValues = z.infer<typeof cadastroSchema>;

// Schema for doctor registration
export const cadastroMedicoSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  crm: z.string().min(4, "CRM inválido").max(14, "CRM inválido"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  dataNascimento: z.string().min(1, "Data de nascimento obrigatória"),
  certificado: z.instanceof(File, {
    message: "Certificado obrigatório",
  }).optional(),
  foto: z.instanceof(File, {
    message: "Foto de perfil",
  }).optional(),
  especialidade: z.string().min(3, "Especialidade é obrigatória"),
  biografia: z.string().optional(),
  termoConciencia: z.boolean().refine((val) => val === true, {
    message: "Você deve aceitar os termos",
  }),
});

export type CadastroMedicoFormValues = z.infer<typeof cadastroMedicoSchema>;
