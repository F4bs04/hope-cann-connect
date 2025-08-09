import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Eye } from "lucide-react";
import { format } from "date-fns";

interface PatientRow {
  id: string;
  full_name: string | null;
  cpf: string | null;
  medical_condition: string | null;
  created_at: string;
}

const PAGE_SIZE = 10;

const PatientsTab: React.FC = () => {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("patients")
        .select("id, full_name, cpf, medical_condition, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (search.trim()) {
        const term = search.trim();
        query = query.or(
          `full_name.ilike.%${term}%,cpf.ilike.%${term}%,medical_condition.ilike.%${term}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setPatients((data || []) as PatientRow[]);
      setTotal(count || 0);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // SEO básico
    document.title = "Pacientes - Admin | HopeCann";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Lista de pacientes - administração HopeCann. Pesquise e gerencie pacientes."
      );
    } else {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      m.setAttribute(
        "content",
        "Lista de pacientes - administração HopeCann. Pesquise e gerencie pacientes."
      );
      document.head.appendChild(m);
    }
    const canonicalId = "canonical-admin-pacientes";
    let link = document.querySelector(`link[rel="canonical"]#${canonicalId}`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      link.id = canonicalId;
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Pacientes</h1>
        <p className="text-muted-foreground mt-1">Gerencie e pesquise pacientes cadastrados.</p>
      </header>

      <main>
        <section aria-labelledby="listagem-pacientes">
          <Card className="p-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF ou condição"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  aria-label="Buscar pacientes"
                />
              </div>
              <Button type="submit" variant="default">Buscar</Button>
            </form>

            <Separator className="my-4" />

            {loading ? (
              <div className="py-10 text-center text-muted-foreground">Carregando...</div>
            ) : error ? (
              <div className="py-10 text-center text-destructive">{error}</div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Condição</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Nenhum paciente encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      patients.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                          <TableCell>{p.cpf || "—"}</TableCell>
                          <TableCell>
                            {p.medical_condition ? (
                              <Badge variant="outline">{p.medical_condition}</Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>{format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" aria-label={`Ver paciente ${p.full_name || p.id}`}>
                              <Eye className="h-4 w-4 mr-2" /> Ver
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Paginação simples */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages} • {total} pacientes
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default PatientsTab;
