
import { useState } from 'react';

export function useDialogState() {
  const [horarioDialogOpen, setHorarioDialogOpen] = useState(false);
  const [receitaDialogOpen, setReceitaDialogOpen] = useState(false);
  const [consultaDialogOpen, setConsultaDialogOpen] = useState(false);
  const [prontuarioDialogOpen, setProntuarioDialogOpen] = useState(false);
  const [mensagemDialogOpen, setMensagemDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'calendar'>('week');

  return {
    horarioDialogOpen,
    receitaDialogOpen,
    consultaDialogOpen,
    prontuarioDialogOpen,
    mensagemDialogOpen,
    viewMode,
    setHorarioDialogOpen,
    setReceitaDialogOpen,
    setConsultaDialogOpen,
    setProntuarioDialogOpen,
    setMensagemDialogOpen,
    setViewMode
  };
}
