import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail } from "lucide-react";

interface EmailValidationInfoProps {
  email?: string;
  show: boolean;
}

export const EmailValidationInfo: React.FC<EmailValidationInfoProps> = ({ email, show }) => {
  if (!show) return null;

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <div className="flex items-start gap-2">
          <Mail className="h-4 w-4 mt-0.5 text-green-600" />
          <div>
            <p className="font-medium mb-1">Email de confirmação enviado!</p>
            <p className="text-sm">
              Enviamos um link de confirmação para <strong>{email}</strong>. 
              Clique no link para ativar sua conta.
            </p>
            <p className="text-xs mt-2 text-green-700">
              Não recebeu o email? Verifique sua caixa de spam ou tente fazer login novamente.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};