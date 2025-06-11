import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { professionalSignUp, getAllCities } from "@/lib/data-service";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { brazilianStates, specialties } from "@/lib/types";
import InputMask from 'react-input-mask';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showSecondOffice, setShowSecondOffice] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    croNumber: '',
    croState: '',
    croFile: null as File | null,
    specialty1: '',
    specialty2: '',
    phoneNumber: '',
    mobilePhone: '',
    mobilePhone2: '',
    hasNinthDigit: true,
    whatsappPhone: '',
    landlinePhone: '',
    city: '',
    neighborhood: '',
    officeCEP1: '',
    officeStreet1: '',
    officeNumber1: '',
    officeComplement1: '',
    officeNeighborhood1: '',
    officeCity1: '',
    officeState1: '',
    officeCEP2: '',
    officeStreet2: '',
    officeNumber2: '',
    officeComplement2: '',
    officeNeighborhood2: '',
    officeCity2: '',
    officeState2: '',
    acceptsInsurance: false,
    insuranceNames: [] as string[],
    instagram: '',
    facebook: '',
    website: '',
    linkedin: '',
    telegram: '',
    tiktok: '',
    dataSharingConsent: false,
    rulesAcceptance: false,
    showRules: false
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecondSpecialty, setShowSecondSpecialty] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [specialtiesList, setSpecialtiesList] = useState<{ id: string, name: string }[]>([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      const { data, error } = await supabase
        .from('specialties')
        .select('id, name')
        .order('name', { ascending: true });
      if (!error && data) setSpecialtiesList(data);
    };
    fetchSpecialties();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('application/pdf|image/jpeg|image/png')) {
        setFormErrors((prev) => ({ ...prev, croFile: "Por favor, envie um arquivo PDF, JPG ou PNG" }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, croFile: "O arquivo deve ter no máximo 5MB. Arquivos maiores podem travar o cadastro." }));
        return;
      }
      setFormData((prev) => ({ ...prev, croFile: file }));
      setFormErrors((prev) => ({ ...prev, croFile: "" }));
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, croFile: null }));
    // Limpa o input file
    const fileInput = document.getElementById('croFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cep = value.replace(/\D/g, '');
    
    // Atualiza o CEP no estado
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Se o CEP tiver 8 dígitos, busca o endereço
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          // Determina qual conjunto de campos atualizar baseado no nome do campo
          const isSecondOffice = name === 'officeCEP2';
          const streetField = isSecondOffice ? 'officeStreet2' : 'officeStreet1';
          const neighborhoodField = isSecondOffice ? 'officeNeighborhood2' : 'officeNeighborhood1';
          const cityField = isSecondOffice ? 'officeCity2' : 'officeCity1';
          const stateField = isSecondOffice ? 'officeState2' : 'officeState1';
          
          setFormData(prev => ({
            ...prev,
            [streetField]: data.logradouro || '',
            [neighborhoodField]: data.bairro || '',
            [cityField]: data.localidade || '',
            [stateField]: data.uf || '',
            [name]: value
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível encontrar o endereço para este CEP.",
          variant: "destructive",
        });
      }
    }
  };

  // Validação por etapa
  const validateStep = () => {
    const errors: Record<string, string> = {};
    let hasError = false;
    const missingFields: string[] = [];

    if (step === 1) {
      if (!formData.fullName) {
        errors.fullName = "Nome completo é obrigatório";
        hasError = true;
        missingFields.push("Nome Completo");
      }
      // Validação obrigatória para data de nascimento
      if (!formData.birthDate) {
        errors.birthDate = "Data de nascimento é obrigatória";
        hasError = true;
        missingFields.push("Data de Nascimento");
      } else {
        // Validação do formato dd/mm/yyyy
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(formData.birthDate)) {
          errors.birthDate = "Data de nascimento deve estar no formato dd/mm/aaaa";
          hasError = true;
          missingFields.push("Data de Nascimento (formato dd/mm/aaaa)");
        } else {
          // Validação se a data é válida
          const [day, month, year] = formData.birthDate.split('/').map(Number);
          const dateObj = new Date(year, month - 1, day);
          if (
            dateObj.getFullYear() !== year ||
            dateObj.getMonth() !== month - 1 ||
            dateObj.getDate() !== day
          ) {
            errors.birthDate = "Data de nascimento inválida";
            hasError = true;
            missingFields.push("Data de Nascimento (data inválida)");
          }
        }
      }
      if (!formData.croNumber) {
        errors.croNumber = "CRO é obrigatório";
        hasError = true;
        missingFields.push("CRO");
      }
      if (!formData.croState) {
        errors.croState = "Estado/UF do CRO é obrigatório";
        hasError = true;
        missingFields.push("Estado/UF do CRO");
      }
      if (!formData.mobilePhone) {
        errors.mobilePhone = "Telefone celular (WhatsApp) é obrigatório";
        hasError = true;
        missingFields.push("Telefone Comercial Celular (WhatsApp)");
      }
    } else if (step === 2) {
      if (!formData.email) {
        errors.email = "Email é obrigatório";
        hasError = true;
        missingFields.push("Email");
      }
      if (!formData.password) {
        errors.password = "Senha é obrigatória";
        hasError = true;
        missingFields.push("Senha");
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Confirmação de senha é obrigatória";
        hasError = true;
        missingFields.push("Confirmação de Senha");
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "As senhas não coincidem";
        hasError = true;
        missingFields.push("Confirmação de Senha (não coincide)");
      }
      if (formData.password.length < 6) {
        errors.password = "A senha deve ter pelo menos 6 caracteres";
        hasError = true;
        missingFields.push("Senha (mínimo 6 caracteres)");
      }
    } else if (step === 3) {
      if (!formData.officeCEP1) {
        errors.officeCEP1 = "CEP do consultório principal é obrigatório";
        hasError = true;
        missingFields.push("CEP do Consultório Principal");
      }
      if (!formData.officeStreet1) {
        errors.officeStreet1 = "Rua do consultório principal é obrigatória";
        hasError = true;
        missingFields.push("Rua do Consultório Principal");
      }
      if (!formData.officeNumber1) {
        errors.officeNumber1 = "Número do consultório principal é obrigatório";
        hasError = true;
        missingFields.push("Número do Consultório Principal");
      }
      if (!formData.officeNeighborhood1) {
        errors.officeNeighborhood1 = "Bairro do consultório principal é obrigatório";
        hasError = true;
        missingFields.push("Bairro do Consultório Principal");
      }
      if (!formData.officeCity1) {
        errors.officeCity1 = "Cidade do consultório principal é obrigatória";
        hasError = true;
        missingFields.push("Cidade do Consultório Principal");
      }
      if (!formData.officeState1) {
        errors.officeState1 = "Estado do consultório principal é obrigatório";
        hasError = true;
        missingFields.push("Estado do Consultório Principal");
      }

      if (showSecondOffice) {
        if (!formData.officeCEP2) {
          errors.officeCEP2 = "CEP do segundo consultório é obrigatório";
          hasError = true;
          missingFields.push("CEP do Segundo Consultório");
        }
        if (!formData.officeStreet2) {
          errors.officeStreet2 = "Rua do segundo consultório é obrigatória";
          hasError = true;
          missingFields.push("Rua do Segundo Consultório");
        }
        if (!formData.officeNumber2) {
          errors.officeNumber2 = "Número do segundo consultório é obrigatório";
          hasError = true;
          missingFields.push("Número do Segundo Consultório");
        }
        if (!formData.officeNeighborhood2) {
          errors.officeNeighborhood2 = "Bairro do segundo consultório é obrigatório";
          hasError = true;
          missingFields.push("Bairro do Segundo Consultório");
        }
        if (!formData.officeCity2) {
          errors.officeCity2 = "Cidade do segundo consultório é obrigatória";
          hasError = true;
          missingFields.push("Cidade do Segundo Consultório");
        }
        if (!formData.officeState2) {
          errors.officeState2 = "Estado do segundo consultório é obrigatório";
          hasError = true;
          missingFields.push("Estado do Segundo Consultório");
        }
      }
    } else if (step === 4) {
      if (!formData.specialty1) {
        errors.specialty1 = "Especialidade é obrigatória";
        hasError = true;
        missingFields.push("Especialidade Principal");
      }
      if (showSecondSpecialty && !formData.specialty2) {
        errors.specialty2 = "Segunda especialidade é obrigatória quando selecionada";
        hasError = true;
        missingFields.push("Segunda Especialidade");
      }
      if (formData.acceptsInsurance && formData.insuranceNames.length === 0) {
        errors.insuranceNames = "Adicione pelo menos um convênio";
        hasError = true;
        missingFields.push("Convênios");
      }
      if (formData.acceptsInsurance && formData.insuranceNames.some(name => !name.trim())) {
        errors.insuranceNames = "Todos os convênios devem ter um nome";
        hasError = true;
        missingFields.push("Nome dos Convênios");
      }
    } else if (step === 5) {
      // Step 5 (Redes Sociais) não tem campos obrigatórios
      return true;
    } else if (step === 6) {
      if (!formData.croFile) {
        errors.croFile = "Para continuar com o cadastro, é necessário enviar o arquivo do CRO. Por favor, faça o upload do documento.";
        hasError = true;
        missingFields.push("Arquivo do CRO");
      }
      if (!formData.dataSharingConsent) {
        errors.dataSharingConsent = "É necessário autorizar a divulgação dos dados";
        hasError = true;
        missingFields.push("Autorização de Divulgação");
      }
      if (!formData.rulesAcceptance) {
        errors.rulesAcceptance = "É necessário aceitar as regras de participação";
        hasError = true;
        missingFields.push("Aceitação das Regras");
      }
    }

    setFormErrors(errors);

    if (hasError) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: (
          <div className="mt-2">
            <p className="font-medium text-white">Por favor, preencha os seguintes campos:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {missingFields.map((field, index) => (
                <li key={index} className="text-white font-medium">
                  {field}
                </li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      setIsLoading(true);
      setUploadingFile(false);
      console.log('Iniciando processo de cadastro...');

      // 1. Criar usuário no Supabase Auth
      console.log('Criando usuário no Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        throw authError;
      }

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error('ID do usuário não retornado após criação');
      }
      console.log('Usuário criado com sucesso:', userId);

      // 2. Criar registro na tabela profiles
      console.log('Criando registro na tabela profiles...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          email: formData.email,
          role: 'professional',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw profileError;
      }
      console.log('Perfil criado com sucesso');

      let croFileUrl = null;

      // 2. Upload do arquivo CRO (se houver)
      if (formData.croFile) {
        setUploadingFile(true);
        toast({
          title: "Enviando arquivo...",
          description: "Aguarde enquanto o arquivo do CRO está sendo enviado.",
        });
        try {
          const uploadPromise = supabase.storage
            .from('cro-files')
            .upload(`${userId}/${formData.croFile.name}`, formData.croFile, { upsert: true });
          // Timeout de 30 segundos para upload
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Tempo limite de upload excedido. Tente um arquivo menor.')), 30000));
          const uploadResult = await Promise.race([uploadPromise, timeoutPromise]);
          // uploadResult pode ser um erro lançado pelo timeout ou o resultado do upload
          if (typeof uploadResult === 'object' && uploadResult !== null && 'error' in uploadResult && uploadResult.error) {
            setUploadingFile(false);
            setIsLoading(false);
            console.error('Erro no upload do arquivo CRO:', uploadResult.error);
            throw uploadResult.error;
          }
          const { data: urlData } = supabase.storage
            .from('cro-files')
            .getPublicUrl(`${userId}/${formData.croFile.name}`);
          croFileUrl = urlData.publicUrl;
          setUploadingFile(false);
          console.log('Upload do arquivo CRO concluído:', croFileUrl);
        } catch (uploadError) {
          setUploadingFile(false);
          setIsLoading(false);
          console.error('Erro no processo de upload do CRO:', uploadError);
          toast({
            title: "Erro ao enviar arquivo",
            description: uploadError.message || "Ocorreu um erro ao enviar o arquivo. Tente um arquivo menor.",
            variant: "destructive",
          });
          return;
        }
      }

      // 3. Insere em professional_profiles
      console.log('Inserindo dados em professional_profiles...');
      const { error: profProfileError } = await supabase
        .from('professional_profiles')
        .insert([{
          id: userId,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          birth_date: formData.birthDate,
          cro_number: formData.croNumber,
          cro_state: formData.croState,
          cro_file_url: croFileUrl,
          specialty1: formData.specialty1,
          specialty2: formData.specialty2,
          mobile_phone: formData.mobilePhone,
          mobile_phone2: formData.mobilePhone2,
          landline_phone: formData.landlinePhone,
          whatsapp_phone: formData.whatsappPhone,
          city: formData.city,
          neighborhood: formData.neighborhood,
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
          rules_acceptance: formData.rulesAcceptance,
          approval_status: 'pending',
          is_blocked: false
        }]);

      if (profProfileError) {
        console.error('Erro ao inserir em professional_profiles:', profProfileError);
        throw profProfileError;
      }
      console.log('Dados inseridos em professional_profiles com sucesso');

      // 4. Insere em pending_approvals
      console.log('Inserindo dados em pending_approvals...');
      const { error: pendingApprovalError } = await supabase
        .from('pending_approvals')
        .insert([{
          professional_id: userId,
          status: 'pending',
          is_blocked: false
        }]);

      if (pendingApprovalError) {
        console.error('Erro ao inserir em pending_approvals:', pendingApprovalError);
        throw pendingApprovalError;
      }
      console.log('Dados inseridos em pending_approvals com sucesso');

      // 5. Enviar webhook de cadastro
      console.log('Enviando webhook de cadastro...');
      try {
        await fetch('https://n8n-n8n-start.2nyhks.easypanel.host/webhook/cadastro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: formData.fullName,
            whatsApp: formData.mobilePhone,
            email: formData.email
          })
        });
        console.log('Webhook enviado com sucesso');
      } catch (webhookError) {
        console.error('Erro ao enviar webhook de cadastro:', webhookError);
        // Não vamos lançar erro aqui para não impedir o cadastro
      }

      toast({
        title: 'Cadastro realizado com sucesso',
        description: 'Seu cadastro foi enviado para aprovação. Você receberá um aviso quando for aprovado.',
      });
      navigate('/register-success');
    } catch (error) {
      setUploadingFile(false);
      setIsLoading(false);
      console.error('Erro durante o processo de cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro durante o cadastro. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand/10 to-emerald-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 py-8">
      <div className="w-full max-w-4xl px-4">
        <Card className="shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
          {/* Checkpoints das etapas */}
          <div className="w-full flex justify-center items-center gap-4 pt-6 pb-2">
            {[1,2,3,4,5,6].map((n) => (
              <div key={n} className={`flex flex-col items-center`}>
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2
                    ${step > n ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                    ${step === n ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg scale-110' : ''}
                    ${step < n ? 'bg-white dark:bg-gray-900 border-emerald-300 dark:border-emerald-700 text-emerald-500 dark:text-emerald-400' : ''}
                    transition-all duration-300 font-semibold text-sm`}
                >
                  {n}
                </div>
                {/* Linha de conexão */}
                {n < 6 && (
                  <div className={`w-12 h-1 ${step > n ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-800'} transition-all duration-300`} />
                )}
              </div>
            ))}
          </div>
          {/* Porcentagem de progresso */}
          <div className="w-full flex justify-center items-center pt-2 pb-3">
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {step === 1 ? '16%' : step === 2 ? '32%' : step === 3 ? '48%' : step === 4 ? '64%' : step === 5 ? '80%' : '100%'}
            </span>
          </div>
          {/* Barra de progresso */}
          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-t-md overflow-hidden">
            <div
              className={`h-2.5 transition-all duration-500 ${step === 1 ? 'w-1/6' : step === 2 ? 'w-2/6' : step === 3 ? 'w-3/6' : step === 4 ? 'w-4/6' : step === 5 ? 'w-5/6' : 'w-full'} bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500`}
            />
          </div>
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl font-extrabold text-brand dark:text-emerald-400 text-center tracking-tight">Cadastro de Profissional</CardTitle>
            <CardDescription className="text-center text-base dark:text-gray-300 mt-2">
              {step === 1 && "Dados Pessoais e Profissionais"}
              {step === 2 && "Dados de Acesso"}
              {step === 3 && "Endereço do Consultório"}
              {step === 4 && "Informações de Atendimento"}
              {step === 5 && "Redes Sociais e Canais Digitais"}
              {step === 6 && "Documentos e Finalização"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Estilo comum para todos os campos */}
              <style>{`
                .form-input {
                  @apply w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-brand dark:focus:ring-emerald-400 focus:border-transparent
                  transition-all duration-200;
                }
                .form-input-error {
                  @apply border-red-500 dark:border-red-400 ring-red-500 dark:ring-red-400;
                }
                .form-label {
                  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5;
                }
                .form-error {
                  @apply text-sm text-red-600 dark:text-red-400 font-semibold mt-1.5 flex items-center;
                }
                .form-section {
                  @apply space-y-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl;
                }
                .form-section-title {
                  @apply text-xl font-semibold text-gray-900 dark:text-white mb-4;
                }
                .form-grid {
                  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
                }
              `}</style>

              {/* Etapa 1: Dados Pessoais e Profissionais */}
              {step === 1 && (
                <div className="form-section">
                  <div className="form-grid">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="form-label">Nome Completo<span className="text-red-500 ml-1">*</span></Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Dr. João Silva"
                        disabled={isLoading}
                        className={`form-input ${formErrors.fullName ? 'form-input-error' : ''}`}
                      />
                      {formErrors.fullName && (
                        <p className="form-error">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de nascimento<span className="text-red-500 ml-1">*</span></Label>
                      <InputMask
                        mask="99/99/9999"
                        value={formData.birthDate}
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="birthDate"
                            name="birthDate"
                            placeholder="dd/mm/aaaa"
                            className={`form-input ${formErrors.birthDate ? 'form-input-error' : ''}`}
                          />
                        )}
                      </InputMask>
                      {formErrors.birthDate && (
                        <p className="form-error">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formErrors.birthDate}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="croNumber">CRO<span className="text-red-500 ml-1">*</span></Label>
                      <Input
                        id="croNumber"
                        name="croNumber"
                        value={formData.croNumber}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                      {formErrors.croNumber && (
                        <p className="form-error">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formErrors.croNumber}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="croState">Estado/UF da Inscrição no CRO<span className="text-red-500 ml-1">*</span></Label>
                      <Select
                        value={formData.croState}
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, croState: value }));
                          if (formErrors.croState) {
                            setFormErrors(prev => ({ ...prev, croState: "" }));
                          }
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="croState">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto z-50">
                          {brazilianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.croState && (
                        <p className="form-error">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formErrors.croState}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobilePhone">Telefone Comercial Celular (com DDD)<span className="text-red-500 ml-1">*</span><span className="text-xs text-gray-400 ml-1">(WhatsApp)</span></Label>
                      <div className="space-y-2">
                        <InputMask
                          mask={formData.hasNinthDigit ? "(99) 99999-9999" : "(99) 9999-9999"}
                          value={formData.mobilePhone}
                          onChange={handleChange}
                          disabled={isLoading}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              id="mobilePhone"
                              name="mobilePhone"
                              placeholder={formData.hasNinthDigit ? "(11) 98765-4321" : "(11) 9876-5432"}
                              className="focus:ring-2 focus:ring-brand dark:focus:ring-emerald-400"
                            />
                          )}
                        </InputMask>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="hasNinthDigit"
                              name="hasNinthDigit"
                              checked={formData.hasNinthDigit}
                              onChange={() => {
                                setFormData(prev => ({ ...prev, hasNinthDigit: true, mobilePhone: "" }));
                              }}
                              disabled={isLoading}
                              className="h-3 w-3 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <Label htmlFor="hasNinthDigit" className="text-sm font-normal">Com 9 dígitos</Label>
                          </div>
                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="noNinthDigit"
                              name="hasNinthDigit"
                              checked={!formData.hasNinthDigit}
                              onChange={() => {
                                setFormData(prev => ({ ...prev, hasNinthDigit: false, mobilePhone: "" }));
                              }}
                              disabled={isLoading}
                              className="h-3 w-3 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <Label htmlFor="noNinthDigit" className="text-sm font-normal">Com 8 dígitos</Label>
                          </div>
                        </div>
                      </div>
                      {formErrors.mobilePhone && (
                        <p className="form-error">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formErrors.mobilePhone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="landlinePhone">Telefone Comercial Fixo (com DDD)</Label>
                      <InputMask
                        mask="(99) 9999-9999"
                        value={formData.landlinePhone}
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="landlinePhone"
                            name="landlinePhone"
                            placeholder="(11) 3333-4444"
                            className="focus:ring-2 focus:ring-brand dark:focus:ring-emerald-400"
                          />
                        )}
                      </InputMask>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobilePhone2">Celular Alternativo (opcional)</Label>
                      <InputMask
                        mask="(99) 99999-9999"
                        value={formData.mobilePhone2}
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {(inputProps: any) => (
                          <Input
                            {...inputProps}
                            id="mobilePhone2"
                            name="mobilePhone2"
                            placeholder="(11) 98888-9999"
                            className="focus:ring-2 focus:ring-brand dark:focus:ring-emerald-400"
                          />
                        )}
                      </InputMask>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 2: Dados de Acesso */}
              {step === 2 && (
                <div className="form-section">
                  <div className="form-grid">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email<span className="text-red-500 ml-1">*</span></Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="seu@email.com"
                          disabled={isLoading}
                          className={`form-input ${formErrors.email ? 'form-input-error' : ''}`}
                        />
                        {formErrors.email && (
                          <p className="form-error">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha<span className="text-red-500 ml-1">*</span></Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={`form-input ${formErrors.password ? 'form-input-error' : ''}`}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {formErrors.password && (
                          <p className="form-error">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.password}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha<span className="text-red-500 ml-1">*</span></Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={`form-input ${formErrors.confirmPassword ? 'form-input-error' : ''}`}
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {formErrors.confirmPassword && (
                          <p className="form-error">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 3: Endereço do Consultório */}
              {step === 3 && (
                <>
                  {/* Consultório 1 */}
                  <div className="form-section">
                    <h3 className="form-section-title">Consultório 1 (PRINCIPAL)</h3>
                    <div className="form-grid">
                      <div className="space-y-2">
                        <Label htmlFor="officeCEP1" className="form-label">CEP<span className="text-red-500 ml-1">*</span></Label>
                        <InputMask
                          mask="99999-999"
                          value={formData.officeCEP1}
                          onChange={handleCEPChange}
                          disabled={isLoading}
                        >
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              id="officeCEP1"
                              name="officeCEP1"
                              placeholder="00000-000"
                              required
                              disabled={isLoading}
                              className={`form-input ${formErrors.officeCEP1 ? 'form-input-error' : ''}`}
                            />
                          )}
                        </InputMask>
                        {formErrors.officeCEP1 && (
                          <p className="form-error">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.officeCEP1}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="officeStreet1">Rua<span className="text-red-500 ml-1">*</span></Label>
                        <Input
                          id="officeStreet1"
                          name="officeStreet1"
                          value={formData.officeStreet1}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className={`form-input ${formErrors.officeStreet1 ? 'form-input-error' : ''}`}
                        />
                        {formErrors.officeStreet1 && (
                          <p className="form-error">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.officeStreet1}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="officeNumber1">Número<span className="text-red-500 ml-1">*</span></Label>
                        <Input
                          id="officeNumber1"
                          name="officeNumber1"
                          value={formData.officeNumber1}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className={`form-input ${formErrors.officeNumber1 ? 'form-input-error' : ''}`}
                        />
                        {formErrors.officeNumber1 && (
                          <p className="form-error">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.officeNumber1}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="officeComplement1">Complemento</Label>
                        <Input
                          id="officeComplement1"
                          name="officeComplement1"
                          value={formData.officeComplement1}
                          onChange={handleChange}
                          placeholder="Sala, Apto, Bloco, etc."
                          disabled={isLoading}
                          className="form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="officeNeighborhood1">Bairro<span className="text-red-500 ml-1">*</span></Label>
                        <Input
                          id="officeNeighborhood1"
                          name="officeNeighborhood1"
                          value={formData.officeNeighborhood1}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className={`form-input ${formErrors.officeNeighborhood1 ? 'form-input-error' : ''}`}
                        />
                        {formErrors.officeNeighborhood1 && (
                          <p className="form-error">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.officeNeighborhood1}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="officeCity1">Cidade<span className="text-red-500 ml-1">*</span></Label>
                        <Input
                          id="officeCity1"
                          name="officeCity1"
                          value={formData.officeCity1}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className={`form-input ${formErrors.officeCity1 ? 'form-input-error' : ''}`}
                        />
                        {formErrors.officeCity1 && (
                          <p className="form-error">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.officeCity1}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="officeState1">Estado<span className="text-red-500 ml-1">*</span></Label>
                        <Select
                          value={formData.officeState1}
                          onValueChange={(value) => {
                            setFormData(prev => ({ ...prev, officeState1: value }));
                            if (formErrors.officeState1) {
                              setFormErrors(prev => ({ ...prev, officeState1: "" }));
                            }
                          }}
                          disabled={isLoading}
                        >
                          <SelectTrigger 
                            id="officeState1" 
                            className={`form-input ${formErrors.officeState1 ? 'form-input-error' : ''}`}
                          >
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto z-50">
                            {brazilianStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.officeState1 && (
                          <p className="form-error">
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formErrors.officeState1}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consultório 2 */}
                  <div className="form-section mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="form-section-title mb-0">Consultório 2 (Opcional)</h3>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={showSecondOffice}
                          onCheckedChange={setShowSecondOffice}
                          disabled={isLoading}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <Label className="text-sm font-medium">Adicionar segundo endereço</Label>
                      </div>
                    </div>
                    
                    {showSecondOffice && (
                      <div className="form-grid">
                        <div className="space-y-2">
                          <Label htmlFor="officeCEP2">CEP</Label>
                          <InputMask
                            mask="99999-999"
                            value={formData.officeCEP2}
                            onChange={handleCEPChange}
                            disabled={isLoading}
                          >
                            {(inputProps: any) => (
                              <Input
                                {...inputProps}
                                id="officeCEP2"
                                name="officeCEP2"
                                placeholder="00000-000"
                                disabled={isLoading}
                                className={`form-input ${formErrors.officeCEP2 ? 'form-input-error' : ''}`}
                              />
                            )}
                          </InputMask>
                          {formErrors.officeCEP2 && (
                            <p className="form-error">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formErrors.officeCEP2}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="officeStreet2">Rua</Label>
                          <Input
                            id="officeStreet2"
                            name="officeStreet2"
                            value={formData.officeStreet2}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={`form-input ${formErrors.officeStreet2 ? 'form-input-error' : ''}`}
                          />
                          {formErrors.officeStreet2 && (
                            <p className="form-error">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formErrors.officeStreet2}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="officeNumber2">Número</Label>
                          <Input
                            id="officeNumber2"
                            name="officeNumber2"
                            value={formData.officeNumber2}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={`form-input ${formErrors.officeNumber2 ? 'form-input-error' : ''}`}
                          />
                          {formErrors.officeNumber2 && (
                            <p className="form-error">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formErrors.officeNumber2}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="officeComplement2">Complemento</Label>
                          <Input
                            id="officeComplement2"
                            name="officeComplement2"
                            value={formData.officeComplement2}
                            onChange={handleChange}
                            placeholder="Sala, Apto, Bloco, etc."
                            disabled={isLoading}
                            className="form-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="officeNeighborhood2">Bairro</Label>
                          <Input
                            id="officeNeighborhood2"
                            name="officeNeighborhood2"
                            value={formData.officeNeighborhood2}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={`form-input ${formErrors.officeNeighborhood2 ? 'form-input-error' : ''}`}
                          />
                          {formErrors.officeNeighborhood2 && (
                            <p className="form-error">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formErrors.officeNeighborhood2}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="officeCity2">Cidade</Label>
                          <Input
                            id="officeCity2"
                            name="officeCity2"
                            value={formData.officeCity2}
                            onChange={handleChange}
                            disabled={isLoading}
                            className={`form-input ${formErrors.officeCity2 ? 'form-input-error' : ''}`}
                          />
                          {formErrors.officeCity2 && (
                            <p className="form-error">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formErrors.officeCity2}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="officeState2">Estado</Label>
                          <Select
                            value={formData.officeState2}
                            onValueChange={(value) => {
                              setFormData(prev => ({ ...prev, officeState2: value }));
                              if (formErrors.officeState2) {
                                setFormErrors(prev => ({ ...prev, officeState2: "" }));
                              }
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger 
                              id="officeState2" 
                              className={`form-input ${formErrors.officeState2 ? 'form-input-error' : ''}`}
                            >
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto z-50">
                              {brazilianStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.officeState2 && (
                            <p className="form-error">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formErrors.officeState2}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Etapa 4: Informações de Atendimento */}
              {step === 4 && (
                <div className="form-section">
                  <div className="form-grid">
                    <div className="space-y-6">
                      {/* Especialidades */}
                      <div className="space-y-4">
                        <h3 className="form-section-title">Especialidades</h3>
                        <div className="space-y-2">
                          <Label htmlFor="specialty1" className="form-label">
                            Especialidade Principal<span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Select
                            value={formData.specialty1}
                            onValueChange={(value) => {
                              setFormData(prev => ({ ...prev, specialty1: value }));
                              if (formErrors.specialty1) {
                                setFormErrors(prev => ({ ...prev, specialty1: "" }));
                              }
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger id="specialty1">
                              <SelectValue placeholder="Selecione a especialidade" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto z-50">
                              {specialtiesList.map((spec) => (
                                <SelectItem key={spec.id} value={spec.name}>
                                  {spec.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.specialty1 && (
                            <p className="form-error">{formErrors.specialty1}</p>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="form-section-title mb-0">Segunda Especialidade (Opcional)</h3>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={showSecondSpecialty}
                                onCheckedChange={(checked) => {
                                  setShowSecondSpecialty(checked);
                                  if (!checked) {
                                    setFormData(prev => ({ ...prev, specialty2: "" }));
                                  }
                                }}
                                disabled={isLoading}
                              />
                              <Label className="text-sm font-medium">Adicionar segunda especialidade</Label>
                            </div>
                          </div>
                          
                          {showSecondSpecialty && (
                            <div className="space-y-2">
                              <Label htmlFor="specialty2" className="form-label">Segunda Especialidade</Label>
                              <Select
                                value={formData.specialty2}
                                onValueChange={(value) => {
                                  setFormData(prev => ({ ...prev, specialty2: value }));
                                  if (formErrors.specialty2) {
                                    setFormErrors(prev => ({ ...prev, specialty2: "" }));
                                  }
                                }}
                                disabled={isLoading}
                              >
                                <SelectTrigger id="specialty2">
                                  <SelectValue placeholder="Selecione a segunda especialidade" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto z-50">
                                  {specialtiesList.map((spec) => (
                                    <SelectItem key={spec.id} value={spec.name}>
                                      {spec.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {formErrors.specialty2 && (
                                <p className="form-error">{formErrors.specialty2}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Convênios */}
                      <div className="space-y-4">
                        <h3 className="form-section-title">Convênios</h3>
                        <div className="space-y-2">
                          <Label className="form-label">Atende Convênio?</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={formData.acceptsInsurance}
                              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptsInsurance: checked, insuranceNames: checked ? prev.insuranceNames : [] }))}
                              disabled={isLoading}
                            />
                            <Label>{formData.acceptsInsurance ? 'Sim' : 'Não'}</Label>
                          </div>
                        </div>
                        {formData.acceptsInsurance && (
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="form-label">Convênios Atendidos<span className="text-red-500 ml-1">*</span></Label>
                              <div className="space-y-2">
                                {formData.insuranceNames.map((insurance, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <Input
                                      value={insurance}
                                      onChange={(e) => {
                                        const newInsuranceNames = [...formData.insuranceNames];
                                        newInsuranceNames[index] = e.target.value;
                                        setFormData(prev => ({ ...prev, insuranceNames: newInsuranceNames }));
                                        if (formErrors.insuranceNames) {
                                          setFormErrors(prev => ({ ...prev, insuranceNames: "" }));
                                        }
                                      }}
                                      placeholder="Digite o nome do convênio"
                                      className={`form-input ${formErrors.insuranceNames ? 'form-input-error' : ''}`}
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        const newInsuranceNames = formData.insuranceNames.filter((_, i) => i !== index);
                                        setFormData(prev => ({ ...prev, insuranceNames: newInsuranceNames }));
                                      }}
                                      disabled={isLoading}
                                    >
                                      Remover
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, insuranceNames: [...prev.insuranceNames, ""] }));
                                  }}
                                  disabled={isLoading}
                                  className="w-full"
                                >
                                  Adicionar Convênio
                                </Button>
                              </div>
                              {formErrors.insuranceNames && (
                                <p className="form-error">
                                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {formErrors.insuranceNames}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 5: Redes Sociais e Canais Digitais */}
              {step === 5 && (
                <div className="form-section">
                  <div className="form-grid">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="form-label">Instagram Profissional</Label>
                      <Input
                        id="instagram"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        placeholder="@seuinstagram"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="form-label">Facebook Profissional</Label>
                      <Input
                        id="facebook"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleChange}
                        placeholder="facebook.com/seufacebook"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website" className="form-label">Site do Consultório/Clínica</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="www.seusite.com.br"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="form-label">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="linkedin.com/in/seulinkedin"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram" className="form-label">Telegram</Label>
                      <Input
                        id="telegram"
                        name="telegram"
                        value={formData.telegram}
                        onChange={handleChange}
                        placeholder="@seutelegram"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktok" className="form-label">TikTok</Label>
                      <Input
                        id="tiktok"
                        name="tiktok"
                        value={formData.tiktok}
                        onChange={handleChange}
                        placeholder="@seutiktok"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Etapa 6: Documentos e Finalização */}
              {step === 6 && (
                <div className="form-section">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="croFile" className="form-label">Upload de Arquivo do CRO<span className="text-red-500 ml-1">*</span></Label>
                      <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <input
                          type="file"
                          id="croFile"
                          name="croFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isLoading}
                        />
                        <label htmlFor="croFile" className="cursor-pointer">
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            {formData.croFile 
                              ? `Arquivo selecionado: ${formData.croFile.name}`
                              : "Clique para fazer upload do seu CRO (PDF ou JPG)"}
                          </p>
                        </label>
                        {formData.croFile && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={handleRemoveFile}
                            disabled={isLoading}
                          >
                            Remover arquivo
                          </Button>
                        )}
                      </div>
                      {formErrors.croFile && (
                        <p className="form-error">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formErrors.croFile}
                        </p>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="form-section-title">Autorização de Divulgação</h3>
                        <Textarea
                          value="Na qualidade de titular dos dados pessoais, AUTORIZO, de forma expressa e inequívoca, a ACDC a divulgar minhas informações cadastrais conforme eu preenchi, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)."
                          readOnly
                          className="h-24"
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.dataSharingConsent}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dataSharingConsent: checked }))}
                            disabled={isLoading}
                          />
                          <Label>Aceito a autorização de divulgação</Label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="form-section-title">Regras de Participação no Indicador Profissional da ACDC</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, showRules: !prev.showRules }))}
                            className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <span className="font-medium">Clique para visualizar as regras de participação</span>
                            <svg
                              className={`w-5 h-5 transform transition-transform ${formData.showRules ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {formData.showRules && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 max-h-96 overflow-y-auto">
                              <div className="space-y-4 text-sm">
                                <div>
                                  <h4 className="font-semibold">1. Elegibilidade</h4>
                                  <p>1.1. O indicador profissional é um benefício exclusivo para associados ativos da ACDC.</p>
                                  <p>1.2. O associado deve estar em dia com suas obrigações financeiras junto à ACDC.</p>
                                  <p>1.3. É necessário ter registro profissional válido e ativo no Conselho Regional de Odontologia.</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">2. Gratuidade</h4>
                                  <p>2.1. A participação no indicador profissional é um benefício totalmente gratuito.</p>
                                  <p>2.2. A gratuidade é mantida enquanto o profissional permanecer como associado ativo da ACDC.</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">3. Manutenção no Indicador</h4>
                                  <p>3.1. O associado deve manter seus dados cadastrais atualizados junto à ACDC.</p>
                                  <p>3.2. O associado deve cumprir o Código de Ética Odontológica e o Estatuto Social da ACDC.</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">4. Informações no Indicador</h4>
                                  <p>4.1. Serão divulgados apenas dados profissionais relevantes e pré estabelecidos no formulário próprio.</p>
                                  <p>4.2. É responsabilidade do associado garantir a veracidade das informações fornecidas.</p>
                                  <p>4.3. Atualizações nas informações devem ser solicitadas formalmente à ACDC.</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">5. Utilização do Indicador</h4>
                                  <p>5.1. O associado pode mencionar sua participação no indicador em suas comunicações profissionais.</p>
                                  <p>5.2. É proibido o uso indevido ou enganoso da participação no indicador para fins publicitários.</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">6. Suspensão ou Exclusão</h4>
                                  <p>6.1. A ACDC reserva-se o direito de suspender ou excluir o associado do indicador em caso de:</p>
                                  <ul className="list-disc list-inside ml-4">
                                    <li>Desligamento ou inadimplência junto à ACDC</li>
                                    <li>Violation do Código de Ética Odontológica</li>
                                    <li>Fornecimento de informações falsas</li>
                                    <li>Uso indevido do indicador profissional</li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-semibold">7. Renovação</h4>
                                  <p>7.1. A permanência no indicador é renovada automaticamente a cada ano, desde que mantida a associação ativa.</p>
                                  <p>7.2. A ACDC pode solicitar uma confirmação anual de interesse na continuidade da participação.</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">8. Responsabilidade Legal</h4>
                                  <p>8.1. A ACDC não se responsabiliza por eventuais conflitos entre profissionais e pacientes.</p>
                                  <p>8.2. O indicador é uma ferramenta de referência, não constituindo garantia ou endosso direto da ACDC.</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">9. Alterações nas Regras</h4>
                                  <p>9.1. A ACDC reserva-se o direito de alterar estas regras, com comunicação prévia aos associados.</p>
                                  <p>9.2. É responsabilidade do associado manter-se informado sobre eventuais atualizações nas regras.</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">10. Aceitação das Regras</h4>
                                  <p>10.1. A participação no indicador profissional implica na aceitação integral destas regras.</p>
                                  <p>10.2. Dúvidas ou casos omissos serão resolvidos pela diretoria da ACDC.</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.rulesAcceptance}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rulesAcceptance: checked }))}
                            disabled={isLoading}
                          />
                          <Label>Aceito as regras de participação</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between w-full">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack} 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700 hover:scale-105 hover:shadow-lg transition-all duration-300 font-medium px-6"
                  >
                    Voltar
                  </Button>
                )}
                {step < 6 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext} 
                    className="ml-auto bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:from-emerald-600 hover:to-emerald-800 hover:scale-105 hover:shadow-lg transition-all duration-300 font-medium px-8" 
                    disabled={isLoading}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="ml-auto bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:from-emerald-600 hover:to-emerald-800 hover:scale-105 hover:shadow-lg transition-all duration-300 font-medium px-8" 
                    disabled={isLoading || !formData.dataSharingConsent || !formData.rulesAcceptance || uploadingFile}
                  >
                    {uploadingFile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando arquivo...
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : !formData.dataSharingConsent || !formData.rulesAcceptance ? (
                      'Aceite os termos para continuar'
                    ) : (
                      'Cadastrar'
                    )}
                  </Button>
                )}
              </div>
              <p className="text-sm text-center text-gray-500 dark:text-gray-300">
                Já possui uma conta?{" "}
                <Link to="/login" className="text-brand dark:text-emerald-400 hover:underline font-medium">
                  Faça login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
