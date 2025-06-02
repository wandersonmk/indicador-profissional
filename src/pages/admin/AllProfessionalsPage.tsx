import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Professional } from '@/lib/types';
import { LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function AllProfessionalsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    status: 'all'
  });
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .neq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar emails na tabela profiles
      const ids = data.map((professional) => professional.id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', ids);
      if (profilesError) throw profilesError;

      // Mapear id -> email
      const emailMap = {};
      profilesData.forEach(profile => {
        emailMap[profile.id] = profile.email;
      });

      const formattedProfessionals = data.map(professional => ({
        id: professional.id,
        email: emailMap[professional.id] || '',
        fullName: professional.full_name,
        phoneNumber: professional.phone_number,
        birthDate: professional.birth_date,
        city: professional.city,
        neighborhood: professional.neighborhood,
        croFile: professional.cro_file_url,
        approvalStatus: professional.approval_status,
        specialty1: professional.specialty1,
        specialty2: professional.specialty2,
        landlinePhone: professional.landline_phone,
        mobilePhone: professional.mobile_phone,
        mobilePhone2: professional.mobile_phone2,
        whatsappPhone: professional.whatsapp_phone,
        publicPageActive: professional.public_page_active,
        createdAt: professional.created_at,
        croNumber: professional.cro_number,
        croState: professional.cro_state,
        officeCEP1: professional.office_cep1,
        officeStreet1: professional.office_street1,
        officeNumber1: professional.office_number1,
        officeComplement1: professional.office_complement1,
        officeNeighborhood1: professional.office_neighborhood1,
        officeCity1: professional.office_city1,
        officeState1: professional.office_state1,
        officeCEP2: professional.office_cep2,
        officeStreet2: professional.office_street2,
        officeNumber2: professional.office_number2,
        officeComplement2: professional.office_complement2,
        officeNeighborhood2: professional.office_neighborhood2,
        officeCity2: professional.office_city2,
        officeState2: professional.office_state2,
        acceptsInsurance: professional.accepts_insurance,
        insuranceNames: professional.insurance_names,
        instagram: professional.instagram,
        facebook: professional.facebook,
        website: professional.website,
        linkedin: professional.linkedin,
        telegram: professional.telegram,
        tiktok: professional.tiktok,
        dataSharingConsent: professional.data_sharing_consent,
        rulesAcceptance: professional.rules_acceptance,
        isBlocked: professional.is_blocked
      }));

      setAllProfessionals(formattedProfessionals);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os profissionais. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtro dos profissionais
  const filteredProfessionals = allProfessionals.filter(prof => {
    const searchTerm = filters.search.toLowerCase().trim();
    
    // Filtro de busca (nome, email ou especialidade)
    const searchMatch = searchTerm
      ? prof.fullName?.toLowerCase().includes(searchTerm) ||
        prof.email?.toLowerCase().includes(searchTerm) ||
        prof.specialty1?.toLowerCase().includes(searchTerm) ||
        (prof.specialty2 && prof.specialty2.toLowerCase().includes(searchTerm))
      : true;

    // Filtro de cidade (ignora acentos e caixa) usando officeCity1
    const cityMatch = filters.city
      ? prof.officeCity1 && normalize(prof.officeCity1).includes(normalize(filters.city))
      : true;

    // Filtro de status
    const statusMatch = filters.status === 'all' ||
      (filters.status === 'active' && !prof.isBlocked) ||
      (filters.status === 'inactive' && prof.isBlocked);

    return searchMatch && cityMatch && statusMatch;
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Se já estiver processando, não faz nada
    if (loadingActions[id]) return;

    try {
      setLoadingActions(prev => ({ ...prev, [id]: true }));
      
      const { error } = await supabase
        .from('professional_profiles')
        .update({ is_blocked: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Atualiza o estado imediatamente
      setAllProfessionals(prev =>
        prev.map(prof =>
          prof.id === id
            ? { ...prof, isBlocked: !currentStatus }
            : prof
        )
      );

      toast({
        title: "Status atualizado",
        description: `O profissional foi ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      
      // Reverte o estado em caso de erro
      setAllProfessionals(prev =>
        prev.map(prof =>
          prof.id === id
            ? { ...prof, isBlocked: currentStatus }
            : prof
        )
      );

      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível alterar o status do profissional. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      // Garante que o loading seja removido após um pequeno delay
      setTimeout(() => {
        setLoadingActions(prev => ({ ...prev, [id]: false }));
      }, 500);
    }
  };

  // Função para exportar para Excel
  const exportToExcel = () => {
    const data = filteredProfessionals.map((prof) => ({
      'Nome Completo': prof.fullName,
      'Email': prof.email,
      'Telefone': prof.phoneNumber,
      'Data de Nascimento': prof.birthDate,
      'Cidade': prof.city,
      'Especialidade 1': prof.specialty1,
      'Especialidade 2': prof.specialty2 || '',
      'Endereço Principal': `${prof.officeStreet1}, ${prof.officeNumber1}${prof.officeComplement1 ? ` - ${prof.officeComplement1}` : ''}`,
      'CEP Principal': prof.officeCEP1 || '',
      'Endereço Secundário': prof.officeStreet2 ? `${prof.officeStreet2}, ${prof.officeNumber2}${prof.officeComplement2 ? ` - ${prof.officeComplement2}` : ''}` : '',
      'CEP Secundário': prof.officeCEP2 || '',
      'Telefone Fixo': prof.landlinePhone || '',
      'Celular': prof.mobilePhone || '',
      'Número do CRO': prof.croNumber || '',
      'Estado/UF do CRO': prof.croState || '',
      'Status': !prof.isBlocked ? 'Ativo' : 'Inativo',
      'Aprovação': prof.approvalStatus || '',
      'Data de Criação': new Date(prof.createdAt).toLocaleDateString('pt-BR') || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: "D9E1F2" } },
        font: { bold: true, color: { rgb: "1F4E78" } },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Profissionais');
    XLSX.writeFile(workbook, 'profissionais.xlsx', { bookType: 'xlsx', cellStyles: true });
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold">
              Todos os Profissionais
            </h1>
            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={exportToExcel} className="bg-gradient-to-r from-brand to-blue-500 hover:from-brand/90 hover:to-blue-500/90 text-white font-bold shadow">
                Exportar Excel
              </Button>
              <Button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-brand to-blue-500 text-white border-0 shadow transition-all duration-500 ease-in-out hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg mb-8 border border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input 
                  id="search" 
                  placeholder="Nome, email ou especialidade" 
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="focus:ring-2 focus:ring-brand dark:focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Digite o nome da cidade"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="focus:ring-2 focus:ring-brand dark:focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger id="status" className="focus:ring-2 focus:ring-brand dark:focus:ring-blue-400">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Página Ativa</SelectItem>
                    <SelectItem value="inactive">Página Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
              </div>
            ) : filteredProfessionals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-brand/10 to-blue-100 dark:from-brand/20 dark:to-blue-900/10">
                    <TableHead className="font-bold text-gray-700 dark:text-gray-200">Nome</TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-200">Especialidade</TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-200">Cidade</TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-200">Status</TableHead>
                    <TableHead className="font-bold text-gray-700 dark:text-gray-200">Email</TableHead>
                    <TableHead className="text-right font-bold text-gray-700 dark:text-gray-200">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfessionals.map((professional) => (
                    <TableRow key={professional.id} className="transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      {/* Versão mobile: cards empilhados */}
                      <td colSpan={6} className="block md:hidden p-0 border-0">
                        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-4 flex flex-col gap-2 border border-gray-100 dark:border-gray-800">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">{professional.fullName}</span>
                            <Button asChild variant="ghost" size="sm" className="font-bold text-brand dark:text-blue-400">
                              <Link to={`/admin/professionals/${professional.id}`}>Detalhes</Link>
                            </Button>
                          </div>
                          <div><span className="font-semibold">Especialidade:</span> {professional.specialty1}{professional.specialty2 && <span className="text-xs text-muted-foreground">, {professional.specialty2}</span>}</div>
                          <div><span className="font-semibold">Cidade:</span> {professional.officeCity1}</div>
                          <div><span className="font-semibold">Email:</span> {professional.email}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Status:</span>
                            <Switch
                              checked={!professional.isBlocked}
                              onCheckedChange={() => handleToggleActive(professional.id, professional.isBlocked)}
                              disabled={loadingActions[professional.id]}
                            />
                            <span className={`text-sm font-semibold ${!professional.isBlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}> 
                              {loadingActions[professional.id] ? (
                                <span className="flex items-center gap-1">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Processando...
                                </span>
                              ) : (
                                !professional.isBlocked ? 'Ativo' : 'Inativo'
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      {/* Versão desktop: tabela tradicional */}
                      <TableCell className="font-medium hidden md:table-cell">{professional.fullName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {professional.specialty1}
                        {professional.specialty2 && <span className="text-xs text-muted-foreground">, {professional.specialty2}</span>}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{professional.officeCity1}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!professional.isBlocked}
                            onCheckedChange={() => handleToggleActive(professional.id, professional.isBlocked)}
                            disabled={loadingActions[professional.id]}
                          />
                          <span className={`text-sm font-semibold ${!professional.isBlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}> 
                            {loadingActions[professional.id] ? (
                              <span className="flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Processando...
                              </span>
                            ) : (
                              !professional.isBlocked ? 'Ativo' : 'Inativo'
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{professional.email}</TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        <Button asChild variant="ghost" size="sm" className="font-bold text-brand dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20">
                          <Link to={`/admin/professionals/${professional.id}`}>
                            Detalhes
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum profissional encontrado com os filtros selecionados.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
