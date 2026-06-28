'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Send, Terminal, Square, Save, Users } from 'lucide-react';

export function CommandPanel() {
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const quickCommands = [
    { label: 'Listar Jogadores', command: 'list', icon: Users },
    { label: 'Salvar Mundo', command: 'save-all', icon: Save },
    { label: 'Parar Servidor', command: 'stop', icon: Square },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim()) {
      toast.error('Digite um comando');
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiClient.executeCommand(command);
      
      if (result.success) {
        toast.success('Comando enviado com sucesso!');
        setCommandHistory([command, ...commandHistory].slice(0, 10));
        setCommand('');
      } else {
        toast.error('Falha ao enviar comando');
      }
    } catch (error) {
      toast.error('Erro ao enviar comando');
      console.error('Error sending command:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCommand = (cmd: string) => {
    setCommand(cmd);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Painel de Comandos
        </CardTitle>
        <CardDescription>
          Envie comandos para o console do servidor Minecraft
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Commands */}
        <div className="space-y-3">
          <Label>Comandos Rápidos</Label>
          <div className="flex flex-wrap gap-2">
            {quickCommands.map((quick) => {
              const Icon = quick.icon;
              return (
                <Button
                  key={quick.command}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickCommand(quick.command)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {quick.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Command Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="command">Comando</Label>
            <div className="flex gap-2">
              <Input
                id="command"
                placeholder="Digite um comando (ex: list, stop, save-all)"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Terminal className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div className="space-y-2">
            <Label>Histórico de Comandos</Label>
            <div className="space-y-1">
              {commandHistory.map((cmd, index) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground bg-gray-50 px-3 py-2 rounded"
                >
                  {cmd}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
