import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Professional } from '@/lib/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfessionalData = async () => {
      try {
        setIsLoading(true);
        
        if (user?.id) {
          const { data: professionalData, error } = await supabase
            .from('professional_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            throw error;
          }

          if (professionalData) {
            console.log('Dados do Supabase:', professionalData);
            console.log('Valor de is_blocked do banco:', professionalData.is_blocked);
            console.log('Tipo de is_blocked:', typeof professionalData.is_blocked);
            
            const formattedData: Professional = {
              id: professionalData.id,
              email: user.email || '',
              fullName: professionalData.full_name,
              phoneNumber: professionalData.phone_number,
              birthDate: professionalData.birth_date,
              city: professionalData.city,
              neighborhood: professionalData.neighborhood,
              croFile: professionalData.cro_file_url,
              approvalStatus: professionalData.approval_status,
              specialty1: professionalData.specialty1,
              specialty2: professionalData.specialty2,
              landlinePhone: professionalData.landline_phone,
              mobilePhone: professionalData.mobile_phone,
              mobilePhone2: professionalData.mobile_phone2,
              whatsappPhone: professionalData.whatsapp_phone,
              publicPageActive: professionalData.public_page_active,
              createdAt: professionalData.created_at,
              croNumber: professionalData.cro_number,
              croState: professionalData.cro_state,
              officeCEP1: professionalData.office_cep1,
              officeStreet1: professionalData.office_street1,
              officeNumber1: professionalData.office_number1,
              officeComplement1: professionalData.office_complement1,
              officeNeighborhood1: professionalData.office_neighborhood1,
              officeCity1: professionalData.office_city1,
              officeState1: professionalData.office_state1,
              officeCEP2: professionalData.office_cep2,
              officeStreet2: professionalData.office_street2,
              officeNumber2: professionalData.office_number2,
              officeComplement2: professionalData.office_complement2,
              officeNeighborhood2: professionalData.office_neighborhood2,
              officeCity2: professionalData.office_city2,
              officeState2: professionalData.office_state2,
              acceptsInsurance: professionalData.accepts_insurance,
              insuranceNames: professionalData.insurance_names,
              instagram: professionalData.instagram,
              facebook: professionalData.facebook,
              website: professionalData.website,
              linkedin: professionalData.linkedin,
              telegram: professionalData.telegram,
              tiktok: professionalData.tiktok,
              dataSharingConsent: professionalData.data_sharing_consent,
              rulesAcceptance: professionalData.rules_acceptance,
              pendingChanges: professionalData.pending_changes,
              isBlocked: Boolean(professionalData.is_blocked)
            };

            console.log('Status da página após formatação:', formattedData.isBlocked ? 'Inativa' : 'Ativa');
            setProfessional(formattedData);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do profissional:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfessionalData();
  }, [user, toast]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Carregando seus dados...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-emerald-500 bg-clip-text text-transparent">Dashboard</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Área do profissional
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  className="font-bold transition-all duration-300"
                  style={{
                    background: 'var(--brand-primary)',
                    color: '#fff',
                    border: 'none',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgb(98,131,152)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-primary)')}
                >
                  <Link to="/profile">Editar Perfil</Link>
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="font-bold transition-all duration-300"
                  style={{
                    background: 'var(--brand-accent)',
                    color: '#fff',
                    border: 'none',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgb(98,131,152)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-accent)')}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
            <p>Não foi possível carregar os dados do profissional.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-emerald-500 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Área do profissional
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                className="font-bold transition-all duration-300"
                style={{
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  border: 'none',
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgb(98,131,152)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-primary)')}
              >
                <Link to="/profile" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </Link>
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="font-bold transition-all duration-300"
                style={{
                  background: 'var(--brand-accent)',
                  color: '#fff',
                  border: 'none',
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgb(98,131,152)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-accent)')}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-brand/10 to-emerald-100 dark:from-brand/20 dark:to-emerald-900/10`}> 
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-brand to-emerald-500 dark:from-emerald-400 dark:to-emerald-300"></div>
                  Especialidade Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-lg font-medium text-gray-900 dark:text-white">{professional.specialty1}</div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10`}>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300"></div>
                  Especialidade Secundária
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {professional.specialty2 || 'Nenhuma'}
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              professional.isBlocked === false
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20'
            }`}>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    professional.isBlocked === false
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-400 dark:from-gray-400 dark:to-gray-300'
                  }`}></div>
                  Status da Página
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    professional.isBlocked === false
                      ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' 
                      : 'bg-gray-400 dark:bg-gray-500'
                  }`}></div>
                  <div className={`text-2xl font-bold ${
                    professional.isBlocked === false
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {professional.isBlocked === false ? 'Ativa' : 'Inativa'}
                  </div>
                </div>
                <p className={`text-sm mt-2 ${
                  professional.isBlocked === false
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {professional.isBlocked === false
                    ? 'Seu perfil está visível e pode ser encontrado pelos pacientes'
                    : 'Seu perfil está oculto e não pode ser encontrado pelos pacientes'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10`}>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-400 dark:from-purple-400 dark:to-purple-300"></div>
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Nome Completo</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CRO</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.croNumber} - {professional.croState}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.birthDate ? new Date(professional.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10`}>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 dark:from-amber-400 dark:to-amber-300"></div>
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.mobilePhone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone Celular</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.mobilePhone2 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone Fixo</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.landlinePhone || 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10`}>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300"></div>
                  Consultório Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">CEP</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.officeCEP1 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {professional.officeStreet1 ? `${professional.officeStreet1}, ${professional.officeNumber1}` : 'Não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bairro</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.officeNeighborhood1 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cidade/Estado</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {professional.officeCity1 && professional.officeState1 
                      ? `${professional.officeCity1} - ${professional.officeState1}`
                      : 'Não informado'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {professional.officeStreet2 && (
              <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-800/10`}>
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400 dark:from-green-400 dark:to-green-300"></div>
                    Consultório Secundário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <p className="text-sm text-muted-foreground">CEP</p>
                    <p className="font-medium text-gray-900 dark:text-white">{professional.officeCEP2 || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {professional.officeStreet2 ? `${professional.officeStreet2}, ${professional.officeNumber2}` : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bairro</p>
                    <p className="font-medium text-gray-900 dark:text-white">{professional.officeNeighborhood2 || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cidade/Estado</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {professional.officeCity2 && professional.officeState2 
                        ? `${professional.officeCity2} - ${professional.officeState2}`
                        : 'Não informado'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/20 dark:to-pink-800/10`}>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-400 dark:from-pink-400 dark:to-pink-300"></div>
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Instagram</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.instagram || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Facebook</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.facebook || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">LinkedIn</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.linkedin || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">TikTok</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.tiktok || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telegram</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.telegram || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Site</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.website || 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-800/10`}>
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300"></div>
                  Informações Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Atende Convênio</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.acceptsInsurance ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Autorização de Divulgação</p>
                  <p className="font-medium text-gray-900 dark:text-white">{professional.dataSharingConsent ? 'Autorizado' : 'Não autorizado'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
