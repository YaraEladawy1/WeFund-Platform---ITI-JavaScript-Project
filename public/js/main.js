function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
