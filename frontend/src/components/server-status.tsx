'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient, getServerStatusWebSocketUrl } from '@/lib/api';
import type { ServerStatus } from '@/types';
import { toast } from 'sonner';
import { 
  Server, 
  Users, 
  Activity, 
  Power, 
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function ServerStatus() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchServerStatus = async () => {
    try {
      const status = await apiClient.getServerStatus();
      setServerStatus(status);
    } catch (error) {
      toast.error('Erro ao buscar status do servidor');
      console.error('Error fetching server status:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let shouldReconnect = true;

    const fetchInitialStatus = async () => {
      await fetchServerStatus();
    };

    const connectWebSocket = () => {
      socket = new WebSocket(getServerStatusWebSocketUrl());

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'server-status') {
            setServerStatus(message.data);
            setIsLoading(false);
          }

          if (message.type === 'error') {
            console.error('WebSocket status error:', message.message);
          }
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      };

      socket.onerror = () => {
        console.warn('WebSocket connection error. Waiting for close details.');
      };

      socket.onclose = (event) => {
        console.warn(`WebSocket closed: ${event.code} ${event.reason || 'sem motivo informado'}`);

        if (event.code === 1008) {
          shouldReconnect = false;
          toast.error('Sessão do tempo real inválida. Faça login novamente.');
          return;
        }

        if (shouldReconnect) {
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        }
      };
    };

    fetchInitialStatus();
    connectWebSocket();

    return () => {
      shouldReconnect = false;

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      socket?.close();
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchServerStatus();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Status do Servidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serverStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Status do Servidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Não foi possível carregar o status do servidor.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Status do Servidor
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          Informações em tempo real do seu servidor Minecraft Bedrock
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Online/Offline */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {serverStatus.online ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Online</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Ativo
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium">Offline</span>
                <Badge variant="destructive">
                  Inativo
                </Badge>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            Atualizado automaticamente
          </div>
        </div>

        {/* Informações do Servidor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <span className="font-medium">Jogadores:</span>
            </div>
            <div className="text-2xl font-bold">
              {serverStatus.players.online}/{serverStatus.players.max}
            </div>
            {serverStatus.players.list.length > 0 && (
              <div className="space-y-1">
                {serverStatus.players.list.map((player, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {player.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Power className="w-4 h-4" />
              <span className="font-medium">Versão:</span>
            </div>
            <div className="text-lg font-semibold">
              {serverStatus.version}
            </div>
            <div className="text-sm text-muted-foreground">
              {serverStatus.motd}
            </div>
          </div>
        </div>

        {/* Lista de Jogadores Online */}
        {serverStatus.players.list.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Jogadores Online:</h4>
            <div className="flex flex-wrap gap-2">
              {serverStatus.players.list.map((player, index) => (
                <Badge key={index} variant="outline" className="bg-green-50">
                  {player.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
