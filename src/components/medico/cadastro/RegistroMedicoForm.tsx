
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import HorariosAtendimento from './HorariosAtendimento';
import TermosResponsabilidade from './TermosResponsabilidade';
import UploadCertificado from './UploadCertificado';
import FotoPerfil from './FotoPerfil';
import { DiaHorario } from '@/hooks/useMedicoRegistro';
import { CadastroMedicoFormValues } from '@/schemas/cadastroSchema';
import { UseFormReturn } from 'react-hook-form';

interface RegistroMedicoFormProps {
  form: UseFormReturn<CadastroMedicoFormValues>;
  isLoading: boolean;
  fotoPreview: string | null;
  certificadoNome: string | null;
  termoDialogOpen: boolean;
  horarios: DiaHorario[];
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'certificado' | 'foto') => void;
  handleTelefoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCRMChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (data: CadastroMedicoFormValues) => void;
  setHorarios: React.Dispatch<React.SetStateAction<DiaHorario[]>>;
  setTermoDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hasUserPhoto: boolean;
}

const RegistroMedicoForm: React.FC<RegistroMedicoFormProps> = ({
  form,
  isLoading,
  fotoPreview,
  certificadoNome,
  termoDialogOpen,
  horarios,
  handleFileChange,
  handleTelefoneChange,
  handleCRMChange,
  onSubmit,
  setHorarios,
  setTermoDialogOpen,
  hasUserPhoto
}) => {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Foto de perfil (opcional se já tiver do Google) */}
        {!hasUserPhoto && (
          <FotoPerfil 
            fotoPreview={fotoPreview} 
            handleFileChange={handleFileChange}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="crm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CRM</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="000000/UF" 
                    {...field} 
                    onChange={(e) => {
                      handleCRMChange(e);
                      field.onChange(e);
                    }}
                  />
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
                <FormLabel>Telefone de contato</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999"
                    {...field} 
                    onChange={(e) => {
                      handleTelefoneChange(e);
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="especialidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidade</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Neurologia, Psiquiatria, etc." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="biografia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia Profissional</FormLabel>
              <FormControl>
                <textarea 
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-hopecann-teal/40" 
                  placeholder="Descreva sua experiência profissional e formação"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Esta informação será exibida em seu perfil público.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <HorariosAtendimento horarios={horarios} setHorarios={setHorarios} />

        <UploadCertificado 
          certificadoNome={certificadoNome}
          handleFileChange={handleFileChange}
        />

        <FormField
          control={form.control}
          name="termoConciencia"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Estou ciente das responsabilidades médicas relacionadas à prescrição de produtos à base de cannabis
                </FormLabel>
                <FormDescription>
                  <button 
                    type="button"
                    className="text-hopecann-teal hover:underline"
                    onClick={() => setTermoDialogOpen(true)}
                  >
                    Ler termo completo
                  </button>
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-hopecann-green hover:bg-hopecann-green/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Processando...
            </span>
          ) : "Concluir Cadastro"}
        </Button>
      </form>
    </FormProvider>
  );
};

export default RegistroMedicoForm;
