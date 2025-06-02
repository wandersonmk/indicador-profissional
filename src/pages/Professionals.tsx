import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/axios';

interface Professional {
  id: string;
  name: string;
  specialties: string[];
  city: string;
  neighborhood: string;
  cro: string;
  office: {
    name: string;
    address: string;
  };
}

export function Professionals() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await api.get('/professionals');
        const data = response.data;
        setProfessionals(data);
        setFilteredProfessionals(data);

        // Extract unique values for filters
        const uniqueSpecialties = Array.from(new Set(data.flatMap(p => p.specialties))) as string[];
        const uniqueCities = Array.from(new Set(data.map(p => p.city))) as string[];
        const uniqueNeighborhoods = Array.from(new Set(data.map(p => p.neighborhood))) as string[];

        setSpecialties(uniqueSpecialties);
        setCities(uniqueCities);
        setNeighborhoods(uniqueNeighborhoods);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      }
    };

    fetchProfessionals();
  }, []);

  useEffect(() => {
    const filtered = professionals.filter(professional => {
      const matchesName = professional.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = !selectedSpecialty || professional.specialties.includes(selectedSpecialty);
      const matchesCity = !selectedCity || professional.city === selectedCity;
      const matchesNeighborhood = !selectedNeighborhood || professional.neighborhood === selectedNeighborhood;

      return matchesName && matchesSpecialty && matchesCity && matchesNeighborhood;
    });

    setFilteredProfessionals(filtered);
  }, [searchTerm, selectedSpecialty, selectedCity, selectedNeighborhood, professionals]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Profissionais</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                id="name"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade</Label>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger id="specialty">
                <SelectValue placeholder="Selecione uma especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Selecione uma cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
              <SelectTrigger id="neighborhood">
                <SelectValue placeholder="Selecione um bairro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('');
              setSelectedCity('');
              setSelectedNeighborhood('');
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.map((professional) => (
          <Card key={professional.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{professional.name}</h2>
                  <p className="text-sm text-gray-500">CRO: {professional.cro}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap size={18} />
                  <span className="text-sm">{professional.specialties.join(', ')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Building2 size={18} />
                  <span className="text-sm">{professional.office.name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} />
                  <span className="text-sm">{professional.office.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link 
                  to={`/professionals/${professional.id}`}
                  className="text-[rgb(128,161,182)] hover:text-[rgb(108,141,162)] font-medium"
                >
                  Ver perfil completo
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfessionals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum profissional encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
} 