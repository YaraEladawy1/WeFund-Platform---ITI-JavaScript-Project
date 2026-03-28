const AUTH_KEY = 'currentUser';

function getCurrentUser() {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function requireAuth(redirectPath) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = redirectPath || 'login.html';
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

function handleLogout() {
    logout();
}
