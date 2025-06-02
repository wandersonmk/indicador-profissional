create table public.professional_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text not null,
  phone_number text,
  birth_date date,
  cro_number text,
  cro_state text,
  cro_file_url text,
  specialty1 text not null,
  specialty2 text,
  mobile_phone text,
  mobile_phone2 text,
  landline_phone text,
  whatsapp_phone text,
  city text,
  neighborhood text,
  office_cep1 text,
  office_street1 text,
  office_number1 text,
  office_complement1 text,
  office_neighborhood1 text,
  office_city1 text,
  office_state1 text,
  office_cep2 text,
  office_street2 text,
  office_number2 text,
  office_complement2 text,
  office_neighborhood2 text,
  office_city2 text,
  office_state2 text,
  accepts_insurance boolean default false,
  insurance_names text[],
  instagram text,
  facebook text,
  website text,
  linkedin text,
  telegram text,
  tiktok text,
  data_sharing_consent boolean default false,
  rules_acceptance boolean default false,
  approval_status text check (approval_status in ('pending', 'approved', 'rejected')) default 'pending',
  review_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.professional_profiles enable row level security;

-- Criar políticas de segurança
create policy "Profissionais podem ver seus próprios perfis"
  on public.professional_profiles for select
  using ( auth.uid() = id );

create policy "Profissionais podem atualizar seus próprios perfis"
  on public.professional_profiles for update
  using ( auth.uid() = id );

create policy "Admins podem ver todos os perfis"
  on public.professional_profiles for select
  using ( exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  ));

create policy "Admins podem atualizar todos os perfis"
  on public.professional_profiles for update
  using ( exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  ));

-- Trigger para atualizar o updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.professional_profiles
  for each row
  execute procedure public.handle_updated_at();

-- Função para criar perfil profissional automaticamente após registro
create or replace function public.handle_new_professional()
returns trigger as $$
begin
  insert into public.professional_profiles (
    id,
    full_name,
    approval_status
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'pending'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para criar perfil profissional automaticamente
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row
--   execute procedure public.handle_new_professional(); 