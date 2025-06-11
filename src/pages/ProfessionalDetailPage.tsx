import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function ProfessionalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [professional, setProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        // Primeiro verifica se é um profissional
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', id)
          .single();

        // Se não for profissional, não mostra o perfil
        if (profileData?.role !== 'professional') {
          setProfessional(null);
          setLoading(false);
          return;
        }

        // Busca o perfil do profissional
        const { data: professionalData, error: professionalError } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('id', id)
          .eq('approval_status', 'approved')
          .eq('is_blocked', false)
          .single();

        if (professionalData) {
          // Busca o email do profissional
          const { data: emailData, error: emailError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', id)
            .single();

          setProfessional({
            ...professionalData,
            email: emailData?.email
          });
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessional();
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (!professional) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Profissional não encontrado</h2>
          <p className="mb-8">O profissional que você procura não está disponível.</p>
          <Button asChild>
            <Link to="/professionals">Ver todos os profissionais</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleWhatsAppClick = () => {
    const phoneNumber = professional.mobile_phone?.replace(/\D/g, '');
    if (phoneNumber) {
      const message = `Olá ${professional.full_name}, gostaria de mais informações sobre seus serviços.`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/professionals" className="text-brand hover:underline mb-6 block flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Voltar para lista
      </Link>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200 dark:border-gray-700">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {professional.full_name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{professional.full_name}</h1>
              <div className="text-brand dark:text-emerald-400 font-medium text-lg">
                {professional.specialty1}
                {professional.specialty2 && `, ${professional.specialty2}`}
              </div>
            </div>
            {professional.mobile_phone && (
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Informações de contato</h2>
              <Card className="bg-gray-50 dark:bg-gray-800 border-0">
                <CardContent className="pt-6 space-y-4">
                  {professional.mobile_phone && (
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand dark:text-emerald-400">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Celular</p>
                        <p className="text-gray-600 dark:text-gray-300">{professional.mobile_phone}</p>
                      </div>
                    </div>
                  )}
                  {professional.landline_phone && (
                    <div className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand dark:text-emerald-400">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Telefone fixo</p>
                        <p className="text-gray-600 dark:text-gray-300">{professional.landline_phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand dark:text-emerald-400">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email</p>
                      <p className="text-gray-600 dark:text-gray-300">{professional.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Localização</h2>
              <Card className="bg-gray-50 dark:bg-gray-800 border-0">
                <CardContent className="pt-6 space-y-4">
                  {/* Consultório Principal */}
                  {(professional.office_street1 || professional.office_number1 || professional.office_neighborhood1 || professional.office_city1 || professional.office_state1) && (
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand dark:text-emerald-400 mt-1">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Consultório Principal</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          {professional.office_street1 || ''} {professional.office_number1 || ''}<br/>
                          {professional.office_neighborhood1 || ''}{professional.office_neighborhood1 && professional.office_city1 ? ', ' : ''}{professional.office_city1 || ''}{professional.office_state1 ? ' - ' + professional.office_state1 : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Consultório Secundário */}
                  {(professional.office_street2 || professional.office_number2 || professional.office_neighborhood2 || professional.office_city2 || professional.office_state2) && (
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand dark:text-emerald-400 mt-1">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Consultório Secundário</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          {professional.office_street2 || ''} {professional.office_number2 || ''}<br/>
                          {professional.office_neighborhood2 || ''}{professional.office_neighborhood2 && professional.office_city2 ? ', ' : ''}{professional.office_city2 || ''}{professional.office_state2 ? ' - ' + professional.office_state2 : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Cidade (campo isolado) */}
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-brand dark:text-emerald-400">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Cidade</p>
                      <p className="text-gray-600 dark:text-gray-300">{professional.office_city1}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
