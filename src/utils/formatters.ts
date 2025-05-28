export const formatTelefone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const formatCRM = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{6})(\d)/, '$1/$2');
};

export const formatarCPF = (cpfValue?: string) => {
  if (!cpfValue) return 'Não informado';
  // Remove non-digits
  const cleanedCpf = cpfValue.replace(/\D/g, '');
  // Apply CPF mask
  if (cleanedCpf.length === 11) {
    return cleanedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpfValue; // Return original if not a valid CPF length after cleaning
};

export const formatarDataParaDisplay = (data?: string) => {
  if (!data) return 'Não informado';
  try {
    // Check if data is already in yyyy-MM-dd format (common from date inputs or DB)
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const [year, month, day] = data.split('-');
      // Ensure parts are valid before formatting
      if (parseInt(month, 10) > 0 && parseInt(month, 10) <= 12 && parseInt(day, 10) > 0 && parseInt(day, 10) <= 31) {
        return `${day}/${month}/${year}`;
      }
    }
    // Check if data is already in dd/MM/yyyy format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
       const [day, month, year] = data.split('/');
       if (parseInt(month, 10) > 0 && parseInt(month, 10) <= 12 && parseInt(day, 10) > 0 && parseInt(day, 10) <= 31) {
        return data; // Already in correct display format
      }
    }
    
    // Attempt to parse other valid date strings or Date objects
    // Adjust for timezone offset, as Date constructor interprets yyyy-MM-dd as UTC midnight
    const dateObj = new Date(data);
    if (isNaN(dateObj.getTime())) return 'Data inválida';
    
    // If the input string for new Date() does not include timezone info,
    // it might be parsed as local or UTC depending on the string format and browser.
    // For "YYYY-MM-DD", it's UTC. We add offset to get local day correct.
    let adjustedDate = dateObj;
    if (/^\d{4}-\d{2}-\d{2}$/.test(data) || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(data)) {
        const offset = dateObj.getTimezoneOffset();
        adjustedDate = new Date(dateObj.getTime() + offset * 60 * 1000);
    }
    
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = adjustedDate.getFullYear();
    return `${day}/${month}/${year}`;

  } catch (e) {
    console.error("Erro ao formatar data para display:", e);
    return data; // Fallback to original data string if formatting fails
  }
};
