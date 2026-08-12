import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, ReceiptText, Sparkles, FileText, LogOut } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/historico', icon: ReceiptText, label: 'Histórico' },
    { to: '/conselhos', icon: Sparkles, label: 'Conselhos IA' },
    { to: '/relatorios', icon: FileText, label: 'Relatórios' },
  ];

  return (
    <div className="min-h-screen flex bg-f-bg">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-f-surface border-r border-f-border">
        <div className="p-6">
          <div className="text-2xl font-bold font-syne text-f-green tracking-tight">
            Fin<span className="text-f-text">Track</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-syne font-bold text-sm transition-colors ${
                  isActive
                    ? 'bg-f-card text-f-text border border-f-border'
                    : 'text-f-muted hover:text-f-text hover:bg-f-card'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-f-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0d1f18] to-[#111820] border border-f-green flex items-center justify-center text-f-green font-bold text-xs uppercase">
              {user?.nome?.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-f-text truncate">{user?.nome}</p>
              <p className="text-xs text-f-muted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-f-muted border border-f-border rounded-lg hover:text-f-red hover:border-f-red transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-f-surface border-t border-f-border z-50 flex justify-around p-2 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg text-xs font-syne font-bold transition-colors ${
                isActive ? 'text-f-green' : 'text-f-muted'
              }`
            }
          >
            <item.icon size={20} className="mb-1" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-y-auto h-screen">
        <header className="md:hidden flex items-center justify-between p-4 bg-f-surface border-b border-f-border sticky top-0 z-40">
          <div className="text-xl font-bold font-syne text-f-green">
            Fin<span className="text-f-text">Track</span>
          </div>
          <button onClick={logout} className="text-f-muted hover:text-f-red">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
