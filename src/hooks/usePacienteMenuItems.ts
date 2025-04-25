
import { CalendarDays, FileText, File, Users, HeartPulse, UserCircle } from 'lucide-react';

export const usePacienteMenuItems = () => {
  return [
    {
      key: 'dashboard',
      icon: CalendarDays,
      label: 'Início'
    },
    {
      key: 'consultas',
      icon: HeartPulse,
      label: 'Consultas'
    },
    {
      key: 'receitas',
      icon: FileText,
      label: 'Receitas'
    },
    {
      key: 'laudos',
      icon: File,
      label: 'Laudos'
    },
    {
      key: 'atestados',
      icon: File,
      label: 'Atestados'
    },
    {
      key: 'pedidos-exame',
      icon: File,
      label: 'Pedidos de Exame'
    },
    {
      key: 'medicos',
      icon: Users,
      label: 'Meus Médicos'
    },
    {
      key: 'perfil',
      icon: UserCircle,
      label: 'Meu Perfil'
    },
  ];
};
