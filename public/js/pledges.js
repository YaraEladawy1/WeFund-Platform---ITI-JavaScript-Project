const BASE_URL = window.WEFUND_API || window.location.origin;

const raw = localStorage.getItem('currentUser');
const user = raw ? JSON.parse(raw) : null;

if (!user) {
    window.location.href = 'login.html';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

function escapeHtml(str) {
    if (str == null) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

async function loadProfile() {
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    if (nameEl) nameEl.value = user.name || '';
    if (emailEl) emailEl.value = user.email || '';
}

async function loadPledges() {
    const pledgesDiv = document.getElementById('pledges');
    const res = await fetch(`${BASE_URL}/pledges?userId=${encodeURIComponent(user.id)}`);
    const data = await res.json();
    if (!data.length) {
        pledgesDiv.innerHTML = '<p>No donations yet.</p>';
        return;
    }
    pledgesDiv.innerHTML = data
        .map((p) => `<p>You donated <strong>$${Number(p.amount).toLocaleString()}</strong> to campaign ${escapeHtml(p.campaignId)}</p>`)
        .join('');
}

async function loadCreatedCampaigns() {
    const wrap = document.getElementById('dashboardCampaigns');
    const res = await fetch(`${BASE_URL}/campaigns?creatorId=${encodeURIComponent(user.id)}`);
    const data = await res.json();
    if (!data.length) {
        wrap.innerHTML = '<p>You have not created campaigns yet.</p>';
        return;
    }
    wrap.innerHTML = data.map((c) => `
        <div class="card">
            <img src="${window.wefundImageSrc(c.image)}" class="card-img" alt="" onerror="wefundImgFallback(this)">
            <div class="card-content">
                <h3>${escapeHtml(c.title)}</h3>
                <p>Status: ${c.isApproved ? 'Approved' : 'Pending'}<br>Goal: $${Number(c.goal).toLocaleString()}</p>
                <div style="display:flex;gap:8px;">
                    <a href="edit-campaign.html?id=${encodeURIComponent(c.id)}" class="view-link">Update Campaign</a>
                    <a href="campaign-details.html?id=${encodeURIComponent(c.id)}" class="view-link">Open</a>
                </div>
            </div>
        </div>
    `).join('');
}

const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const profileMessage = document.getElementById('profileMessage');
        const name = document.getElementById('profileName').value.trim();
        const email = document.getElementById('profileEmail').value.trim();
        const password = document.getElementById('profilePassword').value.trim();

        if (!name || !email) {
            profileMessage.textContent = 'Name and email are required.';
            return;
        }

        const patch = { name, email };
        if (password) patch.password = password;

        try {
            const res = await fetch(`${BASE_URL}/users/${encodeURIComponent(user.id)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch)
            });
            if (!res.ok) {
                profileMessage.textContent = 'Profile update failed.';
                return;
            }
            const updated = await res.json();
            localStorage.setItem('currentUser', JSON.stringify(window.wefundSanitizeClientUser(updated)));
            profileMessage.textContent = 'Profile updated successfully.';
            document.getElementById('profilePassword').value = '';
        } catch {
            profileMessage.textContent = 'Profile update failed.';
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadPledges();
    await loadCreatedCampaigns();
});
