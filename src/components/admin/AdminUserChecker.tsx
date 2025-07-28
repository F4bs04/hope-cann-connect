import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { checkAdminUser, createAdminUser } from '@/utils/checkAdminUser';
import { User, UserCheck, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const AdminUserChecker: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form data for creating admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');

  const handleCheckAdmin = async () => {
    setChecking(true);
    setResult(null);
    
    try {
      const checkResult = await checkAdminUser();
      setResult(checkResult);
      
      if (!checkResult.exists) {
        setShowCreateForm(true);
      }
    } catch (error) {
      setResult({ 
        exists: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    } finally {
      setChecking(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminEmail || !adminPassword) {
      alert('Email e senha são obrigatórios');
      return;
    }

    setCreating(true);
    
    try {
      const createResult = await createAdminUser(adminEmail, adminPassword, adminName);
      
      if (createResult.success) {
        setResult({
          exists: true,
          count: 1,
          adminUsers: [createResult.profile],
          message: 'Usuário admin criado com sucesso!'
        });
        setShowCreateForm(false);
        setAdminEmail('');
        setAdminPassword('');
        setAdminName('');
      } else {
        setResult({
          exists: false,
          error: createResult.error
        });
      }
    } catch (error) {
      setResult({
        exists: false,
        error: error instanceof Error ? error.message : 'Erro ao criar admin'
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="text-blue-600" />
            Verificação de Usuário Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Use esta ferramenta para verificar se existe um usuário administrador cadastrado no sistema.
          </p>
          
          <Button 
            onClick={handleCheckAdmin}
            disabled={checking}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {checking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Verificando...
              </>
            ) : (
              <>
                <User className="mr-2 w-4 h-4" />
                Verificar Usuário Admin
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.exists ? (
                <CheckCircle className="text-green-600" />
              ) : (
                <AlertCircle className="text-red-600" />
              )}
              Resultado da Verificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600">
                  Erro: {result.error}
                </AlertDescription>
              </Alert>
            ) : result.exists ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    ✅ {result.message}
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Usuários Admin Encontrados:</h4>
                  {result.adminUsers?.map((admin: any, index: number) => (
                    <Card key={admin.id} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{admin.full_name || 'Nome não informado'}</p>
                            <p className="text-sm text-gray-600">{admin.email}</p>
                            <p className="text-xs text-gray-500">ID: {admin.id}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={admin.is_active ? "default" : "secondary"}>
                              {admin.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Criado: {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-600">
                  ⚠️ {result.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="text-green-600" />
              Criar Usuário Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Como não foi encontrado nenhum usuário admin, você pode criar um agora:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminEmail">Email *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@hopecann.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="adminName">Nome Completo</Label>
                <Input
                  id="adminName"
                  placeholder="Administrador HopeCann"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="adminPassword">Senha *</Label>
              <Input
                id="adminPassword"
                type="password"
                placeholder="Senha segura (mínimo 6 caracteres)"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateAdmin}
                disabled={creating || !adminEmail || !adminPassword}
                className="bg-green-600 hover:bg-green-700"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 w-4 h-4" />
                    Criar Admin
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">💡 Como usar:</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Clique em "Verificar Usuário Admin" para consultar o banco</li>
            <li>2. Se não houver admin, use o formulário para criar um</li>
            <li>3. O usuário criado terá acesso ao painel administrativo</li>
            <li>4. Você pode acessar o admin em /admin-panel</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserChecker;
