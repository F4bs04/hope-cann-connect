
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Doctor } from '@/components/doctors/DoctorCard';
import { useDoctorDiagnostics } from './useDoctorDiagnostics';
import { useUserDoctorMatching } from './useUserDoctorMatching';
import { useAvailableDoctors } from './useAvailableDoctors';
import { createFallbackDoctors } from '@/utils/doctorDataUtils';

/**
 * Primary hook for fetching and providing doctor data
 */
export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{success: boolean, message: string}>({
    success: true,
    message: ''
  });
  const { toast } = useToast();
  
  // Run diagnostics on the database
  const { diagnostics, isLoading: isDiagnosing } = useDoctorDiagnostics();
  
  // Match doctors with user accounts if available
  const { 
    matchedDoctors, 
    isLoading: isMatching, 
    status: matchingStatus 
  } = useUserDoctorMatching(
    diagnostics.userDoctors,
    diagnostics.allDoctors
  );
  
  // Get available doctors as fallback
  const { 
    doctors: availableDoctors, 
    isLoading: isLoadingAvailable, 
    status: availableStatus 
  } = useAvailableDoctors();
  
  useEffect(() => {
    const determineFinalDoctors = () => {
      // If we're still loading any data, don't proceed
      if (isDiagnosing || isMatching || isLoadingAvailable) {
        return;
      }
      
      // If we have matched doctors, use those
      if (matchedDoctors.length > 0) {
        setDoctors(matchedDoctors);
        setDbStatus(matchingStatus);
        setIsLoading(false);
        return;
      }
      
      // If we have available doctors, use those
      if (availableDoctors.length > 0) {
        setDoctors(availableDoctors);
        setDbStatus(availableStatus);
        setIsLoading(false);
        return;
      }
      
      // If we have no doctors at all, use fallback data
      const fallbackDoctors = createFallbackDoctors();
      setDoctors(fallbackDoctors);
      setDbStatus({
        success: false,
        message: 'Usando dados de fallback para médicos'
      });
      
      // Show toast only if we failed to get real doctors
      toast({
        title: "Dados de demonstração",
        description: "Exibindo médicos de exemplo, pois não foram encontrados médicos no banco de dados.",
        variant: "default"
      });
      
      setIsLoading(false);
    };
    
    determineFinalDoctors();
  }, [
    isDiagnosing, 
    isMatching, 
    isLoadingAvailable, 
    matchedDoctors, 
    availableDoctors, 
    matchingStatus, 
    availableStatus, 
    toast
  ]);
  
  return { doctors, isLoading, dbStatus };
};
