
import { z } from "zod";

// Schema for doctor registration form
export const cadastroMedicoFormSchema = z.object({
  crm: z.string().min(4, {
    message: 'CRM inválido',
  }).max(14),
  telefone: z.string().min(10, {
    message: 'Telefone inválido',
  }).max(15),
  especialidade: z.string().min(3, {
    message: 'Especialidade é obrigatória',
  }),
  biografia: z.string().optional(),
  certificado: z.instanceof(File, {
    message: 'Certificado obrigatório',
  }).optional(),
  foto: z.instanceof(File, {
    message: 'Foto de perfil',
  }).optional(),
  termoConciencia: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos',
  }),
});

export type CadastroMedicoFormValues = z.infer<typeof cadastroMedicoFormSchema>;
