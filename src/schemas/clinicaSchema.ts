
import { z } from "zod";

export const clinicaSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  endereco: z.string().min(5, "Endereço inválido"),
  senha: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
  confirmarSenha: z.string()
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não correspondem",
  path: ["confirmarSenha"],
});

export type ClinicaFormValues = z.infer<typeof clinicaSchema>;
