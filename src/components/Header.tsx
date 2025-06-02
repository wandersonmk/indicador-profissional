import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (user && user.role === 'professional') {
        const { data: approvals } = await supabase
          .from('pending_approvals')
          .select('status')
          .eq('professional_id', user.id)
          .order('created_at', { ascending: false });
        if (approvals && approvals.length > 0) {
          setApprovalStatus(approvals[0].status);
        } else {
          setApprovalStatus(null);
        }
      } else {
        setApprovalStatus(null);
      }
    };
    fetchApprovalStatus();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-brand hover:underline">
            Início
          </Link>
          <Link to="/professionals" className="text-gray-700 hover:text-brand hover:underline">
            Profissionais
          </Link>
        </nav>
        
        <div>
          {(user && (user.role === 'admin' || (user.role === 'professional' && approvalStatus === 'approved'))) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="relative h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-300">
                  <Avatar>
                    <AvatarFallback className="text-white bg-blue-700">
                      {user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin</Link>
                  </DropdownMenuItem>
                )}
                {user.role === 'professional' && approvalStatus === 'approved' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Sair
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                asChild
                className="bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:from-amber-500 hover:to-amber-700 hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-10 px-4 py-2 bg-[rgb(128,161,182)] hover:bg-[rgb(108,141,162)] hover:scale-105 hover:shadow-lg transition-all duration-300 text-white"
              >
                Cadastro
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
