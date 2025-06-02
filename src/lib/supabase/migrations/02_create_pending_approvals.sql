-- Criar tabela de aprovações pendentes
create table public.pending_approvals (
  id uuid default gen_random_uuid() primary key,
  professional_id uuid references public.professional_profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  review_notes text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.pending_approvals enable row level security;

-- Políticas de acesso (temporariamente permitindo acesso total)
create policy "Permitir acesso total para todos"
  on public.pending_approvals
  for all
  using (true)
  with check (true);

-- Trigger para atualizar o updated_at
create trigger handle_updated_at
  before update on public.pending_approvals
  for each row
  execute procedure public.handle_updated_at();

-- Trigger para atualizar o status do profissional quando aprovado/rejeitado
create or replace function public.handle_approval_status()
returns trigger as $$
begin
  if new.status != old.status then
    -- Atualiza o status no perfil do profissional
    update public.professional_profiles
    set 
      approval_status = new.status,
      review_notes = new.review_notes,
      updated_at = now()
    where id = new.professional_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_approval_status_change
  after update on public.pending_approvals
  for each row
  execute procedure public.handle_approval_status(); 