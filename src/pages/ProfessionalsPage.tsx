import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Building2, MapPin, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Professional } from '@/lib/types';

// Função para normalizar strings (remover acentos e caixa)
function normalize(str: string) {
  return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export default function ProfessionalsPage() {
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>([]);
  const [filters, setFilters] = useState({
    name: '',
    specialty: 'all',
    city: '',
    neighborhood: ''
  });

  useEffect(() => {
    const fetchProfessionals = async () => {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('approval_status', 'approved')
        .eq('is_blocked', false);
      if (error) {
        console.error('Erro ao buscar profissionais:', error);
        setAllProfessionals([]);
        return;
      }
      setAllProfessionals((data || []).map(prof => ({
        id: prof.id,
        email: prof.email || '',
        fullName: prof.full_name || '',
        phoneNumber: prof.phone_number || '',
        birthDate: prof.birth_date || '',
        city: prof.city || '',
        neighborhood: prof.neighborhood || '',
        croFile: prof.cro_file_url || '',
        approvalStatus: prof.approval_status || 'approved',
        specialty1: prof.specialty1 || '',
        specialty2: prof.specialty2 || '',
        mainOffice: prof.office_street1 || '',
        secondaryOffice: prof.office_street2 || '',
        landlinePhone: prof.landline_phone || '',
        mobilePhone: prof.mobile_phone || '',
        mobilePhone2: prof.mobile_phone2 || '',
        whatsappPhone: prof.whatsapp_phone || '',
        publicPageActive: prof.public_page_active ?? true,
        isBlocked: prof.is_blocked ?? false,
        createdAt: prof.created_at || '',
        croNumber: prof.cro_number || '',
        croState: prof.cro_state || '',
        officeCEP1: prof.office_cep1 || '',
        officeCEP2: prof.office_cep2 || '',
        officeStreet1: prof.office_street1 || '',
        officeNumber1: prof.office_number1 || '',
        officeComplement1: prof.office_complement1 || '',
        officeNeighborhood1: prof.office_neighborhood1 || '',
        officeCity1: prof.office_city1 || '',
        officeState1: prof.office_state1 || '',
        officeStreet2: prof.office_street2 || '',
        officeNumber2: prof.office_number2 || '',
        officeComplement2: prof.office_complement2 || '',
        officeNeighborhood2: prof.office_neighborhood2 || '',
        officeCity2: prof.office_city2 || '',
        officeState2: prof.office_state2 || '',
        acceptsInsurance: prof.accepts_insurance ?? false,
        insuranceNames: prof.insurance_names || [],
        instagram: prof.instagram || '',
        facebook: prof.facebook || '',
        website: prof.website || '',
        linkedin: prof.linkedin || '',
        telegram: prof.telegram || '',
        tiktok: prof.tiktok || '',
        dataSharingConsent: prof.data_sharing_consent ?? false,
        rulesAcceptance: prof.rules_acceptance ?? false,
        pendingChanges: [],
      })));
    };
    fetchProfessionals();
  }, []);

  // Extrair valores únicos para os filtros
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set<string>();
    allProfessionals.forEach(prof => {
      if (prof.specialty1) uniqueSpecialties.add(prof.specialty1);
      if (prof.specialty2) uniqueSpecialties.add(prof.specialty2);
    });
    return Array.from(uniqueSpecialties);
  }, [allProfessionals]);

  const cities = useMemo(() => {
    return Array.from(new Set(allProfessionals.map(prof => prof.city)));
  }, [allProfessionals]);

  const neighborhoods = useMemo(() => {
    return Array.from(new Set(allProfessionals.map(prof => prof.neighborhood)));
  }, [allProfessionals]);

  const filteredProfessionals = useMemo(() => {
    return allProfessionals.filter(professional => {
      const matchesName = professional.fullName.toLowerCase().includes(filters.name.toLowerCase());
      const matchesSpecialty = filters.specialty === 'all' || 
        professional.specialty1 === filters.specialty || 
        professional.specialty2 === filters.specialty;
      const matchesCity = !filters.city || normalize(professional.officeCity1).includes(normalize(filters.city));
      const matchesNeighborhood = !filters.neighborhood || normalize(professional.officeNeighborhood1).includes(normalize(filters.neighborhood));
      return matchesName && matchesSpecialty && matchesCity && matchesNeighborhood;
    });
  }, [allProfessionals, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ name: '', specialty: 'all', city: '', neighborhood: '' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-brand dark:text-emerald-400 drop-shadow-lg">Nossos Profissionais</h1>
      
      {/* Filters */}
      <Card className="mb-10 shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-brand dark:text-emerald-400">Filtrar profissionais</CardTitle>
          <CardDescription className="dark:text-gray-300">Encontre o profissional ideal para você</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input 
                  id="name" 
                  placeholder="Buscar por nome..." 
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  className="pl-10 focus:ring-2 focus:ring-brand dark:focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Select value={filters.specialty} onValueChange={(value) => handleFilterChange('specialty', value)}>
                <SelectTrigger id="specialty">
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {specialties
                    .filter(specialty => specialty && specialty.trim() !== '')
                    .map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                placeholder="Digite o nome da cidade..."
                value={filters.city}
                onChange={e => handleFilterChange('city', e.target.value)}
                className="focus:ring-2 focus:ring-brand dark:focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                placeholder="Digite o nome do bairro..."
                value={filters.neighborhood}
                onChange={e => handleFilterChange('neighborhood', e.target.value)}
                className="focus:ring-2 focus:ring-brand dark:focus:ring-emerald-400"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="secondary" 
            className="font-bold bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700 hover:scale-105 hover:shadow-lg transition-all duration-300"
            onClick={resetFilters}
          >
            Limpar filtros
          </Button>
        </CardFooter>
      </Card>
      
      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProfessionals.length > 0 ? (
          filteredProfessionals.map((professional) => (
            <ProfessionalCard key={professional.id} professional={professional} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium mb-2 text-brand dark:text-emerald-400">Nenhum profissional encontrado</h3>
            <p className="text-gray-500 dark:text-gray-300">Tente ajustar seus filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <Card className="dentist-card bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col justify-between h-80 max-h-80 min-h-80 w-full">
      <CardHeader className="flex flex-col items-center pb-2">
        <div className="h-16 w-16 rounded-full bg-[rgb(128,161,182)] flex items-center justify-center text-white text-2xl font-bold mb-2 shadow">
          {professional.fullName.split(' ').map(n => n[0]).join('').slice(0,2)}
        </div>
        <CardTitle className="text-lg text-center text-gray-900 dark:text-white leading-tight mb-1">{professional.fullName}</CardTitle>
        <CardDescription className="text-[rgb(128,161,182)] dark:text-emerald-400 font-medium text-center text-sm mb-1">
          {professional.specialty1}
          {professional.specialty2 && `, ${professional.specialty2}`}
        </CardDescription>
        {professional.croNumber && (
          <p className="text-xs text-gray-500">CRO: {professional.croNumber}/{professional.croState}</p>
        )}
        {(professional.officeCity1 || professional.officeNeighborhood1) && (
          <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mt-1">
            {professional.officeCity1}
            {professional.officeCity1 && professional.officeNeighborhood1 ? ', ' : ''}
            {professional.officeNeighborhood1}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-1 items-center px-2 text-sm text-gray-700 dark:text-gray-200">
        {(professional.mobilePhone || professional.landlinePhone) && (
          <div className="flex items-center gap-1 mt-1">
            <span className="font-medium">Tel:</span>
            <span>{professional.mobilePhone || professional.landlinePhone}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center mt-auto pt-2">
        <Link to={`/professionals/${professional.id}`} className="w-full">
          <Button
            className="font-bold w-full transition-all duration-300"
            style={{
              background: 'rgb(128,161,182)',
              color: '#fff',
              border: 'none',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgb(108,141,162)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgb(128,161,182)')}
          >
            Ver perfil completo
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
