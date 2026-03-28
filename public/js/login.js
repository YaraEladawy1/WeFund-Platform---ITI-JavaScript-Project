const BASE_URL = window.WEFUND_API || window.location.origin;

function getCampaignsUrl() {
    if (window.location.protocol === 'file:') return 'campaigns.html';
    return `${window.location.origin}/pages/campaigns.html`;
}

async function handleLogin() {
    const emailVal = document.getElementById('email').value.trim();
    const passVal = document.getElementById('password').value.trim();

    if (!emailVal || !passVal) {
        alert('Please enter email and password!');
        return;
    } 

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailVal, password: passVal })
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            alert(data.message || 'Invalid email or password!');
            return;
        }

        localStorage.setItem(
            'currentUser',
            JSON.stringify(window.wefundSanitizeClientUser(data.user))
        );
        const target = getCampaignsUrl();
        window.location.assign(target);
        // Hard fallback in case browser ignores the first navigation call.
        setTimeout(() => {
            if (!window.location.href.includes('/pages/campaigns.html')) {
                window.location.replace(target);
            }
        }, 100);
    } catch (err) {
        console.error(err);
        alert('Login failed. Is the server running?');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
});
