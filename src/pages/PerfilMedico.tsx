import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Award, 
  Calendar,
  ArrowLeft,
  Phone,
  Mail,
  Stethoscope
} from 'lucide-react';
import { fetchDoctorById } from '@/utils/doctorDataUtils';
import { supabase } from '@/integrations/supabase/client';

interface DoctorRating {
  id: string;
  rating: number;
  comment: string;
  patient_name: string;
  created_at: string;
}

const PerfilMedico = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<DoctorRating[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [hasUserRated, setHasUserRated] = useState(false);

  useEffect(() => {
    if (id) {
      loadDoctorData();
      loadRatings();
      checkUserRating();
    }
  }, [id, user]);

  const loadDoctorData = async () => {
    try {
      const doctorData = await fetchDoctorById(id!);
      if (doctorData) {
        setDoctor(doctorData);
      } else {
        toast({
          title: "Médico não encontrado",
          description: "O perfil solicitado não foi encontrado.",
          variant: "destructive"
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading doctor:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar perfil do médico.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_ratings')
        .select(`
          id,
          rating,
          comment,
          created_at,
          patients!inner(profiles!inner(full_name))
        `)
        .eq('doctor_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading ratings:', error);
        return;
      }

      const formattedRatings = (data || []).map(rating => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        patient_name: rating.patients?.profiles?.full_name || 'Paciente Anônimo',
        created_at: rating.created_at
      }));

      setRatings(formattedRatings);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const checkUserRating = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const { data, error } = await supabase
        .from('doctor_ratings')
        .select('id')
        .eq('doctor_id', id)
        .eq('patient_id', user.id)
        .single();

      if (data) {
        setHasUserRated(true);
      }
    } catch (error) {
      // User hasn't rated yet
    }
  };

  const submitRating = async () => {
    if (!isAuthenticated || !user || userRating === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma avaliação.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('doctor_ratings')
        .insert({
          doctor_id: id,
          patient_id: user.id,
          rating: userRating,
          comment: userComment
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Avaliação enviada!",
        description: "Obrigado por avaliar este médico.",
        variant: "default"
      });

      setShowRatingForm(false);
      setHasUserRated(true);
      loadRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar avaliação.",
        variant: "destructive"
      });
    }
  };

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${
              interactive ? 'cursor-pointer hover:text-yellow-400' : ''
            }`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hopecann-teal"></div>
        </div>
      </PageContainer>
    );
  }

  if (!doctor) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Médico não encontrado</h1>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header with back button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Doctor Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Doctor Image */}
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 mx-auto md:mx-0">
                  <AvatarImage 
                    src={doctor.profiles?.avatar_url || '/placeholder.svg'} 
                    alt={doctor.profiles?.full_name}
                    className="object-cover object-top"
                  />
                  <AvatarFallback className="text-2xl">
                    {doctor.profiles?.full_name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Doctor Info */}
              <div className="flex-grow">
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {doctor.profiles?.full_name || 'Médico'}
                  </h1>
                  <p className="text-xl text-hopecann-teal mb-4">
                    {doctor.specialty || 'Medicina Canábica'}
                  </p>
                  
                  {/* Rating Display */}
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    {renderStars(Number(calculateAverageRating()))}
                    <span className="text-lg font-medium">
                      {calculateAverageRating()}
                    </span>
                    <span className="text-gray-500">
                      ({ratings.length} avaliações)
                    </span>
                  </div>

                  {/* Doctor Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-hopecann-teal" />
                      <span>CRM: {doctor.crm}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-hopecann-teal" />
                      <Badge variant="secondary">
                        {doctor.is_available ? 'Disponível' : 'Indisponível'}
                      </Badge>
                    </div>
                    {doctor.profiles?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-hopecann-teal" />
                        <span>{doctor.profiles.email}</span>
                      </div>
                    )}
                    {doctor.profiles?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-hopecann-teal" />
                        <span>{doctor.profiles.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => navigate('/agendar')}
                      className="flex-1"
                      disabled={!doctor.is_available}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Consulta
                    </Button>
                    
                    {isAuthenticated && !hasUserRated && (
                      <Button 
                        variant="outline"
                        onClick={() => setShowRatingForm(true)}
                        className="flex-1"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Avaliar Médico
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biography Section */}
        {doctor.biography && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Sobre o Médico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {doctor.biography}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Rating Form */}
        {showRatingForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Avaliar Médico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sua avaliação:
                </label>
                {renderStars(userRating, true, setUserRating)}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentário (opcional):
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={4}
                  placeholder="Compartilhe sua experiência com este médico..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <Button onClick={submitRating}>
                  Enviar Avaliação
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRatingForm(false);
                    setUserRating(0);
                    setUserComment('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews Section */}
        {ratings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Avaliações dos Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ratings.map((rating, index) => (
                  <div key={rating.id}>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {rating.patient_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{rating.patient_name}</span>
                          {renderStars(rating.rating)}
                          <span className="text-sm text-gray-500">
                            {new Date(rating.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {rating.comment && (
                          <p className="text-gray-700">{rating.comment}</p>
                        )}
                      </div>
                    </div>
                    {index < ratings.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No ratings message */}
        {ratings.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Este médico ainda não possui avaliações.
              </p>
              {isAuthenticated && !hasUserRated && (
                <Button 
                  className="mt-4"
                  onClick={() => setShowRatingForm(true)}
                >
                  Seja o primeiro a avaliar
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};

export default PerfilMedico;