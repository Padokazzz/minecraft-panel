export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
};

export const logout = async (): Promise<void> => {
    localStorage.removeItem('token');
    window.location.href = '/login';
}
