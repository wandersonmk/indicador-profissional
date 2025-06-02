import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { getAllSpecialties } from '@/lib/data-service';
import { updateProfessional } from '@/lib/data-service';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, Loader2 } from 'lucide-react';
import { Professional, ProfileChange, specialties, brazilianStates } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialtiesList, setSpecialtiesList] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Professional>({} as Professional);
  const [pendingChanges, setPendingChanges] = useState<ProfileChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadProfessionalData = async () => {
      try {
        setIsLoading(true);
        setSpecialtiesList(getAllSpecialties());
        
        if (user?.id) {
          const { data: professional, error } = await supabase
            .from('professional_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            throw error;
          }

          if (professional) {
            console.log('Dados do profissional carregados:', professional);
            // Converter os dados do Supabase para o formato do Professional
            const formattedData: Professional = {
              id: professional.id,
              email: user.email || '',
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
              pendingChanges: professional.pending_changes,
              isBlocked: professional.is_blocked
            };

            console.log('Dados formatados:', formattedData);
            setFormData(formattedData);
            setPendingChanges(professional.pending_changes || []);
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

  const handleInputChange = (field: keyof Professional, value: any) => {
    if (!isEditing) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Converter os dados do formulário para o formato do Supabase
      const supabaseData = {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        birth_date: formData.birthDate,
        city: formData.city,
        neighborhood: formData.neighborhood,
        cro_number: formData.croNumber,
        cro_state: formData.croState,
        specialty1: formData.specialty1,
        specialty2: formData.specialty2,
        landline_phone: formData.landlinePhone,
        mobile_phone: formData.mobilePhone,
        mobile_phone2: formData.mobilePhone2,
        whatsapp_phone: formData.whatsappPhone,
        office_cep1: formData.officeCEP1,
        office_street1: formData.officeStreet1,
        office_number1: formData.officeNumber1,
        office_complement1: formData.officeComplement1,
        office_neighborhood1: formData.officeNeighborhood1,
        office_city1: formData.officeCity1,
        office_state1: formData.officeState1,
        office_cep2: formData.officeCEP2,
        office_street2: formData.officeStreet2,
        office_number2: formData.officeNumber2,
        office_complement2: formData.officeComplement2,
        office_neighborhood2: formData.officeNeighborhood2,
        office_city2: formData.officeCity2,
        office_state2: formData.officeState2,
        accepts_insurance: formData.acceptsInsurance,
        insurance_names: formData.insuranceNames,
        instagram: formData.instagram,
        facebook: formData.facebook,
        website: formData.website,
        linkedin: formData.linkedin,
        telegram: formData.telegram,
        tiktok: formData.tiktok,
        data_sharing_consent: formData.dataSharingConsent,
        rules_acceptance: formData.rulesAcceptance
      };

      const { error } = await supabase
        .from('professional_profiles')
        .update(supabaseData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      toast({
        title: "Erro ao salvar alterações",
        description: "Ocorreu um erro ao salvar suas informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        const { data: professional, error } = await supabase
          .from('professional_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (professional) {
          const formattedData: Professional = {
            id: professional.id,
            email: user.email || '',
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
            pendingChanges: professional.pending_changes,
            isBlocked: professional.is_blocked
          };

          setFormData(formattedData);
          setPendingChanges(professional.pending_changes || []);
        }
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
      toast({
        title: "Erro ao recarregar dados",
        description: "Não foi possível recarregar seus dados. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCEP1Change = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    handleInputChange('officeCEP1', e.target.value);
    if (cep.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.data.erro) {
          handleInputChange('officeStreet1', response.data.logradouro || '');
          handleInputChange('officeNeighborhood1', response.data.bairro || '');
          handleInputChange('officeCity1', response.data.localidade || '');
          handleInputChange('officeState1', response.data.uf || '');
        }
      } catch (error) {
        // Pode exibir um toast de erro se quiser
      }
    }
  };

  const formatWhatsAppNumber = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Se não houver números, retorna vazio
    if (!numbers) return '';
    
    // Limita a 11 dígitos (DDD + 9 + 8 dígitos)
    const limitedNumbers = numbers.slice(0, 11);
    
    // Formata o número
    if (limitedNumbers.length <= 2) {
      return `(${limitedNumbers}`;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else if (limitedNumbers.length <= 11) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
    }
    
    return value;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatWhatsAppNumber(e.target.value);
    handleInputChange('whatsappPhone', formattedValue);
  };

  // Adicionar um objeto de placeholders para redes sociais
  const socialPlaceholders: Record<string, string> = {
    instagram: '@seuusuario ou https://instagram.com/seuusuario',
    facebook: 'https://facebook.com/seuusuario',
    linkedin: 'https://linkedin.com/in/seuusuario',
    tiktok: '@seuusuario ou https://tiktok.com/@seuusuario',
    telegram: '@seuusuario ou https://t.me/seuusuario',
    website: 'https://seusite.com.br',
  };

  const renderField = (
    field: keyof Professional,
    label: string,
    type: 'text' | 'select' | 'switch' = 'text',
    options?: string[],
    placeholder?: string
  ) => {
    const value = formData[field];
    const pendingChange = pendingChanges.find(change => change.field === field);

    return (
      <div className="flex flex-col h-full">
        <Label htmlFor={field} className="mb-1.5">{label}</Label>
        <div className="flex-1">
          {type === 'text' && (
            <Input
              id={field}
              value={typeof value === 'string' || typeof value === 'number' ? value : ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              disabled={!isEditing}
              placeholder={placeholder}
              className={`w-full ${pendingChange ? 'border-yellow-500' : ''}`}
            />
          )}
          {type === 'select' && options && (
            <Select
              value={typeof value === 'string' ? value : ''}
              onValueChange={(value) => handleInputChange(field, value)}
              disabled={!isEditing}
            >
              <SelectTrigger className={`w-full ${pendingChange ? 'border-yellow-500' : ''}`}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {type === 'switch' && (
            <div className="flex items-center h-10">
              <Switch
                checked={!!value}
                onCheckedChange={(checked) => handleInputChange(field, checked)}
                disabled={!isEditing}
              />
            </div>
          )}
        </div>
        {pendingChange && (
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
            Alteração pendente de aprovação
          </p>
        )}
      </div>
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-y-auto mt-16 md:mt-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-emerald-500 bg-clip-text text-transparent tracking-tight">Editar Perfil</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Atualize suas informações profissionais. Todas as alterações serão enviadas para aprovação da administração.
              </p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full md:w-auto flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Carregando seus dados...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-0.5">Perfil Profissional</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gerencie suas informações profissionais
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-brand to-emerald-500 hover:from-brand/90 hover:to-emerald-500/90 text-white font-medium px-4 py-1.5 rounded-lg shadow-md"
                    >
                      Editar Perfil
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-brand to-emerald-500 hover:from-brand/90 hover:to-emerald-500/90 text-white font-medium px-4 py-1.5 rounded-lg shadow-md"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar e enviar'
                        )}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="font-medium px-4 py-1.5 rounded-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Cancelando...
                          </>
                        ) : (
                          'Cancelar'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                <Card className="bg-white/90 dark:bg-gray-900/80 border-0 shadow-lg rounded-xl">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-2">
                    <CardTitle className="text-base font-semibold text-brand dark:text-emerald-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-brand to-emerald-500"></span>
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('fullName', 'Nome Completo')}
                    <div className="flex flex-col h-full">
                      <Label htmlFor="email" className="mb-1.5">Email</Label>
                      <div className="flex-1">
                        <Input
                          id="email"
                          value={formData.email}
                          disabled={true}
                          className="w-full bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    {renderField('croNumber', 'CRO')}
                    {renderField('croState', 'Estado do CRO', 'select', brazilianStates)}
                    {renderField('birthDate', 'Data de Nascimento')}
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-900/80 border-0 shadow-lg rounded-xl">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-2">
                    <CardTitle className="text-base font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-400"></span>
                      Especialidades
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('specialty1', 'Especialidade Principal', 'select', specialties)}
                    {renderField('specialty2', 'Especialidade Secundária', 'select', specialties)}
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-900/80 border-0 shadow-lg rounded-xl">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-2">
                    <CardTitle className="text-base font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-400"></span>
                      Contato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('mobilePhone', 'WhatsApp')}
                    {renderField('mobilePhone2', 'Telefone Celular')}
                    {renderField('landlinePhone', 'Telefone Fixo')}
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-900/80 border-0 shadow-lg rounded-xl">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-2">
                    <CardTitle className="text-base font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"></span>
                      Consultório Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col h-full">
                      <Label htmlFor="officeCEP1" className="mb-1.5">CEP</Label>
                      <div className="flex-1">
                        <Input
                          id="officeCEP1"
                          value={typeof formData.officeCEP1 === 'string' ? formData.officeCEP1 : ''}
                          onChange={handleCEP1Change}
                          disabled={!isEditing}
                          maxLength={9}
                          placeholder="00000-000"
                          className={`w-full ${pendingChanges.find(change => change.field === 'officeCEP1') ? 'border-yellow-500' : ''}`}
                        />
                      </div>
                      {pendingChanges.find(change => change.field === 'officeCEP1') && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                          Alteração pendente de aprovação
                        </p>
                      )}
                    </div>
                    {renderField('officeStreet1', 'Endereço')}
                    {renderField('officeNumber1', 'Número')}
                    {renderField('officeNeighborhood1', 'Bairro')}
                    {renderField('officeCity1', 'Cidade')}
                    {renderField('officeState1', 'Estado', 'select', brazilianStates)}
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-900/80 border-0 shadow-lg rounded-xl">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-2">
                    <CardTitle className="text-base font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-400"></span>
                      Consultório Secundário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col h-full">
                      <Label htmlFor="officeCEP2" className="mb-1.5">CEP</Label>
                      <div className="flex-1">
                        <Input
                          id="officeCEP2"
                          value={typeof formData.officeCEP2 === 'string' ? formData.officeCEP2 : ''}
                          onChange={(e) => handleInputChange('officeCEP2', e.target.value)}
                          disabled={!isEditing}
                          maxLength={9}
                          placeholder="00000-000"
                          className={`w-full ${pendingChanges.find(change => change.field === 'officeCEP2') ? 'border-yellow-500' : ''}`}
                        />
                      </div>
                      {pendingChanges.find(change => change.field === 'officeCEP2') && (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                          Alteração pendente de aprovação
                        </p>
                      )}
                    </div>
                    {renderField('officeStreet2', 'Endereço')}
                    {renderField('officeNumber2', 'Número')}
                    {renderField('officeNeighborhood2', 'Bairro')}
                    {renderField('officeCity2', 'Cidade')}
                    {renderField('officeState2', 'Estado', 'select', brazilianStates)}
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-900/80 border-0 shadow-lg rounded-xl">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-2">
                    <CardTitle className="text-base font-semibold text-pink-700 dark:text-pink-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-pink-400"></span>
                      Redes Sociais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('instagram', 'Instagram', 'text', undefined, socialPlaceholders.instagram)}
                    {renderField('facebook', 'Facebook', 'text', undefined, socialPlaceholders.facebook)}
                    {renderField('linkedin', 'LinkedIn', 'text', undefined, socialPlaceholders.linkedin)}
                    {renderField('tiktok', 'TikTok', 'text', undefined, socialPlaceholders.tiktok)}
                    {renderField('telegram', 'Telegram', 'text', undefined, socialPlaceholders.telegram)}
                    {renderField('website', 'Site', 'text', undefined, socialPlaceholders.website)}
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-900/80 border-0 shadow-lg rounded-xl">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-2">
                    <CardTitle className="text-base font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"></span>
                      Configurações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="acceptsInsurance">Atende Convênio</Label>
                        <Switch
                          id="acceptsInsurance"
                          checked={formData.acceptsInsurance}
                          onCheckedChange={(checked) => handleInputChange('acceptsInsurance', checked)}
                          disabled={!isEditing}
                        />
                      </div>
                      {formData.acceptsInsurance && (
                        <div className="mt-2">
                          <Label className="text-sm text-muted-foreground mb-1.5">
                            Convênios Atendidos
                          </Label>
                          <div className="space-y-2">
                            {(formData.insuranceNames || []).map((insurance, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={insurance}
                                  onChange={(e) => {
                                    const insurances = [...(formData.insuranceNames || [])];
                                    insurances[index] = e.target.value;
                                    handleInputChange('insuranceNames', insurances);
                                  }}
                                  disabled={!isEditing}
                                  placeholder="Nome do convênio"
                                />
                                {isEditing && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                      const insurances = [...(formData.insuranceNames || [])];
                                      insurances.splice(index, 1);
                                      handleInputChange('insuranceNames', insurances);
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                      <line x1="10" x2="10" y1="11" y2="17"></line>
                                      <line x1="14" x2="14" y1="11" y2="17"></line>
                                    </svg>
                                  </Button>
                                )}
                              </div>
                            ))}
                            {isEditing && (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                  const currentInsurances = formData.insuranceNames || [];
                                  handleInputChange('insuranceNames', [...currentInsurances, '']);
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus mr-2">
                                  <path d="M5 12h14"></path>
                                  <path d="M12 5v14"></path>
                                </svg>
                                Adicionar Convênio
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {isEditing && (
                <div className="sticky bottom-0 left-0 w-full bg-gradient-to-t from-white/95 dark:from-gray-900/95 to-transparent pt-6 pb-4 flex justify-end z-20 border-t border-gray-200 dark:border-gray-800 mt-8">
                  <div className="max-w-4xl w-full mx-auto flex justify-end gap-4 px-2">
                    <Button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-brand to-emerald-500 hover:from-brand/90 hover:to-emerald-500/90 text-white font-medium px-6 py-2 rounded-lg shadow-md"
                    >
                      Salvar e enviar
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="font-medium px-6 py-2 rounded-lg"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
