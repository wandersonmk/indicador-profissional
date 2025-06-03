import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Iniciando processo de recuperação de senha para:', email);
      
      const redirectUrl = `${window.location.origin}/redefinirSenha`;
      console.log('URL de redirecionamento:', redirectUrl);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        console.error('Erro detalhado:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      console.log('Email enviado com sucesso');
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para as instruções de recuperação de senha.",
      });
    } catch (error: any) {
      console.error('Erro completo ao enviar email de recuperação:', error);
      
      let errorMessage = "Não foi possível enviar o email de recuperação.";
      
      if (error.message) {
        if (error.message.includes('Email not confirmed')) {
          errorMessage = "Este email ainda não foi confirmado. Por favor, verifique sua caixa de entrada.";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "O email informado é inválido.";
        } else if (error.message.includes('rate limit')) {
          errorMessage = "Muitas tentativas. Por favor, aguarde alguns minutos e tente novamente.";
        }
      }

      toast({
        title: "Erro ao enviar email",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-emerald-500 bg-clip-text text-transparent">
              Recuperar Senha
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Digite seu email para receber as instruções de recuperação
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-brand to-emerald-500 hover:from-brand/90 hover:to-emerald-500/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar instruções'
              )}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-brand hover:text-brand/80 transition-colors"
              >
                Voltar para o login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 