import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LayoutDashboard, Users, Settings, ListChecks, UserCog, ClipboardList, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  
  const adminLinks = [
    { href: '/admin', label: 'Dashboard Admin', icon: LayoutDashboard },
    { href: '/admin/pending', label: 'Pendentes', icon: ClipboardList },
    { href: '/admin/professionals', label: 'Todos Profissionais', icon: Users },
    { href: '/admin/field-config', label: 'Configurar Campos', icon: Settings },
  ];
  
  const professionalLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Editar Perfil', icon: UserCog },
  ];
  
  const links = isAdmin ? adminLinks : professionalLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-0">
            <nav className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">
                  {isAdmin ? 'Painel Administrativo' : 'Área do Profissional'}
                </h2>
              </div>
              <div className="flex-1 p-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive(link.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col h-screen border-r bg-[var(--brand-primary)] shadow-xl rounded-r-2xl transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6 border-b border-[var(--brand-accent)]">
          {!collapsed && (
            <h2 className="text-xl font-bold text-white drop-shadow-md">
              {isAdmin ? 'Painel Administrativo' : 'Área do Profissional'}
            </h2>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-base font-medium transition-all duration-300 ease-in-out
                  ${isActive(link.href)
                    ? 'bg-[var(--brand-accent)] text-white shadow-lg scale-[1.03]'
                    : 'hover:bg-[var(--brand-accent)] hover:text-white text-white hover:shadow-md'}
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {!collapsed && link.label}
              </Link>
            );
          })}
        </nav>
        {/* Collapse/Expand Button */}
        <div className="p-4 mt-auto flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-9 h-9 border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 shadow-sm flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
          >
            {collapsed
              ? <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-300" />
              : <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-300" />}
          </Button>
        </div>
      </aside>
    </>
  );
}
