import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateToken } from '@/middleware/auth';
import { AuthResponse, JWTPayload, Role } from '@/types';
import { logger } from '@/utils/logger';

interface UserConfig {
    id: string;
    username: string;
    passwordHash: string;
    role: Role;
}

function loadUsers(): UserConfig[] {
    const users: UserConfig[] = [];

    // Admin principal
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminHash = process.env.ADMIN_PASSWORD_HASH;
    if (adminHash) {
        users.push({
            id: '1',
            username: adminUser,
            passwordHash: adminHash,
            role: 'admin',
        });
    }

    // Operador 1
    const op1User = process.env.OPERATOR1_USERNAME;
    const op1Hash = process.env.OPERATOR1_PASSWORD_HASH;
    if (op1User && op1Hash) {
        users.push({
            id: '2',
            username: op1User,
            passwordHash: op1Hash,
            role: 'operator',
        });
    }

    // Operador 2
    const op2User = process.env.OPERATOR2_USERNAME;
    const op2Hash = process.env.OPERATOR2_PASSWORD_HASH;
    if (op2User && op2Hash) {
        users.push({
            id: '3',
            username: op2User,
            passwordHash: op2Hash,
            role: 'operator',
        });
    }

    return users;
}

export async function authRoutes(fastify: FastifyInstance) {

    fastify.post('/login', async (request, reply) => {
        try{
            const { username, password } = request.body as { username: string; password: string };

            const users = loadUsers();
            const user = users.find(u => u.username === username);
            if (!user || !await bcrypt.compare(password, user.passwordHash)) {
                const response: AuthResponse = {
                    success: false,
                    message: 'Credenciais inválidas',
                };
                return reply.status(401).send(response);
            }

            const payload: JWTPayload = {
                userId: user.id,
                username: user.username,
                role: user.role,
            };

            const token = jwt.sign(
                payload, 
                process.env.JWT_SECRET as string, 
                { expiresIn: '24h' }
            );

            reply.setCookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: parseInt(process.env.JWT_EXPIRES || '86400') * 1000,
                path: '/' 
            });

            const response: AuthResponse = {
                success: true,
                message: 'Login realizado com sucesso!',
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                }
            };

            logger.info(`User ${user.username} logged in (${user.role})`);
            return reply.send({ ...response, token });
        } catch (error) {
            logger.error('Login error:', error);
            return reply.status(500).send({
                success: false,
                message: 'Erro interno do servidor',
            });
        }
    });

    fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
        reply.clearCookie('token');
        return reply.send({
            success: true,
            message: 'Logout realizado com sucesso',
        });
    });

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
