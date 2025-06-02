import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [pendingProfessionals, setPendingProfessionals] = useState([]);
  const [activeProfessionals, setActiveProfessionals] = useState([]);

  const loadDashboardData = async () => {
    try {
      const { data: pendingData, error: pendingError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      const { data: activeData, error: activeError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      setPendingProfessionals(pendingData);
      setActiveProfessionals(activeData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
          <Button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gradient-to-r from-brand to-blue-500 text-white border-0 shadow transition-all duration-700 ease-in-out hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-800/10`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 dark:from-amber-400 dark:to-amber-300"></div>
                Cadastros Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingProfessionals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>
          <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-brand/10 to-emerald-100 dark:from-brand/20 dark:to-emerald-900/10`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-brand to-emerald-500 dark:from-emerald-400 dark:to-emerald-300"></div>
                Profissionais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProfessionals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Com páginas públicas
              </p>
            </CardContent>
          </Card>
          <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/10`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 dark:from-blue-400 dark:to-blue-300"></div>
                Total de Cadastros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingProfessionals.length + activeProfessionals.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Na plataforma
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingProfessionals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Aprovações Pendentes</span>
                  <Button asChild size="sm" className="bg-gradient-to-r from-brand to-blue-500 hover:from-brand/90 hover:to-blue-500/90 text-white border-0 shadow">
                    <Link to="/admin/pending">Ver todos</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {pendingProfessionals.slice(0, 5).map((professional) => (
                    <li key={professional.id} className="border-b pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{professional.full_name}</p>
                          <p className="text-sm text-muted-foreground">{professional.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {professional.city}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(professional.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Button asChild size="sm" className="bg-gradient-to-r from-brand to-blue-500 hover:from-brand/90 hover:to-blue-500/90 text-white border-0 shadow">
                          <Link to="/admin/pending">Revisar</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profissionais Ativos</span>
                <Button asChild size="sm" className="bg-gradient-to-r from-brand to-blue-500 hover:from-brand/90 hover:to-blue-500/90 text-white border-0 shadow">
                  <Link to="/admin/professionals">Ver todos</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeProfessionals.length > 0 ? (
                <ul className="space-y-4">
                  {activeProfessionals.slice(0, 2).map((professional) => (
                    <li key={professional.id} className="border-b pb-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{professional.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {professional.specialty1}
                            {professional.specialty2 && `, ${professional.specialty2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">{professional.city}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Nenhum profissional ativo no momento.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
