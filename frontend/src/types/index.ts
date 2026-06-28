// Tipos para o Minecraft admin Panel

export interface ServerStatus {
    online: boolean;
    players: {
        online: number;
        max: number;
        list: Player [];
    };
    version: string;
    motd: string;
}

export interface Player {
    name: string;
    uuid: string;
    online: boolean;
}

export interface CommandResult {
    success: boolean;
    output: string;
    error?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        username: string;
    };
}

export interface ApiResponse<T = unknown> {
    success?: boolean;
    data?: T;
    error?: string;
    message?: string;
}
