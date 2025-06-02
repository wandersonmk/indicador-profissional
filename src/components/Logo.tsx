import { Stethoscope } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="p-2">
        <img 
          src="/img/logo_acdc_sem_fundo_pequeno.png" 
          alt="Logo" 
          className="h-12 w-12 object-contain"
        />
      </div>
      <div>
        <div className="font-extrabold text-lg sm:text-xl leading-tight" style={{ color: 'var(--brand-primary)' }}>
          Indicador
          <span className="block text-base sm:text-lg font-semibold" style={{ color: 'var(--brand-accent)' }}>
            Profissional
          </span>
        </div>
      </div>
    </div>
  );
}

export default Logo;
