'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { MinecraftIcon } from '@/components/minecraft-icon';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await apiClient.login(formData);

            if(response.success) {
                toast.success('Login realizado com sucesso!');
                router.push('/dashboard');
            }else{
                toast.error('Falha no login. Verifique suas credenciais.');
            }
        } catch {
            toast.error('Erro ao conectar com o servidor.');
        } finally {
            setIsLoading(false);
        }
        
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
            <Card className="w-full max-w-md">
                <CardHeader className='text-center'>
                    <div className="flex justify-center mb-4">
                        <MinecraftIcon className='w-16 h-16'/>
                    </div>
                    <CardTitle className='text-2x1 font-bold text-green-800'>
                        Minecraft Admin Panel
                    </CardTitle>
                    <CardDescription>
                        Faça login para acessar o painel de administrador
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor="username">Usuário</Label>
                            <Input 
                                id="username" 
                                name="username" 
                                type="text" 
                                placeholder="Digite seu usuário"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="password">Senha</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                placeholder='Digite sua senha'
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <Button type="submit" 
                        className='w-full bg-green-600 hover:bg-green-700' 
                        disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
