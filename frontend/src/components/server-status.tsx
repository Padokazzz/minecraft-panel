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
          toast.error('Sessao do tempo real invalida. Faca login novamente.');
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
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Server className="w-4 h-4 sm:w-5 sm:h-5" />
            Status do Servidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 sm:h-32">
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!serverStatus) {
    return (
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Server className="w-4 h-4 sm:w-5 sm:h-5" />
            Status do Servidor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Nao foi possivel carregar o status do servidor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Server className="w-4 h-4 sm:w-5 sm:h-5" />
            Status do Servidor
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-2 sm:h-9 sm:px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Informacoes em tempo real do seu servidor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {serverStatus.online ? (
              <>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="font-medium text-sm sm:text-base">Online</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Ativo
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                <span className="font-medium text-sm sm:text-base">Offline</span>
                <Badge variant="destructive" className="text-xs">
                  Inativo
                </Badge>
              </>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5" />
            Atualizado automaticamente
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">Jogadores</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {serverStatus.players.online}/{serverStatus.players.max}
            </div>
            {serverStatus.players.list.length > 0 && (
              <div className="space-y-1">
                {serverStatus.players.list.map((player, index) => (
                  <div key={index} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="truncate">{player.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Power className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">Versao</span>
            </div>
            <div className="text-base sm:text-lg font-semibold">
              {serverStatus.version}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground truncate">
              {serverStatus.motd}
            </div>
          </div>
        </div>

        {serverStatus.players.list.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-medium">Jogadores Online:</h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {serverStatus.players.list.map((player, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-xs">
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
