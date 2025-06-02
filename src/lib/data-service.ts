import { Professional, User, ApprovalStatus, FieldConfig, cities } from "./types";
import { supabase } from './supabase';

// Mock database
let professionals: Professional[] = [
  {
    id: '1',
    email: 'dr.silva@example.com',
    fullName: 'Dr. João Silva',
    phoneNumber: '(11) 98765-4321',
    birthDate: '1980-05-15',
    city: 'São Paulo',
    neighborhood: 'Bela Vista',
    croFile: '/placeholder.svg',
    approvalStatus: 'approved',
    specialty1: 'Ortodontia',
    specialty2: 'Odontopediatria',
    mainOffice: 'Av. Paulista, 1000, São Paulo',
    secondaryOffice: 'Rua Augusta, 500, São Paulo',
    landlinePhone: '(11) 3333-4444',
    mobilePhone: '(11) 98888-9999',
    publicPageActive: true,
    createdAt: '2023-01-15',
    croNumber: '12345',
    croState: 'SP',
    officeCEP1: '01310-100',
    officeCEP2: '01304-000'
  },
  {
    id: '2',
    email: 'dra.santos@example.com',
    fullName: 'Dra. Maria Santos',
    phoneNumber: '(11) 97654-3210',
    birthDate: '1985-10-20',
    city: 'Campinas',
    neighborhood: 'Centro',
    croFile: '/placeholder.svg',
    approvalStatus: 'approved',
    specialty1: 'Endodontia',
    mainOffice: 'Rua 13 de Maio, 200, Campinas',
    landlinePhone: '(19) 3333-2222',
    mobilePhone: '(19) 98765-1234',
    publicPageActive: true,
    createdAt: '2023-02-10',
    croNumber: '54321',
    croState: 'SP',
    officeCEP1: '13015-300'
  },
  {
    id: '3',
    email: 'dr.oliveira@example.com',
    fullName: 'Dr. Carlos Oliveira',
    phoneNumber: '(11) 95555-1234',
    birthDate: '1975-08-25',
    city: 'São Paulo',
    neighborhood: 'Vila Mariana',
    croFile: '/placeholder.svg',
    approvalStatus: 'pending',
    specialty1: 'Ortodontia',
    createdAt: '2023-05-20',
    publicPageActive: false
  }
];

let users: User[] = [
  {
    id: '1',
    email: 'dr.silva@example.com',
    role: 'professional'
  },
  {
    id: '2',
    email: 'dra.santos@example.com',
    role: 'professional'
  },
  {
    id: '3',
    email: 'dr.oliveira@example.com',
    role: 'professional'
  },
  {
    id: 'admin',
    email: 'admin@example.com',
    role: 'admin'
  }
];

// Default field configurations
let fieldConfigs: FieldConfig[] = [
  // Dados Pessoais
  { id: 'fullName', name: 'fullName', label: 'Nome Completo', category: 'personal', required: true, active: true, order: 1 },
  { id: 'email', name: 'email', label: 'Email', category: 'personal', required: true, active: true, order: 2 },
  { id: 'phoneNumber', name: 'phoneNumber', label: 'Telefone', category: 'personal', required: true, active: true, order: 3 },
  { id: 'birthDate', name: 'birthDate', label: 'Data de Nascimento', category: 'personal', required: true, active: true, order: 4 },
  { id: 'city', name: 'city', label: 'Cidade', category: 'personal', required: true, active: true, order: 5 },
  { id: 'croNumber', name: 'croNumber', label: 'Número do CRO', category: 'personal', required: true, active: true, order: 6 },
  { id: 'croState', name: 'croState', label: 'Estado/UF do CRO', category: 'personal', required: true, active: true, order: 7 },
  { id: 'croFile', name: 'croFile', label: 'Documento CRO', category: 'personal', required: true, active: true, order: 8 },
  { id: 'landlinePhone', name: 'landlinePhone', label: 'Telefone Fixo', category: 'personal', required: false, active: true, order: 9 },
  { id: 'mobilePhone', name: 'mobilePhone', label: 'Celular', category: 'personal', required: false, active: true, order: 10 },
  
  // Endereços
  { id: 'mainOffice', name: 'mainOffice', label: 'Endereço do Consultório Principal', category: 'address', required: true, active: true, order: 1 },
  { id: 'officeCEP1', name: 'officeCEP1', label: 'CEP do Consultório Principal', category: 'address', required: true, active: true, order: 2 },
  { id: 'secondaryOffice', name: 'secondaryOffice', label: 'Endereço do Consultório Secundário', category: 'address', required: false, active: true, order: 3 },
  { id: 'officeCEP2', name: 'officeCEP2', label: 'CEP do Consultório Secundário', category: 'address', required: false, active: true, order: 4 },
  
  // Especialidades
  { id: 'specialty1', name: 'specialty1', label: 'Especialidade 1', category: 'specialty', required: true, active: true, order: 1 },
  { id: 'specialty2', name: 'specialty2', label: 'Especialidade 2', category: 'specialty', required: false, active: true, order: 2 },
];

