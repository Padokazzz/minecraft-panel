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
import { Loader2 } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className='text-center space-y-3 pb-2'>
                    <div className="flex justify-center">
                        <MinecraftIcon className='w-14 h-14 sm:w-16 sm:h-16'/>
                    </div>
                    <div>
                        <CardTitle className='text-xl sm:text-2xl font-bold text-green-800'>
                            Minecraft Admin Panel
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                            Faca login para acessar o painel
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor="username" className="text-sm">Usuario</Label>
                            <Input 
                                id="username" 
                                name="username" 
                                type="text" 
                                placeholder="Digite seu usuario"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="h-11"
                                autoComplete="username"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="password" className="text-sm">Senha</Label>
                            <Input 
                                id="password" 
                                name="password" 
                                type="password" 
                                placeholder='Digite sua senha'
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="h-11"
                                autoComplete="current-password"
                            />
                        </div>
                        <Button type="submit" 
                        className='w-full h-11 bg-green-600 hover:bg-green-700 text-base font-medium' 
                        disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Entrando...
                                </>
                            ) : 'Entrar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
