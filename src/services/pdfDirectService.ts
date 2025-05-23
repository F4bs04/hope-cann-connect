import jsPDF from 'jspdf';

// Definição de estilos para o PDF
const styles = {
  title: { fontSize: 18, fontStyle: 'bold', align: 'center' },
  subtitle: { fontSize: 14, fontStyle: 'bold', align: 'center' },
  sectionTitle: { fontSize: 12, fontStyle: 'bold' },
  normal: { fontSize: 10 },
  small: { fontSize: 8 },
};

interface PrescricaoData {
  paciente: {
    nome: string;
    cpf?: string;
    data_nascimento?: string;
  };
  medico: {
    nome: string;
    crm: string;
    especialidade: string;
  };
  receita: {
    medicamento: string;
    posologia: string;
    tempoUso: string;
    periodo: string;
    permiteSubstituicao: string;
    cid?: string;
    tipoReceita: string;
    observacoes?: string;
    data_criacao: Date;
    data_validade: Date;
  };
}

export function generatePrescricaoPDF(data: PrescricaoData): Blob {
  // Criar novo documento PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Configurações de página
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let y = 20; // Posição vertical inicial
  
  // Cabeçalho
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(styles.title.fontSize);
  pdf.text('HOPE CANN CONNECT', pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  pdf.setFontSize(styles.subtitle.fontSize);
  pdf.text('PRESCRIÇÃO MÉDICA', pageWidth / 2, y, { align: 'center' });
  
  y += 6;
  pdf.setFontSize(styles.small.fontSize);
  pdf.text(`Tipo: ${data.receita.tipoReceita.toUpperCase()}`, pageWidth / 2, y, { align: 'center' });
  
  // Linha separadora
  y += 8;
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);
  
  // Dados do paciente
  y += 10;
  pdf.setFontSize(styles.sectionTitle.fontSize);
  pdf.text('Informações do Paciente', margin, y);
  
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(styles.normal.fontSize);
  pdf.text(`Nome: ${data.paciente.nome}`, margin, y);
  
  if (data.paciente.cpf) {
    y += 6;
    pdf.text(`CPF: ${data.paciente.cpf}`, margin, y);
  }
  
  if (data.paciente.data_nascimento) {
    y += 6;
    pdf.text(`Data de Nascimento: ${data.paciente.data_nascimento}`, margin, y);
  }
  
  // Dados da prescrição
  y += 12;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(styles.sectionTitle.fontSize);
  pdf.text('Prescrição', margin, y);
  
  y += 8;
  // Caixa de medicamento
  pdf.setFillColor(245, 245, 245);
  pdf.rect(margin, y, contentWidth, 35, 'F');
  
  // Medicamento e posologia
  y += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(styles.normal.fontSize);
  pdf.text(data.receita.medicamento, margin + 4, y);
  
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Posologia: ${data.receita.posologia}`, margin + 4, y);
  
  y += 6;
  pdf.text(`Tempo de Uso: ${data.receita.tempoUso} ${data.receita.periodo}`, margin + 4, y);
  
  y += 6;
  pdf.text(`Permite Substituição: ${data.receita.permiteSubstituicao}`, margin + 4, y);
  
  // Observações (se houver)
  if (data.receita.observacoes) {
    y += 12;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Observações:', margin, y);
    
    y += 6;
    pdf.setFont('helvetica', 'normal');
    
    // Quebrar texto longo em várias linhas
    const splitObservacoes = pdf.splitTextToSize(data.receita.observacoes, contentWidth);
    pdf.text(splitObservacoes, margin, y);
    
    // Ajustar posição vertical baseado no número de linhas
    y += splitObservacoes.length * 6;
  }
  
  // Datas
  y += 12;
  pdf.text(`Data de Emissão: ${formatDate(data.receita.data_criacao)}`, margin, y);
  
  y += 6;
  pdf.text(`Validade: ${formatDate(data.receita.data_validade)}`, margin, y);
  
  // Assinatura do médico
  y += 25;
  const signatureWidth = 60;
  pdf.line(
    pageWidth / 2 - signatureWidth / 2, 
    y, 
    pageWidth / 2 + signatureWidth / 2, 
    y
  );
  
  y += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(styles.normal.fontSize);
  pdf.text(data.medico.nome, pageWidth / 2, y, { align: 'center' });
  
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(styles.small.fontSize);
  pdf.text(`CRM: ${data.medico.crm} - ${data.medico.especialidade}`, pageWidth / 2, y, { align: 'center' });
  
  // Rodapé
  const pageHeight = pdf.internal.pageSize.getHeight();
  y = pageHeight - 20;
  
  pdf.setFontSize(styles.small.fontSize);
  pdf.text('Documento gerado digitalmente pelo sistema Hope Cann Connect', pageWidth / 2, y, { align: 'center' });
  
  y += 5;
  pdf.text(`© ${new Date().getFullYear()} - Todos os direitos reservados`, pageWidth / 2, y, { align: 'center' });
  
  // Retornar como blob
  return pdf.output('blob');
}

// Função auxiliar para formatar datas
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Função para download do PDF
export function downloadPDF(blob: Blob, filename: string): void {
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
