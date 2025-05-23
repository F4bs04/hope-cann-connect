import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePdfFromHtml(
  element: HTMLElement, 
  filename: string = 'documento.pdf',
  options = {}
): Promise<Blob> {
  console.log('Iniciando geração de PDF para elemento:', element);
  
  if (!element) {
    console.error('Elemento não encontrado');
    throw new Error('Elemento não encontrado para geração de PDF');
  }
  
  // Verificar se o elemento está no DOM
  if (!document.body.contains(element)) {
    console.warn('Elemento não está no DOM. Verifique se o ref está sendo usado corretamente.');
  }
  
  try {
    // Opções padrão que funcionam bem com React + Vite
    const defaultOptions = {
      scale: 2, // Melhor qualidade
      useCORS: true, // Permite imagens de outras origens
      allowTaint: true,
      logging: true, // Ativar logs para debug
      backgroundColor: '#ffffff',
      // Ajuda a capturar elementos que estão posicionados fora da tela
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight
    };

    console.log('Iniciando html2canvas com opções:', { ...defaultOptions, ...options });
    
    // Certificar que o elemento é visível para captura
    const originalOpacity = element.style.opacity;
    const originalVisibility = element.style.visibility;
    
    // Tornar o elemento visível durante a captura
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    
    // Capture o elemento HTML
    const canvas = await html2canvas(element, { ...defaultOptions, ...options });
    console.log('Canvas gerado com sucesso:', canvas);
    
    // Converta para imagem
    const imgData = canvas.toDataURL('image/png');
    console.log('Imagem convertida, tamanho aproximado:', Math.round(imgData.length / 1024), 'KB');
    
    // Configure o PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Adicione a imagem ao PDF
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Restaurar as propriedades originais do elemento
    element.style.opacity = originalOpacity;
    element.style.visibility = originalVisibility;
    
    console.log('PDF gerado com sucesso');
    
    // Retorne como blob para permitir download ou preview
    return pdf.output('blob');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}

export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Limpe o URL após o download
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
