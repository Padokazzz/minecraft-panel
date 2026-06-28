'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Download, RefreshCw, Save, Send, Square, Terminal, Users } from 'lucide-react';

export function ServerTerminal() {
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const quickCommands = [
    { label: 'Jogadores', command: 'list', icon: Users },
    { label: 'Salvar', command: 'save-all', icon: Save },
    { label: 'Parar', command: 'stop', icon: Square },
  ];

  const fetchLogs = async () => {
    try {
      const logsData = await apiClient.getLogs(120);
      setLogs(logsData);
    } catch (error) {
      toast.error('Erro ao buscar logs');
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchLogs();
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchLogs, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const sendCommand = async (commandToSend: string) => {
    const trimmedCommand = commandToSend.trim();

    if (!trimmedCommand) {
      toast.error('Digite um comando');
      return;
    }

    setIsSending(true);

    try {
      const result = await apiClient.executeCommand(trimmedCommand);

      if (result.success) {
        toast.success('Comando enviado');
        setCommandHistory((history) => [trimmedCommand, ...history].slice(0, 8));
        setCommand('');
        await fetchLogs();
      } else {
        toast.error('Falha ao enviar comando');
      }
    } catch (error) {
      toast.error('Erro ao enviar comando');
      console.error('Error sending command:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendCommand(command);
  };

  const downloadLogs = () => {
    const logContent = logs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `minecraft-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Logs baixados com sucesso!');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Terminal do Servidor
            </CardTitle>
            <CardDescription>
              Console, logs e comandos do Minecraft em uma única tela
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh((value) => !value)}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchLogs()}
              disabled={isLoadingLogs}
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingLogs ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadLogs}
              disabled={logs.length === 0}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((quick) => {
            const Icon = quick.icon;

            return (
              <Button
                key={quick.command}
                variant="outline"
                size="sm"
                onClick={() => void sendCommand(quick.command)}
                disabled={isSending}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {quick.label}
              </Button>
            );
          })}
        </div>

        <div className="bg-gray-950 rounded-md border border-gray-800 overflow-hidden">
          <div className="h-[420px] overflow-y-auto p-4 font-mono text-sm">
            {isLoadingLogs ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-gray-500">Nenhum log disponível</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={`${index}-${log}`} className="break-words text-gray-300">
                    <span className="mr-2 select-none text-gray-600">$</span>
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-800 bg-gray-900 p-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-green-400">&gt;</span>
              <Input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                placeholder="Digite um comando"
                disabled={isSending}
                className="h-10 flex-1 border-gray-700 bg-gray-950 font-mono text-gray-100 placeholder:text-gray-500"
              />
              <Button type="submit" disabled={isSending} className="bg-green-600 hover:bg-green-700">
                {isSending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>

        {commandHistory.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {commandHistory.map((historyCommand) => (
              <Button
                key={historyCommand}
                variant="secondary"
                size="sm"
                onClick={() => setCommand(historyCommand)}
              >
                {historyCommand}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
