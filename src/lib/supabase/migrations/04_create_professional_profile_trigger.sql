-- Função para criar perfil profissional quando um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_professional()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir na tabela profiles
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'professional',
    NOW(),
    NOW()
  );

  -- Inserir na tabela professional_profiles
  INSERT INTO public.professional_profiles (
    id,
    full_name,
    approval_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'pending',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_professional(); 