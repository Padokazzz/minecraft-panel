export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Verify is token cookie exists

    const cookies = document.cookie.split (';');
    const tokenCookie = cookies.find(cookie =>
        cookie.trim().startsWith('token=')
    );
    
    return !!tokenCookie;
};

export const logout = async (): Promise<void> => {
    // Erase cookies
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redirect to login
    window.location.href = '/login';
}
