import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Professional } from '@/lib/types';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProfessionalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await loadProfessionalDetails();
    };
    loadData();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/professionals');
  };

  const loadProfessionalDetails = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        // Buscar o email do usuário da tabela profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', data.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar email:', profileError);
        }

        const formattedData: Professional = {
          id: data.id,
          email: profileData?.email || '',
          fullName: data.full_name,
          phoneNumber: data.phone_number,
          birthDate: data.birth_date,
          city: data.city,
          neighborhood: data.neighborhood,
          croFile: data.cro_file_url,
          approvalStatus: data.approval_status,
          specialty1: data.specialty1,
          specialty2: data.specialty2,
          landlinePhone: data.landline_phone,
          mobilePhone: data.mobile_phone,
          mobilePhone2: data.mobile_phone2,
          whatsappPhone: data.whatsapp_phone,
          publicPageActive: data.public_page_active,
          createdAt: data.created_at,
          croNumber: data.cro_number,
          croState: data.cro_state,
          officeCEP1: data.office_cep1,
          officeStreet1: data.office_street1,
          officeNumber1: data.office_number1,
          officeComplement1: data.office_complement1,
          officeNeighborhood1: data.office_neighborhood1,
          officeCity1: data.office_city1,
          officeState1: data.office_state1,
          officeCEP2: data.office_cep2,
          officeStreet2: data.office_street2,
          officeNumber2: data.office_number2,
          officeComplement2: data.office_complement2,
          officeNeighborhood2: data.office_neighborhood2,
          officeCity2: data.office_city2,
          officeState2: data.office_state2,
          acceptsInsurance: data.accepts_insurance,
          insuranceNames: data.insurance_names,
          instagram: data.instagram,
          facebook: data.facebook,
          website: data.website,
          linkedin: data.linkedin,
          telegram: data.telegram,
          tiktok: data.tiktok,
          dataSharingConsent: data.data_sharing_consent,
          rulesAcceptance: data.rules_acceptance,
          isBlocked: data.is_blocked
        };

        setProfessional(formattedData);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do profissional:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os detalhes do profissional. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status === 'pending' ? 'Pendente' : 
         status === 'approved' ? 'Aprovado' : 'Rejeitado'}
      </Badge>
    );
  };

  const getBlockedBadge = (isBlocked: boolean) => {
    return (
      <Badge className={isBlocked ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}>
        {isBlocked ? 'Bloqueado' : 'Ativo'}
      </Badge>
    );
  };

  const handleDownloadCRO = async () => {
    if (!professional?.croFile) {
      toast({
        title: "Arquivo não disponível",
        description: "O documento CRO não está disponível para visualização.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Abrir o documento em uma nova guia
      window.open(professional.croFile, '_blank');

      toast({
        title: "Documento aberto",
        description: "O documento CRO foi aberto em uma nova guia.",
      });
    } catch (error) {
      console.error('Erro ao abrir documento CRO:', error);
      toast({
        title: "Erro ao abrir",
        description: "Não foi possível abrir o documento CRO. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        </main>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Profissional não encontrado</h2>
            <Button onClick={() => navigate('/admin/pending')}>
              Voltar para Aprovações
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-emerald-500 bg-clip-text text-transparent">
                Detalhes do Profissional
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Informações completas do cadastro
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-brand dark:text-emerald-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-brand to-emerald-500"></span>
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nome Completo</p>
                  <p className="font-medium">{professional.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium">{professional.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Data de Nascimento</p>
                  <p className="font-medium">{professional.birthDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">CRO</p>
                  <p className="font-medium">{professional.croNumber} - {professional.croState}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"></span>
                  Especialidades
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Especialidade Principal</p>
                  <p className="font-medium">{professional.specialty1}</p>
                </div>
                {professional.specialty2 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Especialidade Secundária</p>
                    <p className="font-medium">{professional.specialty2}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"></span>
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</p>
                  <p className="font-medium">{professional.mobilePhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefone Celular</p>
                  <p className="font-medium">{professional.mobilePhone2}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Telefone Fixo</p>
                  <p className="font-medium">{professional.landlinePhone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"></span>
                  Consultório Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">CEP</p>
                  <p className="font-medium">{professional.officeCEP1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Endereço</p>
                  <p className="font-medium">{professional.officeStreet1}, {professional.officeNumber1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bairro</p>
                  <p className="font-medium">{professional.officeNeighborhood1}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cidade/Estado</p>
                  <p className="font-medium">{professional.officeCity1} - {professional.officeState1}</p>
                </div>
                {professional.officeComplement1 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Complemento</p>
                    <p className="font-medium">{professional.officeComplement1}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {professional.officeStreet2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-400"></span>
                    Consultório Secundário
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CEP</p>
                    <p className="font-medium">{professional.officeCEP2}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Endereço</p>
                    <p className="font-medium">{professional.officeStreet2}, {professional.officeNumber2}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bairro</p>
                    <p className="font-medium">{professional.officeNeighborhood2}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cidade/Estado</p>
                    <p className="font-medium">{professional.officeCity2} - {professional.officeState2}</p>
                  </div>
                  {professional.officeComplement2 && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Complemento</p>
                      <p className="font-medium">{professional.officeComplement2}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-pink-700 dark:text-pink-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-pink-400"></span>
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professional.instagram && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Instagram</p>
                    <p className="font-medium">{professional.instagram}</p>
                  </div>
                )}
                {professional.facebook && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Facebook</p>
                    <p className="font-medium">{professional.facebook}</p>
                  </div>
                )}
                {professional.linkedin && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">LinkedIn</p>
                    <p className="font-medium">{professional.linkedin}</p>
                  </div>
                )}
                {professional.tiktok && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">TikTok</p>
                    <p className="font-medium">{professional.tiktok}</p>
                  </div>
                )}
                {professional.telegram && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Telegram</p>
                    <p className="font-medium">{professional.telegram}</p>
                  </div>
                )}
                {professional.website && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Site</p>
                    <p className="font-medium">{professional.website}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"></span>
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status da Aprovação</p>
                  <div className="mt-1">{getStatusBadge(professional.approvalStatus)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status do Bloqueio</p>
                  <div className="mt-1">{getBlockedBadge(professional.isBlocked)}</div>
                </div>
                {professional.acceptsInsurance && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Convênios Atendidos</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {professional.insuranceNames?.map((insurance, index) => (
                        <Badge key={index} variant="secondary">
                          {insurance}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-400"></span>
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Documento CRO</p>
                  {professional.croFile ? (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadCRO}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Visualizar Documento CRO
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Documento não disponível
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 