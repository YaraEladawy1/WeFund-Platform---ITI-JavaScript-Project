const BASE_URL = window.WEFUND_API || window.location.origin;

function getCampaignsUrl() {
    if (window.location.protocol === 'file:') return 'campaigns.html';
    return `${window.location.origin}/pages/campaigns.html`;
}

async function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPass').value.trim();

    if (!name || !email || !password) {
        alert('Please fill all fields!');
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role: 'user', isActive: true })
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            alert(data.message || 'Registration failed.');
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(window.wefundSanitizeClientUser(data)));
        const target = getCampaignsUrl();
        window.location.assign(target);
        setTimeout(() => {
            if (!window.location.href.includes('/pages/campaigns.html')) {
                window.location.replace(target);
            }
        }, 100);
    } catch (err) {
        console.error(err);
        alert('Server error. Run npm start in the project folder.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleRegister();
        });
    }
});
