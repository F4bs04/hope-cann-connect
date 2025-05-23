
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PdfUploadProps {
  onUploadComplete: (filePath: string) => void;
  userId?: number | null;
  pacienteId?: number | null;
  docType: 'receita' | 'atestado' | 'laudo' | 'pedido_exame' | 'prescricao';
}

const PdfUpload: React.FC<PdfUploadProps> = ({ onUploadComplete, userId, pacienteId, docType }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Verificar tamanho do arquivo (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError('O arquivo não pode ser maior que 5MB');
        return;
      }
      
      // Verificar tipo de arquivo
      if (selectedFile.type !== 'application/pdf') {
        setUploadError('Apenas arquivos PDF são permitidos');
        return;
      }
      
      setFile(selectedFile);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Selecione um arquivo PDF para upload');
      return;
    }

    if (!userId) {
      setUploadError('ID do médico não encontrado');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Definir formato de caminho: medicoId/pacienteId/tipo/timestamp_nomeoriginal.pdf
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}/${pacienteId || 'sem-paciente'}/${docType}/${timestamp}_${file.name}`;

      const { data, error } = await supabase.storage
        .from('documentos_medicos')
        .upload(fileName, file, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Retornar o caminho do arquivo
      onUploadComplete(data.path);
      setUploadSuccess(true);
      
      toast({
        title: "Upload concluído",
        description: "O documento PDF foi anexado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadError(error.message || 'Ocorreu um erro durante o upload do arquivo');
      
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message || 'Ocorreu um erro durante o upload do arquivo',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="mb-4 text-center">
        <h3 className="font-medium mb-2">Anexar documento PDF</h3>
        <p className="text-sm text-gray-500">Formato PDF, tamanho máximo de 5MB</p>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        {file ? (
          <div className="flex items-center p-2 bg-white border rounded">
            <File className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100 cursor-pointer" onClick={() => document.getElementById('pdf-upload')?.click()}>
            <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Clique para selecionar um arquivo PDF</p>
          </div>
        )}
        <input 
          type="file" 
          id="pdf-upload" 
          className="hidden" 
          accept="application/pdf" 
          onChange={handleFileChange}
        />
      </div>
      
      {uploadError && (
        <div className="flex items-center text-red-600 text-sm mb-4">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{uploadError}</span>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="flex items-center text-green-600 text-sm mb-4">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span>Upload concluído com sucesso!</span>
        </div>
      )}
      
      <div className="flex justify-between">
        {file && !uploadSuccess && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => setFile(null)}
          >
            Remover arquivo
          </Button>
        )}
        
        <Button 
          type="button" 
          size="sm"
          disabled={!file || isUploading || uploadSuccess}
          className={file && !uploadSuccess ? "ml-auto" : "mx-auto"}
          onClick={handleUpload}
        >
          {isUploading ? 'Enviando...' : 'Fazer upload'}
        </Button>
      </div>
    </div>
  );
};

export default PdfUpload;
