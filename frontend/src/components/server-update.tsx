'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { RefreshCw, UploadCloud } from 'lucide-react';

const updateStages = [
  { label: 'Validando link', progress: 8 },
  { label: 'Criando backup', progress: 22 },
  { label: 'Enviando backup para a nuvem', progress: 38 },
  { label: 'Parando servidor', progress: 52 },
  { label: 'Baixando atualização', progress: 68 },
  { label: 'Instalando arquivos', progress: 84 },
  { label: 'Iniciando servidor', progress: 94 },
];

export function ServerUpdate() {
  const [updateUrl, setUpdateUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStageIndex, setUpdateStageIndex] = useState(0);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="w-5 h-5" />
          Atualizar Servidor
        </CardTitle>
        <CardDescription>
          Cole o link .zip da atualização do Minecraft Bedrock
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row">
            <Input
              value={updateUrl}
              onChange={(event) => setUpdateUrl(event.target.value)}
              placeholder="https://www.minecraft.net/bedrock-server/bedrock-server-linux.zip"
              disabled={isUpdating}
              className="flex-1"
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
                <span className="font-medium">
                  {updateStatus === 'success'
                    ? 'Atualização concluída'
                    : updateStatus === 'error'
                      ? 'Atualização falhou'
                      : updateStages[updateStageIndex]?.label}
                </span>
                <span className="tabular-nums">{updateProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    updateStatus === 'error' ? 'bg-red-500' : 'bg-green-600'
                  }`}
                  style={{ width: `${updateProgress}%` }}
                />
              </div>
              <div className="grid gap-1 text-xs md:grid-cols-2">
                {updateStages.map((stage, index) => (
                  <div key={stage.label} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        index <= updateStageIndex && updateStatus !== 'error'
                          ? 'bg-green-600'
                          : updateStatus === 'error' && index === updateStageIndex
                            ? 'bg-red-500'
                            : 'bg-gray-300'
                      }`}
                    />
                    {stage.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
