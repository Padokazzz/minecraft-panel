'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ServerStatus } from '@/components/server-status';
import { ServerTerminal } from '@/components/server-terminal';
import { MinecraftIcon } from '@/components/minecraft-icon';
import { logout, getUserRole, hasPermission } from '@/lib/auth';
import { toast } from 'sonner';
import { Role } from '@/types';
import { 
  LayoutDashboard, 
  Terminal, 
  LogOut,
  User
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'terminal'>('overview');
  const [role, setRole] = useState<Role | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setRole(getUserRole());
  }, [router]);

  useEffect(() => {
    if (role && !hasPermission('terminal') && activeTab === 'terminal') {
      setActiveTab('overview');
    }
  }, [role, activeTab]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
    } catch {
      toast.error('Erro ao fazer logout');
    }
  };

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Visão Geral',
      icon: LayoutDashboard,
      component: <ServerStatus />,
      requires: 'status',
    },
    ...(hasPermission('terminal') ? [{
      id: 'terminal' as const,
      label: 'Terminal',
      icon: Terminal,
      component: <ServerTerminal />,
      requires: 'terminal',
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <MinecraftIcon className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Minecraft Admin Panel
                </h1>
                <p className="text-sm text-gray-500">
                  Painel de Controle do Servidor Bedrock
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span className="capitalize">{role || '...'}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={activeTab === tab.id ? 'block' : 'hidden'}
            >
              {tab.component}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
