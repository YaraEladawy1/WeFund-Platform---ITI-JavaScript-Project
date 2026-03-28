const BASE_URL = window.WEFUND_API || window.location.origin;

const raw = localStorage.getItem('currentUser');
if (!raw) {
    window.location.href = 'login.html';
}
const user = JSON.parse(raw);

function escapeHtml(str) {
    if (str == null) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

function cardTemplate(c) {
    const statusClass = c.isApproved ? 'approved' : 'pending';
    const statusText = c.isApproved ? 'Approved' : 'Pending';
    const src = window.wefundImageSrc(c.image);

    return `
    <div class="card">
        <img src="${src}" class="card-img" alt="" onerror="wefundImgFallback(this)">
        <div class="card-content">
            <div class="status-badge ${statusClass}">${statusText}</div>
            <h3>${escapeHtml(c.title)}</h3>
            <p>Goal: <strong>$${Number(c.goal).toLocaleString()}</strong><br>Deadline: ${escapeHtml(c.deadline || '—')}</p>
            <div class="card-actions" style="display:flex;flex-wrap:wrap;gap:8px;">
                <a href="campaign-details.html?id=${encodeURIComponent(c.id)}" class="view-link">View</a>
                <a href="edit-campaign.html?id=${encodeURIComponent(c.id)}" class="view-link">Update</a>
                <button type="button" class="delete-btn" onclick="deleteCampaign('${String(c.id).replace(/'/g, "\\'")}')">Delete</button>
            </div>
        </div>
    </div>`;
}

async function loadMyCampaigns() {
    const approvedGrid = document.getElementById('approvedCampaignsGrid');
    const pendingGrid = document.getElementById('pendingCampaignsGrid');
    try {
        const res = await fetch(`${BASE_URL}/campaigns?creatorId=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        const approved = data.filter((c) => c.isApproved === true);
        const pending = data.filter((c) => c.isApproved !== true);

        approvedGrid.innerHTML = approved.length ? approved.map(cardTemplate).join('') : '<p>No approved campaigns yet.</p>';
        pendingGrid.innerHTML = pending.length ? pending.map(cardTemplate).join('') : '<p>No pending campaigns.</p>';
    } catch (err) {
        console.error(err);
        approvedGrid.innerHTML = '<p>Could not load campaigns.</p>';
        pendingGrid.innerHTML = '<p>Could not load campaigns.</p>';
    }
}

window.deleteCampaign = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    try {
        const res = await fetch(`${BASE_URL}/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!res.ok) {
            alert('Delete failed.');
            return;
        }
        loadMyCampaigns();
    } catch {
        alert('Delete failed.');
    }
};

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

document.addEventListener('DOMContentLoaded', loadMyCampaigns);
