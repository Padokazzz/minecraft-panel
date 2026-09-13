import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { JWTPayload, Role, ROLE_PERMISSIONS } from "@/types";

function extractToken(request: FastifyRequest): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    const cookieToken = request.cookies.token;
    if (cookieToken) {
        return cookieToken;
    }

    return null;
}

export const authenticateToken = async (request: FastifyRequest, reply: FastifyReply) => {
    try{
        const token = extractToken(request);
        
        if(!token){
            return reply.status(401).send({ error: 'Token não fornecido' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        request.user = decoded;

    }catch(error){
        return reply.status(403).send({ error: 'Token inválido' });
    }
};

export const requirePermission = (permission: string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const token = extractToken(request);
            
            if (!token) {
                return reply.status(401).send({ error: 'Token não fornecido' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
            request.user = decoded;

            const userPermissions = ROLE_PERMISSIONS[decoded.role] || [];
            if (!userPermissions.includes(permission)) {
                return reply.status(403).send({ error: 'Sem permissão' });
            }
        } catch (error) {
            return reply.status(403).send({ error: 'Token inválido' });
        }
    };
};

declare module 'fastify' {
  export interface FastifyRequest {
    user?: JWTPayload;
  }
}
