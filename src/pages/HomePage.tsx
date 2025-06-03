import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand to-brand-light dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <img 
            src="https://xxoqkjlbvjzjreyfmete.supabase.co/storage/v1/object/public/imagens//logo_acdc_sem_fundo_pequeno.png" 
            alt="Logo ACDC" 
            className="w-48 h-48 mb-8 object-contain"
          />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
              Encontre Profissionais de Odontologia de Excelência
            </h1>
            <p className="text-xl text-white/90 mb-8">
              A ACDC (Associação dos Cirurgiões-dentistas de Campinas) é uma plataforma dedicada a conectar pacientes com Cirurgiões-dentistas altamente qualificados e certificados.
            </p>
            <p className="text-lg text-white/90 mb-8">
              Valorizamos a ética e a excelência profissional, garantindo que você tenha acesso aos melhores cuidados odontológicos por meio de um seleto grupo de profissionais associados, comprometidos com seu bem-estar e saúde bucal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-emerald-800 hover:scale-105 hover:shadow-xl font-bold"
              >
                <Link to="/professionals">Encontrar profissionais</Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-amber-400 to-amber-600 text-white border-0 shadow-lg transition-all duration-300 hover:from-amber-500 hover:to-amber-700 hover:scale-105 hover:shadow-xl font-bold"
              >
                <Link to="/register">Sou profissional</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm hover:shadow-lg transition flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-brand-light flex items-center justify-center text-white font-bold text-xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Cadastro</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Profissionais cadastram suas informações e enviam documentação para validação.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm hover:shadow-lg transition flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-brand-light flex items-center justify-center text-white font-bold text-xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Verificação</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Nossa equipe valida os dados e aprova os profissionais qualificados.</p>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm hover:shadow-lg transition flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-brand-light flex items-center justify-center text-white font-bold text-xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Conexão</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">Pacientes encontram os melhores profissionais para suas necessidades.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-brand to-brand-dark text-white transition-colors duration-300">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Você é um Profissional diferenciado de Odontologia?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-white/90">
            Junte-se à nossa plataforma, indicador profissional, exclusiva da ACDC e aumente sua visibilidade. Conecte-se com pacientes em busca de cuidados odontológicos de excelência e faça parte de um grupo seleto de Cirurgiões-dentistas comprometidos com a ética e a qualidade no atendimento.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white border-0 shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-emerald-800 hover:scale-105 hover:shadow-xl font-bold"
          >
            <Link to="/register">Cadastre-se agora</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
