
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FilePlus, FileText, Calendar, Download, Eye, FileUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { getReceitas, getDocumentUrl, downloadDocument } from '@/services/supabaseService';
import { supabase } from "@/integrations/supabase/client";

const Receitas: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('ativas');
  const [receitas, setReceitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadReceitas = async () => {
      setLoading(true);
      const data = await getReceitas();
      setReceitas(data);
      setLoading(false);
    };
    
    loadReceitas();
  }, []);
  
  const filteredReceitas = receitas.filter(receita => 
    (receita.pacientes_app?.nome?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    receita.medicamento?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedTab === 'todas' || receita.status === selectedTab)
  );

  const handleDownload = async (receita: any) => {
    if (receita.arquivo_pdf) {
      // Se for um arquivo PDF, fazer download do Storage
      toast({
        title: "Download iniciado",
        description: "O arquivo PDF está sendo preparado para download",
      });
      
      try {
        // Extrair o nome original do arquivo da path
        const fileName = receita.arquivo_pdf.split('/').pop() || `receita-${receita.id}.pdf`;
        const success = await downloadDocument(receita.arquivo_pdf, fileName);
        
        if (success) {
          toast({
            title: "Download concluído",
            description: "O PDF foi baixado com sucesso",
          });
        }
      } catch (error) {
        console.error("Erro ao baixar PDF:", error);
        toast({
          variant: "destructive",
          title: "Erro no download",
          description: "Não foi possível baixar o arquivo PDF",
        });
      }
    } else {
      // Receita normal, simular download
      toast({
        title: "Download iniciado",
        description: "A receita está sendo preparada para download",
      });
      
      // Simulate download
      setTimeout(() => {
        toast({
          title: "Download concluído",
          description: "A receita foi baixada com sucesso",
        });
      }, 1500);
    }
  };

  const handleViewPrescription = (id: number) => {
    // Navigation or modal to view prescription details
    toast({
      title: "Visualizando receita",
      description: "Detalhes da receita #" + id,
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Receitas</h1>
        <p className="text-gray-600">
          Visualize e gerencie receitas médicas
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por paciente ou medicamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          className="bg-[#00B3B0] hover:bg-[#009E9B]"
          onClick={() => window.location.href = '/area-medico?tab=prescricoes'}
        >
          <FilePlus className="h-4 w-4 mr-2" /> Nova Receita
        </Button>
      </div>
      
      <Tabs defaultValue="ativas" className="mb-6" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="ativa">Ativas</TabsTrigger>
          <TabsTrigger value="expirada">Expiradas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {loading ? (
        <div className="text-center py-10">
          <p>Carregando receitas...</p>
        </div>
      ) : filteredReceitas.length > 0 ? (
        <div className="grid gap-4">
          {filteredReceitas.map(receita => {
            const isExpired = receita.status === 'expirada';
            const dataEmissao = new Date(receita.data);
            const dataValidade = new Date(receita.data_validade);
            const isPdf = !!receita.arquivo_pdf;
            
            return (
              <Card 
                key={receita.id}
                className={`overflow-hidden hover:shadow-md transition-shadow ${isExpired ? 'opacity-70' : ''}`}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className={`${isExpired ? 'bg-gray-500' : 'bg-[#00B3B0]'} p-4 text-white flex items-center justify-center md:w-16`}>
                      {isPdf ? <FileUp className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                    </div>
                    
                    <div className="p-4 flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h3 className="font-medium text-lg">{receita.pacientes_app?.nome}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 md:mt-0">
                          {isPdf && (
                            <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">PDF Anexado</span>
                          )}
                          {isExpired && (
                            <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">Expirada</span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-800 font-medium mb-1">{receita.medicamento}</p>
                      <p className="text-gray-600 mb-4 text-sm">{receita.posologia}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          Emissão: {format(dataEmissao, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          Válida até: {format(dataValidade, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 flex flex-row md:flex-col gap-2 justify-center md:w-48">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewPrescription(receita.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" /> Visualizar
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDownload(receita)}
                      >
                        <Download className="h-4 w-4 mr-2" /> Baixar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhuma receita encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Receitas;
