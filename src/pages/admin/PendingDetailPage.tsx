import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProfessionalById, updateApprovalStatus } from '@/lib/data-service';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

export default function PendingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const professional = getProfessionalById(id || '');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = () => {
    setIsSubmitting(true);
    try {
      updateApprovalStatus(id || '', 'approved');
      toast({
        title: 'Profissional aprovado',
        description: 'O profissional foi notificado sobre a aprovação.',
      });
      navigate('/admin/pending');
    } catch (error) {
      console.error('Error approving professional:', error);
      toast({
        title: 'Erro ao aprovar',
        description: 'Ocorreu um erro ao aprovar o profissional.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    setIsSubmitting(true);
    try {
      updateApprovalStatus(id || '', 'rejected');
      toast({
        title: 'Profissional rejeitado',
        description: 'O profissional foi notificado sobre a rejeição.',
      });
      navigate('/admin/pending');
    } catch (error) {
      console.error('Error rejecting professional:', error);
      toast({
        title: 'Erro ao rejeitar',
        description: 'Ocorreu um erro ao rejeitar o profissional.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadCRO = () => {
    if (!professional?.croFile) return;

    try {
      // Cria um link temporário para download
      const link = document.createElement('a');
      link.href = professional.croFile;
      link.download = `CRO_${professional.croNumber}_${professional.fullName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download iniciado",
        description: "O documento CRO está sendo baixado",
      });
    } catch (error) {
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível baixar o documento CRO",
        variant: "destructive",
      });
    }
  };

  if (!professional) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Profissional não encontrado</h2>
            <Button asChild>
              <Link to="/admin/pending">Voltar</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Revisão de Cadastro</h1>
          <Link to="/admin/pending" className="text-brand hover:underline">
            &larr; Voltar para lista
          </Link>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informações do Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                  <p className="text-lg">{professional.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{professional.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone Celular</p>
                  <p>{professional.mobilePhone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone Fixo</p>
                  <p>{professional.landlinePhone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                  <p>{professional.whatsappPhone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                  <p>{new Date(professional.birthDate).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CRO</p>
                  <p>{professional.croNumber || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado do CRO</p>
                  <p>{professional.croState || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Especialidade Principal</p>
                  <p>{professional.specialty1 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Especialidade Secundária</p>
                  <p>{professional.specialty2 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data do Cadastro</p>
                  <p>{new Date(professional.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status de Aprovação</p>
                  <p>
                    <span className="status-badge-pending">Pendente</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Endereços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Consultório Principal</h3>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CEP</p>
                  <p>{professional.officeCEP1 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                  <p>{professional.officeStreet1 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Número</p>
                  <p>{professional.officeNumber1 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Complemento</p>
                  <p>{professional.officeComplement1 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                  <p>{professional.officeNeighborhood1 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                  <p>{professional.officeCity1 || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <p>{professional.officeState1 || 'Não informado'}</p>
                </div>
              </div>

              {(professional.officeCEP2 || professional.officeStreet2 || professional.officeNumber2 || 
                professional.officeComplement2 || professional.officeNeighborhood2 || 
                professional.officeCity2 || professional.officeState2) && (
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Consultório Secundário</h3>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CEP</p>
                    <p>{professional.officeCEP2 || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                    <p>{professional.officeStreet2 || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Número</p>
                    <p>{professional.officeNumber2 || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Complemento</p>
                    <p>{professional.officeComplement2 || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                    <p>{professional.officeNeighborhood2 || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cidade</p>
                    <p>{professional.officeCity2 || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <p>{professional.officeState2 || 'Não informado'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Redes Sociais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Instagram</p>
                  <p>{professional.instagram || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Facebook</p>
                  <p>{professional.facebook || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                  <p>{professional.linkedin || 'Não informado'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">TikTok</p>
                  <p>{professional.tiktok || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telegram</p>
                  <p>{professional.telegram || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Site</p>
                  <p>{professional.website || 'Não informado'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atende Convênio</p>
                <p>{professional.acceptsInsurance ? 'Sim' : 'Não'}</p>
              </div>
              {professional.acceptsInsurance && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Convênios Aceitos</p>
                  <p>{professional.insuranceNames?.join(', ') || 'Não informado'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Documento CRO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 border rounded-md p-8 text-center">
              {professional.croFile ? (
                <>
                  <div className="mb-4">
                    <img 
                      src={professional.croFile} 
                      alt="CRO Document" 
                      className="max-w-full h-48 object-contain mx-auto border rounded"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-2 mx-auto"
                    onClick={handleDownloadCRO}
                  >
                    <Download className="h-4 w-4" />
                    Download do Documento
                  </Button>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Documento CRO não disponível</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ação de Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p>
                Revise cuidadosamente as informações e o documento CRO enviado pelo profissional antes de tomar uma decisão.
              </p>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={handleApprove} 
                  disabled={isSubmitting} 
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? 'Processando...' : 'Aprovar Profissional'}
                </Button>
                <Button 
                  onClick={handleReject} 
                  variant="outline" 
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? 'Processando...' : 'Rejeitar Cadastro'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
