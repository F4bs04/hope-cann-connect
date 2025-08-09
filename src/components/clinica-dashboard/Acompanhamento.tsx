import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, Activity, UserCheck, Ban, Calendar, FileText, CheckCircle, XCircle, DollarSign } from "lucide-react";

interface DoctorItem {
  id: string;
  user_id: string;
  specialty: string | null;
  is_approved: boolean;
  is_suspended: boolean;
  consultation_fee: number | null;
  profile?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  };
}

interface ActivityLog {
  id: string;
  user_id: string | null;
  activity_type: string;
  description: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

const Acompanhamento: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [openDoctorId, setOpenDoctorId] = useState<string | null>(null);
  const [logsByUserId, setLogsByUserId] = useState<Record<string, { loading: boolean; error: string | null; logs: ActivityLog[] }>>({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: doctorsData, error: doctorsError } = await supabase
          .from("doctors")
          .select("id, user_id, specialty, is_approved, is_suspended, consultation_fee")
          .order("created_at", { ascending: false });

        if (doctorsError) throw doctorsError;

        const userIds = Array.from(new Set((doctorsData || []).map((d) => d.user_id).filter(Boolean)));

        let profilesById: Record<string, { id: string; full_name: string; email: string; avatar_url?: string | null }> = {};
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, email, avatar_url")
            .in("id", userIds);

          if (profilesError) throw profilesError;
          profilesById = (profilesData || []).reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
            // eslint-disable-next-line no-use-before-define
          }, {} as Record<string, { id: string; full_name: string; email: string; avatar_url?: string | null }>);
        }

        const mapped: DoctorItem[] = (doctorsData || []).map((d) => ({
          id: d.id as string,
          user_id: d.user_id as string,
          specialty: (d as any).specialty ?? null,
          is_approved: !!(d as any).is_approved,
          is_suspended: !!(d as any).is_suspended,
          consultation_fee: (d as any).consultation_fee ?? null,
          profile: d.user_id ? profilesById[d.user_id] : undefined,
        }));

        setDoctors(mapped);
      } catch (err: any) {
        console.error("Erro ao carregar médicos:", err);
        setError("Não foi possível carregar os médicos.");
        toast({
          variant: "destructive",
          title: "Erro ao carregar",
          description: "Falha ao obter lista de médicos.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [toast]);

  const handleToggleLogs = async (doctor: DoctorItem) => {
    const newOpen = openDoctorId === doctor.id ? null : doctor.id;
    setOpenDoctorId(newOpen);

    if (!newOpen) return; // closed

    // Fetch logs lazily if not loaded
    const key = doctor.user_id;
    if (!key) return;

    if (!logsByUserId[key]) {
      setLogsByUserId((prev) => ({ ...prev, [key]: { loading: true, error: null, logs: [] } }));
      const { data, error: logsError } = await supabase
        .from("activity_logs")
        .select("id, user_id, activity_type, description, ip_address, user_agent, created_at")
        .eq("user_id", key)
        .order("created_at", { ascending: false })
        .limit(100);

      if (logsError) {
        console.error("Erro ao carregar logs:", logsError);
        setLogsByUserId((prev) => ({
          ...prev,
          [key]: { loading: false, error: "Sem permissão para visualizar logs ou nenhum log encontrado.", logs: [] },
        }));
        toast({
          variant: "destructive",
          title: "Não foi possível carregar os logs",
          description: "É necessário perfil de administrador para visualizar os logs.",
        });
      } else {
        const typedLogs: ActivityLog[] = (data || []).map((l: any) => ({
          id: String(l.id),
          user_id: l.user_id ? String(l.user_id) : null,
          activity_type: String(l.activity_type || ''),
          description: l.description ?? null,
          ip_address: l.ip_address != null ? String(l.ip_address) : null,
          user_agent: l.user_agent != null ? String(l.user_agent) : null,
          created_at: String(l.created_at),
        }));
        setLogsByUserId((prev) => ({ ...prev, [key]: { loading: false, error: null, logs: typedLogs } }));
      }
    }
  };

  const filteredDoctors = useMemo(() => doctors, [doctors]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <section aria-labelledby="acompanhamento-title" className="space-y-6">
      <header className="space-y-1">
        <h2 id="acompanhamento-title" className="text-2xl font-semibold tracking-tight">Acompanhamento</h2>
        <p className="text-sm text-muted-foreground">Selecione um médico para visualizar as atividades registradas no sistema.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map((doc) => {
          const name = doc.profile?.full_name || "Médico(a)";
          const email = doc.profile?.email || "";
          const isOpen = openDoctorId === doc.id;

          return (
            <Card key={doc.id} className={cn("transition-shadow", isOpen ? "shadow-md" : "hover:shadow-sm")}> 
              <Collapsible open={isOpen} onOpenChange={() => handleToggleLogs(doc)}>
                <CollapsibleTrigger asChild>
                  <button className="w-full text-left">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {doc.profile?.avatar_url && <AvatarImage src={doc.profile.avatar_url} alt={`Avatar de ${name}`} />}
                        <AvatarFallback>
                          {name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="truncate">{name}</CardTitle>
                        <div className="text-sm text-muted-foreground truncate">{email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.is_approved ? (
                          <Badge variant="secondary" className="whitespace-nowrap">
                            <UserCheck className="mr-1 h-3 w-3" /> Aprovado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="whitespace-nowrap">
                            <Ban className="mr-1 h-3 w-3" /> Pendente
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <Separator className="mx-6" />
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {doc.specialty && (
                        <Badge variant="outline">{doc.specialty}</Badge>
                      )}
                      {typeof doc.consultation_fee === "number" && (
                        <span className="inline-flex items-center gap-1">
                          <DollarSign className="h-4 w-4" /> {Number(doc.consultation_fee).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      )}
                      {doc.is_suspended && (
                        <Badge variant="destructive">Suspenso</Badge>
                      )}
                    </div>

                    {/* Logs */}
                    {(() => {
                      const key = doc.user_id;
                      const state = key ? logsByUserId[key] : undefined;
                      if (!key || !state) {
                        return (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Activity className="h-4 w-4" /> Clique para carregar os logs.
                          </div>
                        );
                      }

                      if (state.loading) {
                        return (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Carregando logs...
                          </div>
                        );
                      }

                      if (state.error) {
                        return (
                          <div className="text-sm text-destructive">{state.error}</div>
                        );
                      }

                      if (!state.logs.length) {
                        return (
                          <div className="text-sm text-muted-foreground">Nenhuma atividade encontrada para este médico.</div>
                        );
                      }

                      return (
                        <ul className="space-y-2">
                          {state.logs.map((log) => (
                            <li key={log.id} className="rounded-md border p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-medium">
                                  {renderIconForActivity(log.activity_type)}
                                  <span className="capitalize">{formatActivityType(log.activity_type)}</span>
                                </div>
                                <time className="text-xs text-muted-foreground">
                                  {new Date(log.created_at).toLocaleString("pt-BR")}
                                </time>
                              </div>
                              {log.description && (
                                <p className="mt-1 text-sm text-muted-foreground break-words">{log.description}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      );
                    })()}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

function formatActivityType(type: string) {
  // Normaliza possíveis tipos esperados pelo pedido
  const map: Record<string, string> = {
    criar_documento: "Criar documento",
    agendar: "Agendar",
    desmarcar: "Desmarcar",
    aprovar: "Aprovar",
    cancelar: "Cancelar",
    efetuar: "Efetuar",
  };

  return map[type] || type.replace(/_/g, " ");
}

function renderIconForActivity(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes("document")) return <FileText className="h-4 w-4 text-primary" />;
  if (normalized.includes("agendar") || normalized.includes("agenda")) return <Calendar className="h-4 w-4 text-primary" />;
  if (normalized.includes("aprova")) return <CheckCircle className="h-4 w-4 text-primary" />;
  if (normalized.includes("cancel") || normalized.includes("desmarc")) return <XCircle className="h-4 w-4 text-destructive" />;
  if (normalized.includes("efetu")) return <DollarSign className="h-4 w-4 text-primary" />;
  return <Activity className="h-4 w-4 text-primary" />;
}

export default Acompanhamento;
