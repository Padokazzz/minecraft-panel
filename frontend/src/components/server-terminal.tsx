'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Download, RefreshCw, Save, Send, Square, Terminal, UploadCloud, Users } from 'lucide-react';

const updateStages = [
  { label: 'Validando link', progress: 8 },
  { label: 'Criando backup', progress: 22 },
  { label: 'Enviando backup para a nuvem', progress: 38 },
  { label: 'Parando servidor', progress: 52 },
  { label: 'Baixando atualização', progress: 68 },
  { label: 'Instalando arquivos', progress: 84 },
  { label: 'Iniciando servidor', progress: 94 },
];

export function ServerTerminal() {
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [updateUrl, setUpdateUrl] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStageIndex, setUpdateStageIndex] = useState(0);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
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

  useEffect(() => {
    if (!isUpdating) {
      return;
    }

    const interval = setInterval(() => {
      setUpdateProgress((currentProgress) => {
        const nextProgress = Math.min(currentProgress + 2, 94);
        const nextStageIndex = updateStages.findLastIndex((stage) => nextProgress >= stage.progress);

        setUpdateStageIndex(Math.max(nextStageIndex, 0));
        return nextProgress;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isUpdating]);

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

  const handleUpdateSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedUrl = updateUrl.trim();

    if (!trimmedUrl) {
      toast.error('Cole o link da atualização');
      return;
    }

    setIsUpdating(true);
    setUpdateStatus('running');
    setUpdateProgress(5);
    setUpdateStageIndex(0);

    try {
      const result = await apiClient.updateBedrock(trimmedUrl);

      if (result.success) {
        toast.success('Atualização concluída na VPS');
        setUpdateStatus('success');
        setUpdateProgress(100);
        setUpdateStageIndex(updateStages.length - 1);
        setUpdateUrl('');
        await fetchLogs();
      } else {
        setUpdateStatus('error');
        toast.error(result.error || result.output || 'Falha ao iniciar atualização');
      }
    } catch (error) {
      setUpdateStatus('error');
      toast.error('Erro ao iniciar atualização');
      console.error('Error starting bedrock update:', error);
    } finally {
      setIsUpdating(false);
    }
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
        <form onSubmit={handleUpdateSubmit} className="rounded-md border border-green-200 bg-green-50 p-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                value={updateUrl}
                onChange={(event) => setUpdateUrl(event.target.value)}
                placeholder="Cole o link .zip da atualização do Minecraft Bedrock"
                disabled={isUpdating}
                className="bg-white"
              />
              <Button type="submit" disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                Atualizar
              </Button>
            </div>

            {updateStatus !== 'idle' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-green-900">
                    {updateStatus === 'success'
                      ? 'Atualização concluída'
                      : updateStatus === 'error'
                        ? 'Atualização falhou'
                        : updateStages[updateStageIndex]?.label}
                  </span>
                  <span className="tabular-nums text-green-800">{updateProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-green-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      updateStatus === 'error' ? 'bg-red-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${updateProgress}%` }}
                  />
                </div>
                <div className="grid gap-1 text-xs text-green-900 md:grid-cols-2">
                  {updateStages.map((stage, index) => (
                    <div key={stage.label} className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          index <= updateStageIndex && updateStatus !== 'error'
                            ? 'bg-green-600'
                            : updateStatus === 'error' && index === updateStageIndex
                              ? 'bg-red-500'
                              : 'bg-green-200'
                        }`}
                      />
                      {stage.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

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
