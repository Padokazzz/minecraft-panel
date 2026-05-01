import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { SSHConfig, CommandResult } from '../types';


class SSHService {

    private ssh: Client | null = null;
    private connected: boolean = false;

    async connect(): Promise<void> {
        
        try{
            if(this.connected && this.ssh){
                return;
            }

            const keyPath = path.resolve(process.env.SSH_KEY_PATH!);
            
            if (!fs.existsSync(keyPath)) {
                throw new Error(`SSH key file not found: ${keyPath}`);
            }

            const keyContent = fs.readFileSync(keyPath, 'utf8');

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
                    host: process.env.VPS_IP!,
                    port: 22,
                    username: process.env.SSH_USER!,
                    privateKey: keyContent,
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
