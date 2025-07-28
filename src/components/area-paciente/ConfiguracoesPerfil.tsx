import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Key, 
  Shield,
  Settings,
  Mail,
  Phone,
  Calendar,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordDialog from '@/components/profile/ChangePasswordDialog';

const ConfiguracoesPerfil = () => {
  const { userProfile, userType } = useAuth();

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hopecann-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-hopecann-teal" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e configurações de segurança</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-hopecann-teal/10 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-hopecann-teal" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{userProfile.full_name || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userProfile.email || 'Não informado'}</p>
                </div>
              </div>

              {userProfile.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium">{userProfile.phone}</p>
                  </div>
                </div>
              )}

              {userProfile.birth_date && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Data de Nascimento</p>
                    <p className="font-medium">
                      {new Date(userProfile.birth_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              {userProfile.gender && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline" className="w-full justify-start">
                    {userProfile.gender === 'male' ? 'Masculino' : 
                     userProfile.gender === 'female' ? 'Feminino' : 
                     'Outro'}
                  </Badge>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full" disabled>
                <User className="h-4 w-4 mr-2" />
                Editar Informações
                <Badge variant="secondary" className="ml-2 text-xs">Em breve</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Conta Protegida</span>
              </div>
              <p className="text-sm text-green-700">
                Sua conta está protegida com autenticação segura.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Senha</p>
                      <p className="text-sm text-gray-500">••••••••</p>
                    </div>
                  </div>
                  <ChangePasswordDialog>
                    <Button variant="outline" size="sm">
                      Alterar
                    </Button>
                  </ChangePasswordDialog>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">Email de Recuperação</p>
                      <p className="text-sm text-gray-500">{userProfile.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Verificado
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <ChangePasswordDialog>
                <Button className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
              </ChangePasswordDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saúde e Bem-estar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Saúde e Bem-estar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">Consultas</Badge>
            <div>
              <p className="font-medium mb-1">Histórico Médico</p>
              <p className="text-sm text-gray-600">
                Acompanhe suas consultas, receitas e prontuários através do dashboard.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">Privacidade</Badge>
            <div>
              <p className="font-medium mb-1">Dados Médicos</p>
              <p className="text-sm text-gray-600">
                Todas as suas informações médicas são protegidas e confidenciais.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">Suporte</Badge>
            <div>
              <p className="font-medium mb-1">Precisa de Ajuda?</p>
              <p className="text-sm text-gray-600">
                Nossa equipe está disponível para ajudar com qualquer dúvida sobre sua conta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfiguracoesPerfil;
