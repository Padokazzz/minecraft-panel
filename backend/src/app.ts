import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';

import { authRoutes } from '@/routes/auth';
import { serverRoutes } from '@/routes/server';
import { connectSSH } from '@/services/sshService';
import { logger } from '@/utils/logger';

const fastify = Fastify({
  logger: false,
});

fastify.register(cors, {
    origin: (process.env.FRONTEND_URL || 'http://localhost:3000').trim(),
    credentials: true
});

fastify.register(helmet, {
    contentSecurityPolicy: false,
});

fastify.register(cookie);
fastify.register(websocket);

fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
});

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(serverRoutes, { prefix: '/api/server' });

fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
    try{
        try {
            await connectSSH();
        } catch (sshError) {
            logger.warn('SSH connection failed - server commands will be unavailable');
        }

        const port = parseInt(process.env.PORT || '3001');
        await fastify.listen({port, host: '0.0.0.0'});

        logger.info(`Server running on port ${port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    } catch (err) {
        logger.error('Error starting server:', err);
        process.exit(1);
    }
}

start();
