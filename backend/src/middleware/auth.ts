import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { JWTPayload, Role, ROLE_PERMISSIONS } from "@/types";

export const authenticateToken = async (request: FastifyRequest, reply: FastifyReply) => {
    try{
        const token = request.cookies.token;
        
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
            const token = request.cookies.token;
            
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
