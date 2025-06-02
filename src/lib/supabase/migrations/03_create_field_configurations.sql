-- Criar tabela de configurações de campos
create table public.field_configurations (
  id uuid default gen_random_uuid() primary key,
  field_name text not null unique,
  display_name text not null,
  field_type text not null check (field_type in ('text', 'number', 'date', 'boolean', 'select', 'multiselect')),
  is_required boolean default false,
  is_visible boolean default true,
  options jsonb, -- Para campos do tipo select/multiselect
  validation_rules jsonb, -- Regras de validação específicas
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.field_configurations enable row level security;

-- Políticas de acesso (temporariamente permitindo acesso total)
create policy "Permitir acesso total para todos"
  on public.field_configurations
  for all
  using (true)
  with check (true);

-- Trigger para atualizar o updated_at
create trigger handle_updated_at
  before update on public.field_configurations
  for each row
  execute procedure public.handle_updated_at();

-- Inserir campos padrão
insert into public.field_configurations (
  field_name,
  display_name,
  field_type,
  is_required,
  is_visible,
  order_index
) values
  ('full_name', 'Nome Completo', 'text', true, true, 1),
  ('phone_number', 'Telefone', 'text', true, true, 2),
  ('birth_date', 'Data de Nascimento', 'date', false, true, 3),
  ('cro_number', 'Número do CRO', 'text', true, true, 4),
  ('cro_state', 'Estado do CRO', 'text', true, true, 5),
  ('specialty1', 'Especialidade Principal', 'text', true, true, 6),
  ('specialty2', 'Especialidade Secundária', 'text', false, true, 7),
  ('mobile_phone', 'Celular', 'text', false, true, 8),
  ('mobile_phone2', 'Celular 2', 'text', false, true, 9),
  ('landline_phone', 'Telefone Fixo', 'text', false, true, 10),
  ('whatsapp_phone', 'WhatsApp', 'text', false, true, 11),
  ('city', 'Cidade', 'text', false, true, 12),
  ('neighborhood', 'Bairro', 'text', false, true, 13),
  ('office_cep1', 'CEP do Consultório 1', 'text', false, true, 14),
  ('office_street1', 'Rua do Consultório 1', 'text', false, true, 15),
  ('office_number1', 'Número do Consultório 1', 'text', false, true, 16),
  ('office_complement1', 'Complemento do Consultório 1', 'text', false, true, 17),
  ('office_neighborhood1', 'Bairro do Consultório 1', 'text', false, true, 18),
  ('office_city1', 'Cidade do Consultório 1', 'text', false, true, 19),
  ('office_state1', 'Estado do Consultório 1', 'text', false, true, 20),
  ('office_cep2', 'CEP do Consultório 2', 'text', false, true, 21),
  ('office_street2', 'Rua do Consultório 2', 'text', false, true, 22),
  ('office_number2', 'Número do Consultório 2', 'text', false, true, 23),
  ('office_complement2', 'Complemento do Consultório 2', 'text', false, true, 24),
  ('office_neighborhood2', 'Bairro do Consultório 2', 'text', false, true, 25),
  ('office_city2', 'Cidade do Consultório 2', 'text', false, true, 26),
  ('office_state2', 'Estado do Consultório 2', 'text', false, true, 27),
  ('accepts_insurance', 'Aceita Convênios', 'boolean', false, true, 28),
  ('insurance_names', 'Convênios Aceitos', 'multiselect', false, true, 29),
  ('instagram', 'Instagram', 'text', false, true, 30),
  ('facebook', 'Facebook', 'text', false, true, 31),
  ('website', 'Website', 'text', false, true, 32),
  ('linkedin', 'LinkedIn', 'text', false, true, 33),
  ('telegram', 'Telegram', 'text', false, true, 34),
  ('tiktok', 'TikTok', 'text', false, true, 35),
  ('data_sharing_consent', 'Consentimento de Compartilhamento de Dados', 'boolean', true, true, 36),
  ('rules_acceptance', 'Aceite das Regras', 'boolean', true, true, 37); 