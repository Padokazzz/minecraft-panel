import { Role } from "@/types";

export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
};

export const getUserRole = (): Role | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        const user = JSON.parse(userStr);
        return user.role || null;
    } catch {
        return null;
    }
};

export const hasPermission = (permission: string): boolean => {
    const role = getUserRole();
    if (!role) return false;

    const permissions: Record<Role, string[]> = {
        admin: ['status', 'terminal', 'logs', 'update', 'players'],
        operator: ['status', 'update', 'players'],
    };

    return permissions[role]?.includes(permission) || false;
};

export const logout = async (): Promise<void> => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; max-age=0';
    window.location.href = '/login';
}
