
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

const CadastroForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Setup form with react-hook-form
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
      // Format CPF to match database requirements (remove any non-digit characters)
      const formattedCpf = values.cpf.replace(/\D/g, '');
      
      // First try to create the usuario record
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.senha,
        options: {
          data: {
            full_name: values.nome,
            tipo_usuario: 'paciente',
          }
        }
      });

      if (authError) {
        console.error("Authentication error:", authError);
        throw new Error(authError.message || "Erro ao cadastrar usuário");
      }

      if (!authData?.user?.id) {
        throw new Error("Não foi possível obter o ID do usuário");
      }

      console.log("User created successfully, ID:", authData.user.id);

      // Now insert the user into the usuarios table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert([
          {
            email: values.email,
            senha: values.senha, // Note: This is redundant as auth will handle passwords
            tipo_usuario: 'paciente',
            status: true
          }
        ])
        .select('id')
        .single();

      if (userError) {
        console.error("User creation error:", userError);
        throw new Error(userError.message || "Erro ao cadastrar usuário");
      }

      // Then create a new patient record
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
        
        // If patient creation fails, delete the user we just created
        await supabase
          .from('usuarios')
          .delete()
          .eq('id', userData.id);
          
        throw new Error(pacienteError.message || "Erro ao cadastrar paciente");
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você já pode fazer login no sistema.",
      });

      navigate('/login');
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro ao fazer o cadastro. Tente novamente.",
        variant: "destructive",
      });
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
                        // Format CPF as user types
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
                        // Format phone number as user types
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
        </div>
      </form>
    </Form>
  );
};

export default CadastroForm;
