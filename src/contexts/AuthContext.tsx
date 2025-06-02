import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        console.log('[DEBUG] Checking current session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[DEBUG] Session check error:', error);
          throw error;
        }
        
        console.log('[DEBUG] Current session:', session);
        
        if (session) {
          console.log('[DEBUG] Fetching profile for session user:', session.user.id);
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id);
          if (profileError) {
            console.error('[DEBUG] Profile fetch error:', profileError);
            throw profileError;
          }
          const profile = profiles && profiles.length > 0 ? profiles[0] : null;
          console.log('[DEBUG] Profile fetched:', profile);
          if (profile) {
            setUser(profile);
          }
        }
      } catch (error) {
        console.error('[DEBUG] Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[DEBUG] Auth state changed:', event, session);
      
      if (session) {
        console.log('[DEBUG] Fetching profile for auth state change:', session.user.id);
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id);
        if (profileError) {
          console.error('[DEBUG] Profile fetch error:', profileError);
          throw profileError;
        }
        const profile = profiles && profiles.length > 0 ? profiles[0] : null;
        console.log('[DEBUG] Profile fetched:', profile);
        if (profile) {
          setUser(profile);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id);
        if (profileError) throw profileError;
        const profile = profiles && profiles.length > 0 ? profiles[0] : null;
        if (profile) {
          if (profile.role === 'professional') {
            // Verifica aprovação e bloqueio na pending_approvals
            const { data: approvals, error: approvalError } = await supabase
              .from('pending_approvals')
              .select('*')
              .eq('professional_id', data.user.id)
              .order('created_at', { ascending: false });
            if (approvalError) throw approvalError;
            const approval = approvals && approvals.length > 0 ? approvals[0] : null;
            console.log('[DEBUG] pending_approvals:', approval);
            if (!approval || approval.status !== 'approved' || approval.is_blocked) {
              setUser(null);
              await supabase.auth.signOut();
              localStorage.setItem('loginError', 'Seu cadastro ainda não foi aprovado ou está bloqueado.');
              window.location.href = '/login';
              return false;
            }
          }
          setUser(profile);
          toast({
            title: 'Login bem-sucedido',
            description: `Bem-vindo, ${profile.email}!`,
          });
          // Redirecionamento conforme role (deixe para o componente que consome o contexto)
          return true;
        } else {
          setUser(null);
          toast({
            title: 'Perfil não encontrado',
            description: 'Não foi possível localizar o perfil deste usuário. Contate o administrador.',
            variant: 'destructive',
          });
        }
      }
      return false;
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Falha no login',
        description: authError.message || 'Email ou senha incorretos.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: 'Cadastro realizado',
          description: 'Por favor, verifique seu email para confirmar o cadastro.',
        });
        return true;
      }
      return false;
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: 'Falha no cadastro',
        description: authError.message || 'Erro ao criar conta.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast({
        title: 'Logout realizado',
        description: 'Você saiu do sistema com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao tentar sair do sistema.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
