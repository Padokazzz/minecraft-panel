import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

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

// Extender tipos do Fastify
declare module 'fastify' {
  export interface FastifyRequest {
    user?: JWTPayload;
  }
}