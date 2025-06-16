import { useEffect, useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Evita múltiplos envios
    setError("");
    setIsLoading(true);

    try {
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 30000); // 30 segundos
      });

      const result = await Promise.race([
        login(email, password),
        timeoutPromise
      ]) as boolean;

      if (result) {
        // Buscar perfil pelo id do usuário autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id) {
          try {
            const { data: profiles, error: profileError } = await Promise.race([
              supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id),
              timeoutPromise
            ]) as { data: any, error: any };

            if (profileError) throw profileError;
            const currentUser = profiles && profiles.length > 0 ? profiles[0] : null;
            if (currentUser) {
              if (currentUser.role === 'admin') {
                navigate('/admin');
                return;
              } else if (currentUser.role === 'professional') {
                navigate('/dashboard');
                return;
              }
            }
            setError('Não foi possível localizar o perfil deste usuário. O login não pôde ser concluído.');
            return;
          } catch (e) {
            setError('Não foi possível localizar o perfil deste usuário. O login não pôde ser concluído.');
            return;
          }
        } else {
          setError('Usuário autenticado, mas não foi possível obter o ID do usuário.');
          return;
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'Login timeout') {
        setError("O login demorou muito para responder. Por favor, tente novamente.");
      } else {
        setError("Ocorreu um erro durante o login. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const error = localStorage.getItem('loginError');
    if (error) {
      toast({
        title: 'Acesso não autorizado',
        description: error,
        variant: 'destructive',
      });
      localStorage.removeItem('loginError');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand/10 to-emerald-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-brand dark:text-emerald-400 text-center">Login</CardTitle>
            <CardDescription className="text-center dark:text-gray-300">
              Entre com suas credenciais para acessar o seu perfil
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-md text-sm text-center">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  disabled={isLoading}
                  className="focus:ring-2 focus:ring-brand dark:focus:ring-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <a
                    href="https://indicador-profissional.flutterflow.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand dark:text-emerald-400 hover:underline"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="focus:ring-2 focus:ring-brand dark:focus:ring-emerald-400 pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full font-bold transition-all duration-300"
                style={{
                  background: 'var(--brand-primary)',
                  color: '#fff',
                  border: 'none',
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgb(98,131,152)')}
                onMouseOut={e => (e.currentTarget.style.background = 'var(--brand-primary)')}
                disabled={isLoading}
                tabIndex={isLoading ? -1 : 0} // Impede foco durante loading
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full font-bold transition-all duration-300 mt-4"
                style={{
                  borderColor: 'var(--brand-primary)',
                  color: 'var(--brand-primary)',
                  background: '#fff',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgb(98,131,152)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.color = 'var(--brand-primary)';
                }}
              >
                <Link to="/register">Criar conta</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
