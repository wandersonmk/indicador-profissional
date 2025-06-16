import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Professional } from '@/lib/types';

export default function PendingApprovalsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingProfessionals, setPendingProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadPendingProfessionals();
  }, []);

  const loadPendingProfessionals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProfessionals = data.map(professional => ({
        id: professional.id,
        email: professional.email,
        fullName: professional.full_name,
        phoneNumber: professional.phone_number,
        birthDate: professional.birth_date,
        city: professional.city,
        neighborhood: professional.neighborhood,
        croFile: professional.cro_file_url,
        approvalStatus: professional.approval_status,
        specialty1: professional.specialty1,
        specialty2: professional.specialty2,
        createdAt: professional.created_at,
        isBlocked: professional.is_blocked,
        publicPageActive: professional.public_page_active
      }));

      setPendingProfessionals(formattedProfessionals);
    } catch (error) {
      setError('Erro ao carregar profissionais pendentes. Tente novamente.');
      console.error('Erro ao carregar profissionais pendentes:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os profissionais pendentes. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoadingActions(prev => ({ ...prev, [id]: true }));
      
      // Primeiro, buscar os dados do profissional
      const { data: professional, error: fetchError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Buscar o email do profissional na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar email:', profileError);
      }

      // Atualizar o status na tabela pending_approvals
      const { error: updateError } = await supabase
        .from('pending_approvals')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('professional_id', id);

      if (updateError) throw updateError;

      // Enviar webhook
      try {
        await fetch('https://n8n-n8n-start.2nyhks.easypanel.host/webhook/aprovado', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: professional.full_name,
            whatsApp: professional.mobile_phone,
            email: profileData?.email || '',
            aprovado: true
          })
        });
      } catch (webhookError) {
        console.error('Erro ao enviar webhook:', webhookError);
      }

      await loadPendingProfessionals();
      toast({
        title: 'Profissional aprovado',
        description: 'O profissional foi notificado sobre a aprovação.',
      });
    } catch (error) {
      console.error('Erro ao aprovar profissional:', error);
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar o profissional. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      // Garante que o loading seja removido após um pequeno delay
      setTimeout(() => {
        setLoadingActions(prev => ({ ...prev, [id]: false }));
      }, 500);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoadingActions(prev => ({ ...prev, [id]: true }));

      // Buscar os dados do profissional
      const { data: professional, error: fetchError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Buscar o email do profissional na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar email:', profileError);
      }

      // Enviar webhook
      try {
        await fetch('https://n8n-n8n-start.2nyhks.easypanel.host/webhook/aprovado', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: professional.full_name,
            whatsApp: professional.mobile_phone,
            email: profileData?.email || '',
            aprovado: false
          })
        });
      } catch (webhookError) {
        console.error('Erro ao enviar webhook:', webhookError);
      }

      await loadPendingProfessionals();
      toast({
        title: 'Profissional rejeitado',
        description: 'O profissional foi notificado sobre a rejeição.',
      });
    } catch (error) {
      console.error('Erro ao rejeitar profissional:', error);
      toast({
        title: "Erro ao rejeitar",
        description: "Não foi possível rejeitar o profissional. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      // Garante que o loading seja removido após um pequeno delay
      setTimeout(() => {
        setLoadingActions(prev => ({ ...prev, [id]: false }));
      }, 500);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-emerald-500 bg-clip-text text-transparent">Aprovações Pendentes</h1>
          <Button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-brand to-blue-500 text-white border-0 shadow transition-all duration-300 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <span className="ml-2 text-gray-500">Carregando...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4 text-center">
            {error}
          </div>
        )}
        {!isLoading && !error && pendingProfessionals.length > 0 ? (
          <div className="bg-white rounded-md shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Data do Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProfessionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">{professional.fullName}</TableCell>
                    <TableCell>{professional.email}</TableCell>
                    <TableCell>
                      <div>
                        <div>{professional.specialty1}</div>
                        {professional.specialty2 && (
                          <div className="text-sm text-muted-foreground">{professional.specialty2}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{professional.city}</TableCell>
                    <TableCell>{new Date(professional.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApprove(professional.id)}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white border-0 shadow"
                          disabled={loadingActions[professional.id]}
                        >
                          {loadingActions[professional.id] ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processando...
                            </>
                          ) : (
                            'Aprovar'
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleReject(professional.id)}
                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow"
                          disabled={loadingActions[professional.id]}
                        >
                          {loadingActions[professional.id] ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processando...
                            </>
                          ) : (
                            'Rejeitar'
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          asChild
                          className="bg-gradient-to-r from-brand to-blue-500 hover:from-brand/90 hover:to-blue-500/90 text-white border-0 shadow"
                          disabled={loadingActions[professional.id]}
                        >
                          <Link to={`/admin/pending/${professional.id}`}>
                            Detalhes
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-white p-8 text-center rounded-md shadow">
            <h2 className="text-xl font-semibold mb-2">Nenhuma aprovação pendente</h2>
            <p className="text-gray-500 mb-6">
              Não há profissionais aguardando aprovação no momento.
            </p>
            <Button asChild
              className="bg-gradient-to-r from-brand to-blue-500 hover:from-brand/90 hover:to-blue-500/90 text-white border-0 shadow"
            >
              <Link to="/admin">Voltar ao Dashboard</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