// Usando array para armazenar as especialidades cadastradas
// A lista inicial incluirá as especialidades padrão
export let specialties = [
  "Sem Especialidade",
  "Acupuntura",
  "Cirurgia e Traumatologia Bucomaxilofacial",
  "Dentística",
  "Disfunção Temporomandibular e Dor Orofacial",
  "Endodontia",
  "Estomatologia",
  "Harmonização Orofacial",
  "Homeopatia",
  "Implantodontia",
  "Odontogeriatria",
  "Odontologia do Esporte",
  "Odontologia do Trabalho",
  "Odontologia Hospitalar",
  "Odontologia Legal",
  "Odontologia para Pacientes com Necessidades Especiais",
  "Odontopediatria",
  "Ortodontia",
  "Ortopedia Funcional dos Maxilares",
  "Patologia Oral e Maxilofacial",
  "Periodontia",
  "Prótese Bucomaxilofacial",
  "Prótese Dentária",
  "Radiologia Odontológica e Imaginologia",
  "Saúde Coletiva"
];

// Get all professionals for public view (only approved and active)
export const getPublicProfessionals = () => {
  return professionals.filter(p => 
    p.approvalStatus === 'approved' && 
    p.publicPageActive === true
  );
};

// Get all pending professionals (for admin)
export const getPendingProfessionals = () => {
  return professionals.filter(p => p.approvalStatus === 'pending');
};

// Get professional by ID
export const getProfessionalById = (id: string) => {
  return professionals.find(p => p.id === id) || null;
};

// Get professional by email
export const getProfessionalByEmail = (email: string) => {
  return professionals.find(p => p.email === email) || null;
};

// Create new professional
const createProfessional = (data: Omit<Professional, "id">): Professional => {
  const newProfessional: Professional = {
    id: crypto.randomUUID(),
    ...data,
    approvalStatus: 'pending',
    publicPageActive: false,
    createdAt: new Date().toISOString()
  };
  professionals.push(newProfessional);
  
  // Also create a user
  users.push({
    id: newProfessional.id,
    email: data.email,
    role: 'professional'
  });
  
  return newProfessional;
};

// Update professional
export const updateProfessional = (id: string, data: Partial<Professional>) => {
  const index = professionals.findIndex(p => p.id === id);
  if (index !== -1) {
    professionals[index] = { ...professionals[index], ...data };
    return professionals[index];
  }
  return null;
};

// Update approval status
export const updateApprovalStatus = (id: string, status: ApprovalStatus) => {
  return updateProfessional(id, { approvalStatus: status });
};

// Authenticate user
export const authenticateUser = (email: string, password: string): User | null => {
  // In a real app, this would verify password hashes
  // For demo, we'll just check if the user exists and return it
  const user = users.find(u => u.email === email);
  
  // Find associated professional data if it's a professional user
  if (user && user.role === 'professional') {
    const professional = professionals.find(p => p.email === email);
    if (professional) {
      user.professional = professional;
    }
  }
  
  return user || null;
};

// Handle professional sign-up
export const professionalSignUp = async (formData: FormData) => {
  // Check if user already exists
  const email = formData.get('email') as string;
  if (users.some(u => u.email === email)) {
    return { success: false, message: 'Email já cadastrado' };
  }
  
  // Create new professional
  const newProfessional = createProfessional({
    email: email,
    fullName: formData.get('fullName') as string,
    city: formData.get('city') as string,
    neighborhood: formData.get('neighborhood') as string,
    croNumber: formData.get('croNumber') as string,
    croState: formData.get('croState') as string,
    specialty1: formData.get('specialty1') as string,
    landlinePhone: formData.get('landlinePhone') as string,
    mobilePhone: formData.get('mobilePhone') as string,
    whatsappPhone: formData.get('whatsappPhone') as string,
    officeStreet1: formData.get('officeStreet1') as string,
    officeNumber1: formData.get('officeNumber1') as string,
    officeComplement1: formData.get('officeComplement1') as string,
    officeNeighborhood1: formData.get('officeNeighborhood1') as string,
    officeCEP1: formData.get('officeCEP1') as string,
    officeStreet2: formData.get('officeStreet2') as string,
    officeNumber2: formData.get('officeNumber2') as string,
    officeComplement2: formData.get('officeComplement2') as string,
    officeNeighborhood2: formData.get('officeNeighborhood2') as string,
    officeCEP2: formData.get('officeCEP2') as string,
    acceptsInsurance: formData.get('acceptsInsurance') === 'true',
    insuranceNames: formData.getAll('insuranceNames') as string[],
    instagram: formData.get('instagram') as string,
    facebook: formData.get('facebook') as string,
    website: formData.get('website') as string,
    linkedin: formData.get('linkedin') as string,
    telegram: formData.get('telegram') as string,
    tiktok: formData.get('tiktok') as string,
    dataSharingConsent: formData.get('dataSharingConsent') === 'true',
    rulesAcceptance: formData.get('rulesAcceptance') === 'true',
    croFile: '/placeholder.svg', // In a real app, this would be the uploaded file path
    approvalStatus: 'pending',
    createdAt: new Date().toISOString(),
    publicPageActive: false
  });
  
  return { success: true, professional: newProfessional };
};

