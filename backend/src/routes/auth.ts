import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '@/middleware/auth';
import { AuthResponse, JWTPayload } from '@/types';
import { logger } from '@/utils/logger';
import { SignOptions } from 'jsonwebtoken';



const users = [
    {
        id: '1',
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    }
];

export async function authRoutes(fastify: FastifyInstance) {

    //Login
    fastify.post('/login', async (request, reply) => {
        try{
            const { username, password } = request.body as { username: string; password: string };

            const user = users.find(u => u.username === username);
            if (!user || !await bcrypt.compare(password, user.password)) {
                const response: AuthResponse = {
                    success: false,
                    message: 'Credenciais inválidas',
                };
                return reply.status(401).send(response);
            }

            const payload: JWTPayload = {
                userId: user.id,
                username: user.username,
            };

            const token = jwt.sign(
                payload, 
                process.env.JWT_SECRET as string, 
                { expiresIn: '24h' }
            );

            reply.setCookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: parseInt(process.env.JWT_EXPIRES || '86400') * 1000, // 24 horas
                path: '/' 
            });

            const response: AuthResponse = {
                success: true,
                message: 'Login realizado com sucesso!',
                user: {
                    id: user.id,
                    username: user.username,
                }
            };

            logger.info(`User ${user.username} logged in`);
            return reply.send(response);
        } catch (error) {
            logger.error('Login error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Erro interno do servidor',
            });
        }
    });

    //Logout
    fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
        reply.clearCookie('token');
        return reply.send({
            success: true,
            message: 'Logout realizado com sucesso',
        });
    });

    // Verify token
    fastify.get('/verify', {
        preHandler: authenticateToken,
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        return reply.send({
            success: true,
            message: 'Token válido',
            user: request.user,
        });
    });
}
