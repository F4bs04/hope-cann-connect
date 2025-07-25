
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Medal, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface DoctorAchievement {
  id: number;
  nome: string;
  total_pacientes: number;
  total_consultas: number;
  nivel: 'Iniciante' | 'Experiente' | 'Especialista' | 'Mestre';
  foto_perfil: string | null;
}

export function DoctorRoadmap() {
  const [doctors, setDoctors] = React.useState<DoctorAchievement[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const getNivelInfo = (total_pacientes: number) => {
    if (total_pacientes >= 50) return { nivel: 'Mestre', icon: <Trophy className="w-5 h-5 text-yellow-500" /> };
    if (total_pacientes >= 30) return { nivel: 'Especialista', icon: <Medal className="w-5 h-5 text-blue-500" /> };
    if (total_pacientes >= 15) return { nivel: 'Experiente', icon: <Star className="w-5 h-5 text-purple-500" /> };
    return { nivel: 'Iniciante', icon: <Star className="w-5 h-5 text-gray-500" /> };
  };

  React.useEffect(() => {
    const fetchDoctorsAchievements = async () => {
      try {
        // Dados simulados para achievements
        const consultasSimuladas = [
          { id_medico: 1, medicos: { id: 1, nome: 'Dr. João Silva', foto_perfil: '/lovable-uploads/5c0f64ec-d529-43ac-8451-ed01f592a3f7.png' } },
          { id_medico: 2, medicos: { id: 2, nome: 'Dra. Maria Santos', foto_perfil: '/lovable-uploads/735ca9f0-ba32-4b6d-857a-70a6d3f845f0.png' } }
        ];
        const consultasData = consultasSimuladas;

        // Simulated data, no error handling needed

        const doctorsMap = new Map();
        
        consultasData.forEach(consulta => {
          if (!consulta.medicos) return;
          
          const medico = consulta.medicos;
          if (!doctorsMap.has(medico.id)) {
            doctorsMap.set(medico.id, {
              id: medico.id,
              nome: medico.nome,
              foto_perfil: medico.foto_perfil,
              total_consultas: 0,
              total_pacientes: 0
            });
          }
          
          const doctorStats = doctorsMap.get(medico.id);
          doctorStats.total_consultas += 1;
        });

        // Convert map to array and sort by total_consultas
        const doctorsArray = Array.from(doctorsMap.values())
          .map(doctor => ({
            ...doctor,
            nivel: getNivelInfo(doctor.total_consultas).nivel
          }))
          .sort((a, b) => b.total_consultas - a.total_consultas);

        setDoctors(doctorsArray);
      } catch (error) {
        console.error('Erro ao buscar conquistas dos médicos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorsAchievements();
  }, []);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking dos Médicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Carregando ranking...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum médico com consultas realizadas ainda.
          </div>
        ) : (
          <div className="grid gap-4">
            {doctors.map((doctor, index) => {
              const { icon } = getNivelInfo(doctor.total_consultas);
              return (
                <div
                  key={doctor.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0 ? 'bg-yellow-50 border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border-gray-200' :
                    index === 2 ? 'bg-orange-50 border-orange-200' :
                    'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold">
                      {index + 1}
                    </div>
                    {doctor.foto_perfil ? (
                      <img
                        src={doctor.foto_perfil}
                        alt={doctor.nome}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{doctor.nome}</h3>
                      <div className="flex items-center gap-2">
                        {icon}
                        <Badge variant={
                          doctor.nivel === 'Mestre' ? 'default' :
                          doctor.nivel === 'Especialista' ? 'secondary' :
                          doctor.nivel === 'Experiente' ? 'outline' :
                          'default'
                        }>
                          {doctor.nivel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{doctor.total_consultas}</p>
                    <p className="text-sm text-gray-500">consultas realizadas</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