// Filter professionals by criteria
export const filterProfessionals = (
  professionals: Professional[],
  { name = '', city = '', cro = '' }: { name?: string, city?: string, cro?: string }
) => {
  return professionals.filter(p => 
    (name ? p.fullName.toLowerCase().includes(name.toLowerCase()) : true) &&
    (city ? p.city.toLowerCase().includes(city.toLowerCase()) : true) &&
    // In a real app, you'd have a separate CRO field. Here we're just checking fullName as placeholder
    (cro ? p.fullName.toLowerCase().includes(cro.toLowerCase()) : true)
  );
};

// Get field configurations
export const getFieldConfigs = () => {
  return [...fieldConfigs];
};

// Update field configuration
export const updateFieldConfig = (id: string, updates: Partial<FieldConfig>) => {
  const index = fieldConfigs.findIndex(config => config.id === id);
  if (index !== -1) {
    fieldConfigs[index] = { ...fieldConfigs[index], ...updates };
    return fieldConfigs[index];
  }
  return null;
};

// Get required fields for a specific category
export const getRequiredFields = (category: 'personal' | 'address' | 'specialty') => {
  return fieldConfigs
    .filter(field => field.category === category && field.active && field.required)
    .sort((a, b) => a.order - b.order);
};

// Get all active fields for a specific category
export const getActiveFields = (category: 'personal' | 'address' | 'specialty') => {
  return fieldConfigs
    .filter(field => field.category === category && field.active)
    .sort((a, b) => a.order - b.order);
};

// Função para adicionar uma nova especialidade
export const addSpecialty = (specialty: string): boolean => {
  // Verificar se a especialidade já existe (insensível a maiúsculas/minúsculas)
  const exists = specialties.some(s => 
    s.toLowerCase() === specialty.toLowerCase()
  );
  
  if (!exists && specialty.trim() !== '') {
    // Adicionar a nova especialidade à lista
    specialties = [...specialties, specialty.trim()];
    // Ordenar alfabeticamente
    specialties.sort();
    return true;
  }
  
  return false;
};

// Função para remover uma especialidade
export const removeSpecialty = (specialty: string): boolean => {
  const initialLength = specialties.length;
  specialties = specialties.filter(s => s !== specialty);
  
  // Retornar true se algo foi removido
  return initialLength !== specialties.length;
};

// Função para obter todas as especialidades
export const getAllSpecialties = () => {
  return [...specialties]; // Retorna uma cópia da lista
};

// Função para adicionar uma nova cidade
export const addCity = (city: string): boolean => {
  // Verificar se a cidade já existe (insensível a maiúsculas/minúsculas)
  const exists = cities.some(c => 
    c.toLowerCase() === city.toLowerCase()
  );
  
  if (!exists && city.trim() !== '') {
    // Adicionar a nova cidade à lista
    cities.push(city.trim());
    // Ordenar alfabeticamente
    cities.sort();
    return true;
  }
  
  return false;
};

// Função para remover uma cidade
export const removeCity = (city: string): boolean => {
  const initialLength = cities.length;
  const index = cities.indexOf(city);
  if (index !== -1) {
    cities.splice(index, 1);
    return true;
  }
  return false;
};

// Função para obter todas as cidades
export const getAllCities = () => {
  return [...cities]; // Retorna uma cópia da lista
};

// Funções para especialidades no banco de dados Supabase
export const fetchSpecialtiesFromDB = async () => {
  const { data, error } = await supabase
    .from('specialties')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
};

export const addSpecialtyToDB = async (name: string) => {
  const { data, error } = await supabase
    .from('specialties')
    .insert([{ name }]);
  if (error) throw error;
  return data;
};

export const removeSpecialtyFromDB = async (id: string) => {
  const { error } = await supabase
    .from('specialties')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};
