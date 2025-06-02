import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    // Aqui você pode implementar o envio real do email
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand/10 to-emerald-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold text-brand dark:text-emerald-400 text-center">Recuperar Senha</CardTitle>
            <CardDescription className="text-center dark:text-gray-300">
              Informe seu email para receber instruções de recuperação.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {sent ? (
                <div className="text-green-600 text-center font-medium">Se o email existir, as instruções foram enviadas!</div>
              ) : (
                <>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <Button className="w-full mt-4 font-bold transition-all duration-300" style={{background:'var(--brand-primary)',color:'#fff',border:'none'}}>
                    Enviar instruções
                  </Button>
                </>
              )}
              <Button
                asChild
                variant="outline"
                className="w-full font-bold transition-all duration-300 mt-2"
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
                <Link to="/login">Voltar para o login</Link>
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
} 