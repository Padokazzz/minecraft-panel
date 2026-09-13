import { Client } from 'ssh2';
import { logger } from '../utils/logger';
import { CommandResult } from '../types';


class SSHService {

    private ssh: Client | null = null;
    private connected: boolean = false;

    async connect(): Promise<void> {
        
        try{
            if(this.connected && this.ssh){
                return;
            }

            const privateKey = process.env.SSH_KEY;
            if (!privateKey) {
                throw new Error('SSH_KEY environment variable is not set');
            }

            const host = process.env.VPS_IP;
            const username = process.env.SSH_USER;

            if (!host || !username) {
                throw new Error('VPS_IP or SSH_USER environment variable is not set');
            }

            return new Promise((resolve, reject) => {
                this.ssh = new Client();
                
                this.ssh.on('ready', () => {
                    this.connected = true;
                    logger.info('SSH connection established');
                    resolve();
                });

                this.ssh.on('error', (err: Error) => {
                    logger.error('SSH connection error:', err);
                    reject(err);
                });

                this.ssh.connect({
                    host,
                    port: 22,
                    username,
                    privateKey,
                    readyTimeout: 30000,
                });
            });

        } catch (error) {
            logger.error('Failed to connect SSH:', error);
            throw error;
        }
    }

    async executeCommand (command: string): Promise<CommandResult> {
        
        if(!this.connected || !this.ssh){
            await this.connect();
        }

        return new Promise((resolve, reject) => {
            if (!this.ssh) {
                resolve({
                    success: false,
                    output: '',
                    error: 'SSH client not initialized'
                });
                return;
            }

            this.ssh.exec(command, (err: Error | undefined, stream: any) => {
                if (err) {
                    logger.error(`Command failed: ${command}`, err);
                    resolve({
                        success: false,
                        output: '',
                        error: err.message
                    });
                    return;
                }

                let stdout = '';
                let stderr = '';

                stream.on('close', (code: number) => {
                    resolve({
                        success: code === 0,
                        output: stdout,
                        error: code !== 0 ? stderr : undefined
                    });
                });

                stream.on('data', (data: Buffer) => {
                    stdout += data.toString();
                });

                stream.stderr.on('data', (data: Buffer) => {
                    stderr += data.toString();
                });
            });
        });
    }

    async disconnect(): Promise<void>{
        if(this.ssh){
            this.ssh.end();
            this.ssh = null;
            this.connected = false;
            logger.info('SSH connection closed');
        }
    }

    isConnected(): boolean {
        return this.connected;
    }
    
}

export const sshService = new SSHService();
export const connectSSH = () => sshService.connect();
