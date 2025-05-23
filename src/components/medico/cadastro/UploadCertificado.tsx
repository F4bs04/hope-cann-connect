
import React from 'react';
import { Upload, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

interface UploadCertificadoProps {
  certificadoNome: string | null;
  setCertificadoNome?: React.Dispatch<React.SetStateAction<string | null>>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'certificado' | 'foto') => void;
}

const UploadCertificado = ({ 
  certificadoNome, 
  setCertificadoNome, 
  handleFileChange 
}: UploadCertificadoProps) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="certificado"
      render={() => (
        <FormItem>
          <FormLabel>Certificado Digital PFX A1 (Opcional)</FormLabel>
          <FormControl>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('certificado')?.click()}
                className="w-full py-8 border-dashed border-2 flex flex-col items-center justify-center gap-2"
              >
                <Upload className="h-6 w-6 text-hopecann-green" />
                <span>{certificadoNome || "Clique para enviar certificado (opcional)"}</span>
                <span className="text-xs text-gray-500">Apenas arquivos .pfx</span>
                <input
                  id="certificado"
                  type="file"
                  accept=".pfx"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'certificado')}
                />
              </Button>
            </div>
          </FormControl>
          <FormDescription>
            <div className="flex items-start gap-2 text-sm mt-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Este certificado é usado para a assinatura digital de receitas e prontuários, mas não é obrigatório para o cadastro.</span>
            </div>
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UploadCertificado;
