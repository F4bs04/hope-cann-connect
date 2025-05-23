import { useRef, useState } from 'react';
import { generatePdfFromHtml, downloadPdf } from '../services/pdfService';

export function usePdfGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  
  const generatePdf = async () => {
    if (!elementRef.current) return null;
    
    try {
      setIsGenerating(true);
      const blob = await generatePdfFromHtml(elementRef.current);
      setPdfBlob(blob);
      return blob;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const download = (filename: string = 'documento.pdf') => {
    if (pdfBlob) {
      downloadPdf(pdfBlob, filename);
    }
  };
  
  return {
    elementRef,
    isGenerating,
    pdfBlob,
    generatePdf,
    download
  };
}
