
import { z } from "zod";

// Schema for doctor registration form - This is for the *complementary* data step
export const cadastroMedicoFormSchema = z.object({
  crm: z.string().min(4, {
    message: 'CRM inválido',
  }).max(14), // Assuming CRM format like 000000/UF
  // Senha and confirmarSenha removed as this form is for *completing* registration
  // Password is set during initial Supabase Auth signup or via Google
  cpf: z.string().min(14, { // Expects format 000.000.000-00
    message: 'CPF inválido. Use o formato 000.000.000-00',
  }).max(14, {
    message: 'CPF inválido. Use o formato 000.000.000-00',
  }),
  telefone: z.string().min(10, { // Expects format (00) 00000-0000 or (00) 0000-0000
    message: 'Telefone inválido',
  }).max(15),
  especialidade: z.string().min(3, {
    message: 'Especialidade é obrigatória',
  }),
  biografia: z.string().optional(),
  foto: z.instanceof(File, {
    message: 'Foto de perfil',
  }).optional(),
  certificado: z.instanceof(File).optional(),
  termoConciencia: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
});
// .refine for password confirmation removed

export type CadastroMedicoFormValues = z.infer<typeof cadastroMedicoFormSchema>;
