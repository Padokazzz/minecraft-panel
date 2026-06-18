import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '@/middleware/auth';
import { sshService } from '@/services/sshService';
import { logger } from '@/utils/logger';
import { ServerStatus, Player, CommandResult, JWTPayload } from '@/types';

function parsePlayerNamesFromLogs(output: string): string[] {
  const activePlayers = new Set<string>();
  const lines = output.replace(/\r/g, '\n').split('\n');

  for (const line of lines) {
    const connectedMatch =
      line.match(/Player connected:\s*([^,]+)/i) ||
      line.match(/Player Spawned:\s*([^\s,]+)/i);

    if (connectedMatch) {
      activePlayers.add(connectedMatch[1].trim());
    }

    const disconnectedMatch =
      line.match(/Player disconnected:\s*([^,]+)/i) ||
      line.match(/Player left:\s*([^,]+)/i);

    if (disconnectedMatch) {
      activePlayers.delete(disconnectedMatch[1].trim());
    }
  }

  return [...activePlayers];
}

function parseListOutput(output: string): { playerCount: number; maxPlayers: number; playerNames: string[] } | null {
  const normalizedOutput = output.replace(/\r/g, '\n');
  const matches = [
    ...normalizedOutput.matchAll(/There are\s+(\d+)\s+of\s+a\s+max\s+of\s+(\d+)\s+players online:\s*([^\n]*)/gi),
    ...normalizedOutput.matchAll(/There are\s+(\d+)\/(\d+)\s+players online:\s*([^\n]*)/gi),
  ].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const latestMatch = matches.at(-1);

  if (!latestMatch) {
    return null;
  }

  const playerCount = parseInt(latestMatch[1], 10);
  const maxPlayers = parseInt(latestMatch[2], 10);
  let playerNames = (latestMatch[3] || '')
    .split(',')
    .map(name => name.trim())
    .filter(Boolean);

  if (playerCount > 0 && playerNames.length === 0) {
    playerNames = parsePlayerNamesFromLogs(normalizedOutput).slice(-playerCount);
  }

  return {
    playerCount,
    maxPlayers,
    playerNames,
  };
}

async function getMinecraftStatus(): Promise<ServerStatus> {
  const screenResult = await sshService.executeCommand(
    'sudo -n -u ubuntu screen -list'
  );

  if (!screenResult.success) {
    throw new Error(screenResult.error || 'Failed to check screen status');
  }

  const isOnline = screenResult.output.includes('minecraft');

  if (!isOnline) {
    return {
      online: false,
      players: {
        online: 0,
        max: 20,
        list: []
      },
      version: '1.20.1',
      motd: 'Minecraft Server'
    };
  }

  let players: Player[] = [];
  let playerCount = 0;
  let maxPlayers = 20;

  const listResult = await sshService.executeCommand(
    "sudo -n -u ubuntu screen -S minecraft -p 0 -X stuff \"$(printf '\\r')\" && sleep 1 && sudo -n -u ubuntu screen -S minecraft -p 0 -X stuff \"list\" && sudo -n -u ubuntu screen -S minecraft -p 0 -X stuff \"$(printf '\\r')\" && sleep 1 && sudo -n -u ubuntu screen -S minecraft -p 0 -X hardcopy /tmp/mc_list.txt && sudo -n -u ubuntu cat /tmp/mc_list.txt"
  );

  if (listResult.success) {
    const parsedList = parseListOutput(listResult.output);

    if (parsedList) {
      playerCount = parsedList.playerCount;
      maxPlayers = parsedList.maxPlayers;

      players = parsedList.playerNames.map(name => ({
        name,
        uuid: '',
        online: true
      }));
    }
  }

  return {
    online: true,
    players: {
      online: playerCount,
      max: maxPlayers,
      list: players
    },
    version: '1.20.1',
    motd: 'Minecraft Server'
  };
}
export async function serverRoutes (fastify: FastifyInstance){

    //Server status
    fastify.get('/status', {
        preHandler: authenticateToken,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const serverStatus = await getMinecraftStatus();
            return reply.send(serverStatus);
        } catch (error) {
            logger.error('Error getting server status:', error);
            return reply.code(500).send({ error: 'Failed to get server status' });
        }
    }
)

fastify.get('/status/ws', { websocket: true }, (socket, request) => {
    try {
        const token = request.cookies.token;

        if (!token) {
            socket.close(1008, 'Token nao fornecido');
            return;
        }

        jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
        socket.close(1008, 'Token invalido');
        return;
    }

    let interval: NodeJS.Timeout | null = null;

    const sendStatus = async () => {
        try {
            const status = await getMinecraftStatus();

            if (socket.readyState === socket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'server-status',
                    data: status,
                }));
            }
        } catch (error) {
            logger.error('Error sending websocket status:', error);

            if (socket.readyState === socket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to get server status',
                }));
            }
        }
    };

    sendStatus();
    interval = setInterval(sendStatus, 5000);

    socket.on('close', () => {
        if (interval) {
            clearInterval(interval);
        }
    });
});

fastify.post('/command', {
    preHandler: authenticateToken
}, async (request: FastifyRequest, reply: FastifyReply) => {
    
    try{
        const { command } = request.body as { command: string };
        
        const sanitizedCommand = command.replace(/[;&|`$(){}[\]"]/g, '');
        
        if (!sanitizedCommand) {
            return reply.status(400).send({
                error: 'Comando inválido',
            });
        }

        const result = await sshService.executeCommand(
            `sudo -n -u ubuntu screen -S minecraft -p 0 -X stuff "${sanitizedCommand}" && sudo -n -u ubuntu screen -S minecraft -p 0 -X stuff "$(printf '\\r')"`
        );

        const response: CommandResult = {
            success: result.success,
            output: result.success ? 'Comando enviado com sucesso' : 'Falha ao enviar comando',
            error: result.error,
        };

        logger.info(`Command executed: ${sanitizedCommand}`);
      return reply.send(response);
    } catch (error) {
        logger.error('Error executing command:', error);
        reply.code(500).send({ error: 'Failed to execute command' });
    }

    }
)

fastify.get('/logs', {
    preHandler: authenticateToken,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { lines = 50 } = request.query as { lines?: number };
      
      const result = await sshService.executeCommand(
    `sudo -n -u ubuntu screen -S minecraft -p 0 -X hardcopy /tmp/mc_logs.txt && sudo -n -u ubuntu cat /tmp/mc_logs.txt | tail -n ${lines}`
);
      
      if (result.success) {
        return reply.send({
          logs: result.output.split('\n').filter(line => line.trim()),
        });
      }
      
      return reply.status(500).send({
        error: 'Erro ao obter logs',
      });
    } catch (error) {
      logger.error('Error getting logs:', error);
      return reply.status(500).send({
        error: 'Erro ao obter logs',
      });

}})}
