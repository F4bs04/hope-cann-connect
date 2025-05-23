
import React from 'react';
import { Camera, User } from 'lucide-react';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';

interface FotoPerfilProps {
  fotoPreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'certificado' | 'foto') => void;
}

const FotoPerfil = ({ fotoPreview, handleFileChange }: FotoPerfilProps) => {
  const form = useFormContext();
  
  return (
    <FormField
      control={form.control}
      name="foto"
      render={({ field }) => (
        <FormItem className="flex flex-col items-center">
          <FormLabel className="w-full text-left">Foto de perfil</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center">
              <div 
                className="w-32 h-32 rounded-full border-2 border-dashed border-hopecann-teal/50 flex items-center justify-center overflow-hidden mb-2 relative hover:border-hopecann-teal cursor-pointer"
                onClick={() => document.getElementById('foto-perfil')?.click()}
              >
                {fotoPreview ? (
                  <img 
                    src={fotoPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-gray-400" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <input
                id="foto-perfil"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'foto')}
              />
              <span className="text-sm text-gray-500">Clique para enviar uma foto</span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FotoPerfil;
