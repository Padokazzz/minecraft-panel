'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerStatus } from '@/components/server-status';
import { CommandPanel } from '@/components/command-panel';
import { LogViewer } from '@/components/log-viewer';
import { MinecraftIcon } from '@/components/minecraft-icon';
import { logout } from '@/lib/auth';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Terminal, 
  FileText, 
  LogOut,
  Settings
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'commands' | 'logs'>('overview');

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Visão Geral',
      icon: LayoutDashboard,
      component: <ServerStatus />
    },
    {
      id: 'commands' as const,
      label: 'Comandos',
      icon: Terminal,
      component: <CommandPanel />
    },
    {
      id: 'logs' as const,
      label: 'Logs',
      icon: FileText,
      component: <LogViewer />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
      </header>

      {/* Navigation Tabs */}
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

      {/* Main Content */}
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