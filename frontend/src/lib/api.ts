import { LoginRequest, LoginResponse, ServerStatus, CommandResult } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    //Auth endpoints
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        return this.request<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async logout(): Promise<void> {
        return this.request<void>('/api/auth/logout', {
            method: 'POST',
        });
    }

    // Server endpoints
    async getServerStatus(): Promise<ServerStatus> {
        return this.request<ServerStatus>('/api/server/status');
    }
    
    async executeCommand(command: string): Promise<CommandResult> {
        return this.request<CommandResult>('/api/server/command', {
            method: 'POST',
            body: JSON.stringify({ command }),
        });
    }

    async getLogs(lines: number = 100): Promise<string[]> {
        return this.request<{ logs: string[] }>(`/api/server/logs?lines=${lines}`).then(response => response.logs);
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
