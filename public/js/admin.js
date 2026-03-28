const BASE_URL = window.WEFUND_API || window.location.origin;

const raw = localStorage.getItem('currentUser');
const user = raw ? JSON.parse(raw) : null;
const box = document.getElementById('adminData');

if (!user || user.role !== 'admin') {
    box.innerHTML = '<p>Access denied. Please login as admin.</p>';
}

function escapeHtml(str) {
    if (str == null) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

async function loadUsers() {
    if (!user || user.role !== 'admin') return;
    const res = await fetch(`${BASE_URL}/users`);
    const users = await res.json();
    box.innerHTML = `
        <h3>Users</h3>
        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">ID</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">Name</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">Email</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">Role</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${users.map((u) => `
                <tr>
                    <td style="padding:8px;">${escapeHtml(u.id)}</td>
                    <td style="padding:8px;">${escapeHtml(u.name)}</td>
                    <td style="padding:8px;">${escapeHtml(u.email)}</td>
                    <td style="padding:8px;">${escapeHtml(u.role || 'user')}</td>
                    <td style="padding:8px;">
                        ${u.role === 'admin' ? '-' : `<button onclick="banUser('${escapeHtml(u.id)}')">Ban</button>`}
                    </td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

window.banUser = async (id) => {
    if (!confirm('Ban this user?')) return;
    await fetch(`${BASE_URL}/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false })
    });
    loadUsers();
};

async function loadCampaigns() {
    if (!user || user.role !== 'admin') return;
    const res = await fetch(`${BASE_URL}/campaigns`);
    const campaigns = await res.json();
    box.innerHTML = `
        <h3>Campaigns</h3>
        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">ID</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">Title</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">Status</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${campaigns.map((c) => `
                <tr>
                    <td style="padding:8px;">${escapeHtml(c.id)}</td>
                    <td style="padding:8px;">${escapeHtml(c.title)}</td>
                    <td style="padding:8px;">${c.isApproved ? 'Approved' : 'Pending'}</td>
                    <td style="padding:8px;">
                        ${c.isApproved ? '' : `<button onclick="approveCampaign('${escapeHtml(c.id)}')">Approve</button>`}
                        <button onclick="deleteCampaignAdmin('${escapeHtml(c.id)}')">Delete</button>
                    </td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

window.approveCampaign = async (id) => {
    await fetch(`${BASE_URL}/campaigns/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true })
    });
    loadCampaigns();
};

window.deleteCampaignAdmin = async (id) => {
    if (!confirm('Delete campaign?')) return;
    await fetch(`${BASE_URL}/campaigns/${encodeURIComponent(id)}`, { method: 'DELETE' });
    loadCampaigns();
};

async function loadPledges() {
    if (!user || user.role !== 'admin') return;
    const res = await fetch(`${BASE_URL}/pledges`);
    const pledges = await res.json();
    box.innerHTML = `
        <h3>Pledges</h3>
        <table style="width:100%;border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">ID</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">Campaign</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">User</th>
                    <th style="text-align:left;border-bottom:1px solid #ddd;padding:8px;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${pledges.map((p) => `
                <tr>
                    <td style="padding:8px;">${escapeHtml(p.id)}</td>
                    <td style="padding:8px;">${escapeHtml(p.campaignId)}</td>
                    <td style="padding:8px;">${escapeHtml(p.userId || '-')}</td>
                    <td style="padding:8px;">$${Number(p.amount).toLocaleString()}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
