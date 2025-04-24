
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { clinicaSchema } from "@/schemas/clinicaSchema";
import type { ClinicaFormValues } from "@/schemas/clinicaSchema";

const CadastroClinica = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<ClinicaFormValues>({
    resolver: zodResolver(clinicaSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      email: "",
      telefone: "",
      endereco: "",
    }
  });

  const onSubmit = async (values: ClinicaFormValues) => {
    try {
      // First create the clinic
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinicas')
        .insert([{
          nome: values.nome,
          cnpj: values.cnpj,
          email: values.email,
          telefone: values.telefone,
          endereco: values.endereco
        }])
        .select()
        .single();

      if (clinicError) throw clinicError;

      // Get the current user
      const userEmail = localStorage.getItem('userEmail');
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (userError) throw userError;

      // Create clinic user association
      const { error: clinicUserError } = await supabase
        .from('clinic_users')
        .insert([{
          user_id: userData.id,
          clinic_id: clinicData.id,
          role: 'admin'
        }]);

      if (clinicUserError) throw clinicUserError;

      toast({
        title: "Clínica cadastrada com sucesso",
        description: "Você será redirecionado para o dashboard da clínica.",
      });

      navigate('/admin');
    } catch (error: any) {
      console.error('Error registering clinic:', error);
      toast({
        title: "Erro ao cadastrar clínica",
        description: error.message || "Ocorreu um erro ao cadastrar a clínica.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">Cadastro de Clínica</h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Clínica</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da clínica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@clinica.com" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="(00) 0000-0000" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Cadastrar Clínica
              </Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CadastroClinica;
