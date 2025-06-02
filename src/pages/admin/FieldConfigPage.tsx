import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, Plus, Save, Trash2, LogOut, User, MapPin, Settings } from 'lucide-react';
import { getFieldConfigs, updateFieldConfig, getAllSpecialties, addSpecialty, removeSpecialty, getAllCities, addCity, removeCity, fetchSpecialtiesFromDB, addSpecialtyToDB, removeSpecialtyFromDB } from '@/lib/data-service';
import { FieldConfig } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function FieldConfigPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [personalFields, setPersonalFields] = useState<FieldConfig[]>([]);
  const [addressFields, setAddressFields] = useState<FieldConfig[]>([]);
  const [specialtyFields, setSpecialtyFields] = useState<FieldConfig[]>([]);
  const [activeTab, setActiveTab] = useState<string>('personal');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldConfig | null>(null);
  const [specialtiesList, setSpecialtiesList] = useState<string[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCity, setNewCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  const brazilianStates = [
    "Acre (AC)",
    "Alagoas (AL)",
    "Amapá (AP)",
    "Amazonas (AM)",
    "Bahia (BA)",
    "Ceará (CE)",
    "Distrito Federal (DF)",
    "Espírito Santo (ES)",
    "Goiás (GO)",
    "Maranhão (MA)",
    "Mato Grosso (MT)",
    "Mato Grosso do Sul (MS)",
    "Minas Gerais (MG)",
    "Pará (PA)",
    "Paraíba (PB)",
    "Paraná (PR)",
    "Pernambuco (PE)",
    "Piauí (PI)",
    "Rio de Janeiro (RJ)",
    "Rio Grande do Norte (RN)",
    "Rio Grande do Sul (RS)",
    "Rondônia (RO)",
    "Roraima (RR)",
    "Santa Catarina (SC)",
    "São Paulo (SP)",
    "Sergipe (SE)",
    "Tocantins (TO)"
  ];

  useEffect(() => {
    loadFieldConfigs();
    loadSpecialties();
    loadCities();
  }, []);

  const loadFieldConfigs = () => {
    const configs = getFieldConfigs();
    setPersonalFields(configs.filter(f => f.category === 'personal').sort((a, b) => a.order - b.order));
    setAddressFields(configs.filter(f => f.category === 'address').sort((a, b) => a.order - b.order));
    setSpecialtyFields(configs.filter(f => f.category === 'specialty').sort((a, b) => a.order - b.order));
  };

  const loadSpecialties = async () => {
    setLoadingSpecialties(true);
    try {
      const data = await fetchSpecialtiesFromDB();
      setSpecialtiesList(data);
    } catch (e) {
      // Tratar erro
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const loadCities = () => {
    setCitiesList(getAllCities());
  };

  const handleToggleField = (field: FieldConfig, isActive: boolean) => {
    updateFieldConfig(field.id, { active: isActive });
    loadFieldConfigs();
    
    toast({
      title: isActive ? "Campo ativado" : "Campo desativado",
      description: `O campo ${field.label} foi ${isActive ? "ativado" : "desativado"} com sucesso.`,
    });
  };

  const handleToggleRequired = (field: FieldConfig, isRequired: boolean) => {
    updateFieldConfig(field.id, { required: isRequired });
    loadFieldConfigs();
    
    toast({
      title: isRequired ? "Campo marcado como obrigatório" : "Campo marcado como opcional",
      description: `O campo ${field.label} agora é ${isRequired ? "obrigatório" : "opcional"}.`,
    });
  };

  const handleMoveUp = (field: FieldConfig, fields: FieldConfig[]) => {
    const currentIndex = fields.findIndex(f => f.id === field.id);
    if (currentIndex > 0) {
      const prevField = fields[currentIndex - 1];
      updateFieldConfig(field.id, { order: prevField.order });
      updateFieldConfig(prevField.id, { order: field.order });
      loadFieldConfigs();
    }
  };

  const handleMoveDown = (field: FieldConfig, fields: FieldConfig[]) => {
    const currentIndex = fields.findIndex(f => f.id === field.id);
    if (currentIndex < fields.length - 1) {
      const nextField = fields[currentIndex + 1];
      updateFieldConfig(field.id, { order: nextField.order });
      updateFieldConfig(nextField.id, { order: field.order });
      loadFieldConfigs();
    }
  };

  const getFieldsForCurrentTab = () => {
    switch(activeTab) {
      case 'personal':
        return personalFields;
      case 'address':
        return addressFields;
      case 'specialty':
        return specialtyFields;
      default:
        return [];
    }
  };

  const openFieldDialog = (field: FieldConfig) => {
    setSelectedField(field);
    setDialogOpen(true);
  };
  
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'personal':
        return 'Dados Pessoais';
      case 'address':
        return 'Endereços';
      case 'specialty':
        return 'Campos Personalizados';
      default:
        return 'Campos';
    }
  };

  const handleAddSpecialty = async () => {
    if (!newSpecialty.trim()) return;
    setIsSubmitting(true);
    try {
      await addSpecialtyToDB(newSpecialty.trim());
      setNewSpecialty('');
      await loadSpecialties();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSpecialty = async (id) => {
    setIsSubmitting(true);
    try {
      await removeSpecialtyFromDB(id);
      await loadSpecialties();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCity = () => {
    if (!newCity.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, insira uma cidade válida",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const added = addCity(newCity);
      
      if (added) {
        loadCities();
        setNewCity('');
        toast({
          title: "Cidade adicionada",
          description: `A cidade "${newCity}" foi adicionada com sucesso.`
        });
      } else {
        toast({
          title: "Cidade já existe",
          description: `A cidade "${newCity}" já existe na lista.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar cidade:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Ocorreu um erro ao adicionar a cidade.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCity = (city: string) => {
    try {
      const removed = removeCity(city);
      
      if (removed) {
        loadCities();
        toast({
          title: "Cidade removida",
          description: `A cidade "${city}" foi removida com sucesso.`
        });
      }
    } catch (error) {
      console.error("Erro ao remover cidade:", error);
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao remover a cidade.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 min-h-screen">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold">
              Configurações de campos
            </h1>
            <Button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-brand to-blue-500 text-white border-0 shadow transition-all duration-500 ease-in-out hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
          <Card className="mb-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-brand dark:text-blue-400">Configurações de Formulário</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure quais campos serão exigidos aos profissionais durante e após o cadastro. 
                Você pode marcar campos como obrigatórios, opcionais ou desativá-los completamente.
              </p>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="hidden md:grid md:grid-cols-3 mb-6 bg-gradient-to-r from-brand/10 to-blue-100 dark:from-brand/20 dark:to-blue-900/10 rounded-xl p-1">
                  <TabsTrigger 
                    value="personal" 
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  >
                    Dados Pessoais
                  </TabsTrigger>
                  <TabsTrigger 
                    value="address" 
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  >
                    Endereços
                  </TabsTrigger>
                  <TabsTrigger 
                    value="specialty" 
                    className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-blue-500 data-[state=active]:text-white"
                  >
                    Campos Personalizados
                  </TabsTrigger>
                </TabsList>
                
                {/* Versão Mobile */}
                <TabsList className="md:hidden flex flex-row justify-between overflow-x-auto mb-6 bg-gradient-to-r from-brand/10 to-blue-100 dark:from-brand/20 dark:to-blue-900/10 rounded-xl p-3">
                  <TabsTrigger 
                    value="personal" 
                    className="w-[50px] h-[50px] rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-blue-500 data-[state=active]:text-white flex items-center justify-center"
                    title="Dados Pessoais"
                  >
                    <User className="w-5 h-5" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="address" 
                    className="w-[50px] h-[50px] rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-blue-500 data-[state=active]:text-white flex items-center justify-center"
                    title="Endereços"
                  >
                    <MapPin className="w-5 h-5" />
                  </TabsTrigger>
                  <TabsTrigger 
                    value="specialty" 
                    className="w-[50px] h-[50px] rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand data-[state=active]:to-blue-500 data-[state=active]:text-white flex items-center justify-center"
                    title="Campos Personalizados"
                  >
                    <Settings className="w-5 h-5" />
                  </TabsTrigger>
                </TabsList>
                
                {['personal', 'address'].map((category) => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ordem</TableHead>
                          <TableHead>Campo</TableHead>
                          <TableHead className="w-[120px]">Ativo</TableHead>
                          <TableHead className="w-[120px]">Obrigatório</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFieldsForCurrentTab().map((field) => (
                          <TableRow key={field.id}>
                            <TableCell className="w-[120px]">
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="w-8 h-8"
                                  onClick={() => handleMoveUp(field, getFieldsForCurrentTab())}
                                  disabled={field === getFieldsForCurrentTab()[0]}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="w-8 h-8"
                                  onClick={() => handleMoveDown(field, getFieldsForCurrentTab())}
                                  disabled={field === getFieldsForCurrentTab()[getFieldsForCurrentTab().length - 1]}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{field.label}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={field.active} 
                                onCheckedChange={(checked) => handleToggleField(field, checked)}
                                disabled={field.name === 'fullName' || field.name === 'email' || field.name === 'croFile'}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch 
                                checked={field.required} 
                                onCheckedChange={(checked) => handleToggleRequired(field, checked)}
                                disabled={!field.active || field.name === 'fullName' || field.name === 'email' || field.name === 'croFile'}
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openFieldDialog(field)}
                              >
                                Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                ))}
                
                {/* Aba de Especialidades */}
                <TabsContent value="specialty" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Campos de Especialidades</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ordem</TableHead>
                          <TableHead>Campo</TableHead>
                          <TableHead className="w-[120px]">Ativo</TableHead>
                          <TableHead className="w-[120px]">Obrigatório</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {specialtyFields.map((field) => (
                          <TableRow key={field.id}>
                            <TableCell className="w-[120px]">
                              <div className="flex space-x-1">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="w-8 h-8"
                                  onClick={() => handleMoveUp(field, specialtyFields)}
                                  disabled={field === specialtyFields[0]}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="w-8 h-8"
                                  onClick={() => handleMoveDown(field, specialtyFields)}
                                  disabled={field === specialtyFields[specialtyFields.length - 1]}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{field.label}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={field.active} 
                                onCheckedChange={(checked) => handleToggleField(field, checked)}
                              />
                            </TableCell>
                            <TableCell>
                              <Switch 
                                checked={field.required} 
                                onCheckedChange={(checked) => handleToggleRequired(field, checked)}
                                disabled={!field.active}
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openFieldDialog(field)}
                              >
                                Detalhes
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Gerenciar Especialidades</h3>
                    <div className="flex gap-2 mb-6">
                      <div className="flex-1">
                        <Input
                          placeholder="Digite nova especialidade"
                          value={newSpecialty}
                          onChange={(e) => setNewSpecialty(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleAddSpecialty} 
                        disabled={isSubmitting || !newSpecialty.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-2">Especialidades Disponíveis</h4>
                      <div className="flex flex-wrap gap-2">
                        {loadingSpecialties ? (
                          <p>Carregando...</p>
                        ) : (
                          specialtiesList.map((specialty) => (
                            <Badge 
                              key={specialty.id}
                              className="flex items-center gap-1 py-1.5 px-2"
                              variant="secondary"
                            >
                              {specialty.name}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                                onClick={() => handleRemoveSpecialty(specialty.id)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))
                        )}
                        
                        {specialtiesList.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            Nenhuma especialidade cadastrada.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Estados Disponíveis</h3>
                    <div className="bg-slate-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-2">Estados do Brasil</h4>
                      <div className="flex flex-wrap gap-2">
                        {brazilianStates.map((state) => (
                          <Badge 
                            key={state}
                            className="flex items-center gap-1 py-1.5 px-2"
                            variant="secondary"
                          >
                            {state}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 mt-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-brand dark:text-blue-400">Campos Obrigatórios no Cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Estes campos serão sempre obrigatórios no cadastro inicial, independentemente das configurações acima:
              </p>
              
              <ul className="list-disc list-inside space-y-1">
                <li>Nome Completo</li>
                <li>Email</li>
                <li>Senha</li>
                <li>Documento CRO (upload)</li>
              </ul>
            </CardContent>
          </Card>
          
          {selectedField && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Detalhes do Campo</DialogTitle>
                  <DialogDescription>
                    Configurações detalhadas para o campo {selectedField.label}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome Técnico</Label>
                    <p className="text-sm text-muted-foreground">{selectedField.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rótulo Exibido</Label>
                    <p>{selectedField.label}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <p>{getCategoryTitle(selectedField.category)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <p>
                      {selectedField.active ? (
                        <span className="text-green-600 font-medium">Ativo</span>
                      ) : (
                        <span className="text-red-600 font-medium">Inativo</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Obrigatoriedade</Label>
                    <p>
                      {selectedField.required ? (
                        <span className="text-blue-600 font-medium">Obrigatório</span>
                      ) : (
                        <span className="text-gray-600 font-medium">Opcional</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </main>
    </div>
  );
}
