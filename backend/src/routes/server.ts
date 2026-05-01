import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticateToken } from '@/middleware/auth';
import { sshService } from '@/services/sshService';
import { logger } from '@/utils/logger';
import { ServerStatus, Player, CommandResult } from '@/types';

export async function serverRoutes (fastify: FastifyInstance){

    //Server status
    fastify.get('/status', {
        preHandler: authenticateToken,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            //Verify if minecraft screen is online

            const screenResult = await sshService.executeCommand('sudo -n -u ubuntu screen -list');

            if (!screenResult.success) {
    return reply.code(500).send({ error: 'Failed to check screen status', details: screenResult.error });
}

const isOnline = screenResult.output.includes('minecraft');

            let players: Player[] = [];
            let playerCount = 0;

            if (isOnline) {

                // Get online players list

                const listResult = await sshService.executeCommand('sudo screen -S minecraft -p 0 -X stuff "list$(printf \\r)" && sleep 1 && sudo screen -S minecraft -p 0 -X hardcopy /tmp/mc_list.txt && cat /tmp/mc_list.txt');

                if (listResult.success) {
                    // Parse players from output
                    // Example: "There are 2/20 players online:"
                    const match = listResult.output.match(/There are (\d+)\/\d+ players online:/);
                    if (match) {
                         const output = listResult.output;
                         const match = output.match(/There are (\d+) of a max of (\d+) players online:(.*)/);
                         if (match) {
                              playerCount = parseInt(match[1]);
                              const maxPlayers = parseInt(match[2]);
                              const playerNames = match[3].split(',').map(name => name.trim()).filter(name => name);
                              
                              players = playerNames.map(name => ({
                                name,
                                uuid: '',
                                online: true
                              }));
                         }
                    }
                }
                const serverStatus: ServerStatus = {
                    online: isOnline,
                    players: {
                        online: playerCount,
                        max: 20,
                        list: players
                    },
                    version: '1.20.1',
                    motd: 'Minecraft Server'
                }
                return reply.send(serverStatus);
            }

            const offlineStatus: ServerStatus = {
                online: false,
                players: {
                    online: 0,
                    max: 20,
                    list: []
                },
                version: '1.20.1',
                motd: 'Minecraft Server'
            };
    return reply.send(offlineStatus);
        } catch (error) {
            logger.error('Error getting server status:', error);
            reply.code(500).send({ error: 'Failed to get server status' });
        }
    }
)
fastify.post('/command', {
    preHandler: authenticateToken
}, async (request: FastifyRequest, reply: FastifyReply) => {
    
    try{
        const { command } = request.body as { command: string };
        
        const sanitizedCommand = command.replace(/[;&|`$(){}[\]]/g, '');
        
        if (!sanitizedCommand) {
            return reply.status(400).send({
                error: 'Comando inválido',
            });
        }

        const result = await sshService.executeCommand(
            `sudo -n -u ubuntu screen -S minecraft -p 0 -X stuff "${sanitizedCommand}$(printf \\r)"`
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
