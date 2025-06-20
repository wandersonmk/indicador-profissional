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
        let { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[DEBUG] Session check error:', error);
          throw error;
        }
        
        console.log('[DEBUG] Current session:', session);
        
        if (session) {
          // Verificar se a sessão está expirada
          const expiresAt = new Date(session.expires_at! * 1000);
          const now = new Date();
          
          if (expiresAt <= now) {
            console.log('[DEBUG] Session expired, refreshing...');
            const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError) {
              console.error('[DEBUG] Session refresh error:', refreshError);
              throw refreshError;
            }
            
            if (newSession) {
              session = newSession;
            } else {
              throw new Error('Failed to refresh session');
            }
          }
          
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
            // Persistir dados do usuário
            localStorage.setItem('user', JSON.stringify(profile));
          }
        }
      } catch (error) {
        console.error('[DEBUG] Session check error:', error);
        // Limpar dados em caso de erro
        localStorage.removeItem('user');
        setUser(null);
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
          // Persistir dados do usuário
          localStorage.setItem('user', JSON.stringify(profile));
        }
      } else {
        setUser(null);
        // Limpar dados em caso de logout
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    // Limpa cache e sessão antes de tentar novo login
    localStorage.clear();
    sessionStorage.clear();
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // Add timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Login timeout')), 15000); // Aumentado para 15 segundos
        });

        // Login with timeout protection
        const { data, error } = await Promise.race([
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          timeoutPromise
        ]) as { data: any, error: any };

        if (error) throw error;

        if (data.user) {
          // Fetch profile with timeout protection
          const { data: profiles, error: profileError } = await Promise.race([
            supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id),
            timeoutPromise
          ]) as { data: any, error: any };

          if (profileError) throw profileError;
          const profile = profiles && profiles.length > 0 ? profiles[0] : null;

          if (profile) {
            if (profile.role === 'professional') {
              // Check approval status with timeout protection
              const { data: approvals, error: approvalError } = await Promise.race([
                supabase
                  .from('pending_approvals')
                  .select('*')
                  .eq('professional_id', data.user.id)
                  .order('created_at', { ascending: false }),
                timeoutPromise
              ]) as { data: any, error: any };

              if (approvalError) throw approvalError;
              const approval = approvals && approvals.length > 0 ? approvals[0] : null;

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
            return true;
          }
          setUser(null);
          toast({
            title: 'Perfil não encontrado',
            description: 'Não foi possível localizar o perfil deste usuário. Contate o administrador.',
            variant: 'destructive',
          });
        }
        return false;
      } catch (error) {
        const authError = error as AuthError;
        console.error(`Login error (attempt ${retryCount + 1}/${maxRetries}):`, authError);
        
        retryCount++;
        
        if (retryCount === maxRetries) {
          // Handle timeout specifically
          if (authError.message === 'Login timeout') {
            toast({
              title: 'Tempo esgotado',
              description: 'O login demorou muito para responder. Por favor, tente novamente.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Falha no login',
              description: authError.message || 'Email ou senha incorretos.',
              variant: 'destructive',
            });
          }
          return false;
        }
        
        // Espera um tempo antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    return false;
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
      // Limpa todos os dados de sessão e cache
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      toast({
        title: 'Logout realizado',
        description: 'Você saiu do sistema com sucesso.',
      });
      // Pequeno delay para garantir sincronização
      await new Promise(resolve => setTimeout(resolve, 1000));
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
