
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Calendar, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cadastroSchema, CadastroFormValues } from '@/schemas/cadastroSchema';

interface CadastroFormProps {
  fromScheduling?: boolean;
}

const CadastroForm: React.FC<CadastroFormProps> = ({ fromScheduling = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      email: "",
      telefone: "",
      data_nascimento: "",
      endereco: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  const handleCadastro = async (values: CadastroFormValues) => {
    setIsLoading(true);

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', values.email)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
        console.error("Error checking existing user:", checkError);
        throw new Error("Erro ao verificar usuário existente. Tente novamente.");
      }
      
      if (existingUser) {
        toast({
          variant: "destructive",
          title: "Email já cadastrado",
          description: "Este email já está sendo utilizado. Tente fazer login ou use outro email.",
        });
        setIsLoading(false);
        return;
      }

      const formattedCpf = values.cpf.replace(/\D/g, '');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.senha,
        options: {
          data: {
            full_name: values.nome,
            tipo_usuario: 'paciente', // Ensure this is set if needed by auth triggers/policies
          }
        }
      });

      if (authError) {
        console.error("Authentication error:", authError);
        if (authError.message?.includes('User already registered')) {
          throw new Error("Este email já está cadastrado no sistema de autenticação. Tente fazer login ou use outro email.");
        }
        throw new Error(authError.message || "Erro ao cadastrar usuário na autenticação");
      }

      if (!authData?.user?.id) {
        throw new Error("Não foi possível obter o ID do usuário da autenticação");
      }

      console.log("Supabase Auth User created successfully, ID:", authData.user.id);

      // The 'senha' column in 'usuarios' table is now nullable.
      // We pass the plaintext password to 'senha_hash' and the trigger handles hashing.
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert(
          {
            email: values.email,
            senha_hash: values.senha, // Pass plaintext to be hashed by trigger
            tipo_usuario: 'paciente',
            status: true
          }
        )
        .select('id')
        .single();

      if (userError) {
        console.error("Public.usuarios creation error:", userError);
        // Attempt to clean up the auth user if 'usuarios' table insert fails
        await supabase.auth.admin.deleteUser(authData.user.id); // Requires admin privileges, ensure this is set up if used
        throw new Error(userError.message || "Erro ao cadastrar dados do usuário");
      }
      
      if (!userData?.id) {
        throw new Error("Não foi possível obter o ID do usuário da tabela 'usuarios'");
      }

      const { error: pacienteError } = await supabase
        .from('pacientes')
        .insert([
          {
            id_usuario: userData.id,
            nome: values.nome,
            cpf: formattedCpf,
            data_nascimento: values.data_nascimento,
            endereco: values.endereco,
            telefone: values.telefone,
            email: values.email
          }
        ]);

      if (pacienteError) {
        console.error("Patient creation error:", pacienteError);
        
        // Attempt to clean up 'usuarios' and auth user if 'pacientes' table insert fails
        await supabase
          .from('usuarios')
          .delete()
          .eq('id', userData.id);
        await supabase.auth.admin.deleteUser(authData.user.id); // Requires admin privileges
          
        throw new Error(pacienteError.message || "Erro ao cadastrar paciente");
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você será redirecionado para sua área.",
      });

      // Set localStorage items for immediate use by ProtectedRoute and other hooks
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', values.email);
      localStorage.setItem('userId', userData.id.toString());
      localStorage.setItem('userType', 'paciente');
      localStorage.setItem('authTimestamp', Date.now().toString());
      // Clear any previous toast flags that might cause issues on the next page
      localStorage.removeItem('toast-shown-auth');
      localStorage.removeItem('toast-shown-perm');


      if (fromScheduling) {
        navigate('/agendar');
      } else {
        navigate('/area-paciente'); // Navigate directly to the patient area
      }
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.code === '23505' || error.message?.includes('already registered') || error.message?.includes('já está cadastrado')) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está sendo utilizado. Tente fazer login ou use outro email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao cadastrar",
          description: error.message || "Ocorreu um erro ao fazer o cadastro. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCadastro)} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="Seu nome completo"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      className="pl-10"
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 11) {
                          value = value
                            .replace(/(\d{3})(\d)/, '$1.$2')
                            .replace(/(\d{3})(\d)/, '$1.$2')
                            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                            .replace(/(-\d{2})\d+?$/, '$1');
                        }
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="seu@email.com"
                      className="pl-10"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
                      className="pl-10"
                      {...field}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 11) {
                          value = value
                            .replace(/(\d{2})(\d)/, '($1) $2')
                            .replace(/(\d{5})(\d)/, '$1-$2')
                            .replace(/(-\d{4})\d+?$/, '$1');
                        }
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data_nascimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      type="date"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      placeholder="Seu endereço completo"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmarSenha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-hopecann-teal hover:bg-hopecann-teal/90" 
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Cadastrar"}
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <a href="/login" className="text-hopecann-teal hover:underline">
              Faça login
            </a>
          </p>
          
          {fromScheduling && (
            <p className="text-sm text-hopecann-teal mt-2">
              <a href="/agendar" className="hover:underline">
                Voltar para agendamento
              </a>
            </p>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CadastroForm;
