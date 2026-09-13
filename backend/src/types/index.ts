export type Role = 'admin' | 'operator';

export interface User {
    id: string;
    username: string;
    password: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    admin: ['status', 'terminal', 'logs', 'update', 'players'],
    operator: ['status', 'update', 'players'],
};

export interface JWTPayload {
    userId: string;
    username: string;
    role: Role;
};

export interface ServerStatus {
    online: boolean;
    players: {
        online: number;
        max: number;
        list: Player[];
    };

    version: string;
    motd: string;
};

export interface Player {
    name: string;
    uuid: string;
    online: boolean;
};

export interface SSHConfig {
    host: string;
    username: string;
    privatekey: string;
};

export interface CommandResult {
    success: boolean;
    output: string;
    error?: string;
};

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        username: string;
        role: Role;
    }
}
