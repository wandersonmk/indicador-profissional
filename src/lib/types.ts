export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Professional {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  birthDate?: string;
  city: string;
  neighborhood: string;
  croFile: string;
  approvalStatus: ApprovalStatus;
  specialty1: string;
  specialty2?: string;
  mainOffice?: string;
  secondaryOffice?: string;
  landlinePhone?: string;
  mobilePhone?: string;
  mobilePhone2?: string;
  whatsappPhone?: string;
  publicPageActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  croNumber?: string;
  croState?: string;
  officeCEP1?: string;
  officeCEP2?: string;
  officeStreet1?: string;
  officeNumber1?: string;
  officeComplement1?: string;
  officeNeighborhood1?: string;
  officeCity1?: string;
  officeState1?: string;
  officeStreet2?: string;
  officeNumber2?: string;
  officeComplement2?: string;
  officeNeighborhood2?: string;
  officeCity2?: string;
  officeState2?: string;
  acceptsInsurance?: boolean;
  insuranceNames?: string[];
  instagram?: string;
  facebook?: string;
  website?: string;
  linkedin?: string;
  telegram?: string;
  tiktok?: string;
  dataSharingConsent?: boolean;
  rulesAcceptance?: boolean;
  pendingChanges?: ProfileChange[];
}

export interface User {
  id: string;
  email: string;
  role: 'professional' | 'admin';
  created_at?: string;
  updated_at?: string;
  professional?: Professional;
}

export interface FieldConfig {
  id: string;
  name: string;
  label: string;
  category: 'personal' | 'address' | 'specialty';
  required: boolean;
  active: boolean;
  order: number;
}

// Usando array para armazenar as especialidades cadastradas
// A lista inicial incluirá as especialidades padrão
export let specialties = [
  "Dentística",
  "Endodontia",
  "Implantodontia",
  "Odontopediatria",
  "Ortodontia",
  "Periodontia",
  "Prótese Dentária",
  "Radiologia",
  "Saúde Coletiva",
  "Cirurgia e Traumatologia Bucomaxilofacial",
  "Disfunção Temporomandibular e Dor Orofacial",
  "Estomatologia",
  "Odontologia do Trabalho",
  "Odontogeriatria",
  "Odontologia Legal",
  "Patologia Bucal",
  "Odontologia para Pacientes com Necessidades Especiais"
];

export const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// Usando array para armazenar as cidades cadastradas
export const cities: string[] = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Brasília",
  "Salvador",
  "Fortaleza",
  "Curitiba",
  "Manaus",
  "Recife",
  "Porto Alegre"
];

export interface ProfileChange {
  id: string;
  professionalId: string;
  field: keyof Professional;
  oldValue: any;
  newValue: any;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface AuthError {
  message: string;
  status?: number;
}
