const BASE_URL = window.WEFUND_API || window.location.origin;

function escapeHtml(str) {
    if (str == null) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

function buildCampaignsQuery() {
    const params = new URLSearchParams();
    params.set('isApproved', 'true');
    params.set('_sort', 'deadline');
    params.set('_order', 'asc');

    const searchEl = document.getElementById('searchInput');
    const catEl = document.getElementById('filterCategory');
    if (searchEl && searchEl.value.trim()) {
        params.set('q', searchEl.value.trim());
    }
    if (catEl && catEl.value && catEl.value !== 'all') {
        params.set('category', catEl.value);
    }
    return params.toString();
}

document.addEventListener('DOMContentLoaded', () => {
    loadCampaigns();

    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');

    if (searchInput) searchInput.addEventListener('input', () => loadCampaigns());
    if (filterCategory) filterCategory.addEventListener('change', () => loadCampaigns());
});

async function loadCampaigns() {
    const container = document.getElementById('campaignsContainer');
    if (!container) return;

    try {
        const qs = buildCampaignsQuery();
        const response = await fetch(`${BASE_URL}/campaigns?${qs}`);
        let data = await response.json();
        data = data.filter((c) => c.isApproved === true);
        renderCampaigns(data);
    } catch (error) {
        console.error('Error loading campaigns:', error);
        container.innerHTML = '<p>Failed to load campaigns. Start the server with <code>npm start</code>.</p>';
    }
}

function campaignImageSrc(c) {
    return window.wefundImageSrc(c && c.image);
}

function renderCampaigns(campaigns) {
    const container = document.getElementById('campaignsContainer');
    container.innerHTML = '';

    campaigns.forEach((c) => {
        const raised = Number(c.raised || 0);
        const goal = Number(c.goal || 1);
        const progress = Math.min((raised / goal) * 100, 100).toFixed(0);
        const desc = (c.description || '').slice(0, 80);

        const card = document.createElement('div');
        card.className = 'card';
        card.style.background = 'white';
        card.style.borderRadius = '20px';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';

        card.innerHTML = `
            <img src="${campaignImageSrc(c)}" alt="" style="width:100%; height:200px; object-fit:cover;" onerror="wefundImgFallback(this)">
            <div style="padding: 20px;">
                <span class="status-badge approved" style="font-size:0.7rem;">${escapeHtml(c.category || 'cause')}</span>
                <h3 style="margin: 10px 0; color:#023047;">${escapeHtml(c.title)}</h3>
                <p style="color:#6c757d; font-size:0.9rem; margin-bottom:15px;">${escapeHtml(desc)}${desc.length >= 80 ? '…' : ''}</p>

                <div style="background:#eee; height:8px; border-radius:10px; margin-bottom:10px;">
                    <div style="background:#06d6a0; width:${progress}%; height:100%; border-radius:10px;"></div>
                </div>

                <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:15px;">
                    <span><strong>$${raised.toLocaleString()}</strong> raised</span>
                    <span style="color:#6c757d;">Goal: $${goal.toLocaleString()}</span>
                </div>

                <a href="campaign-details.html?id=${encodeURIComponent(c.id)}" class="primary-btn" style="width:100%; text-align:center; padding:10px;">View Details</a>
            </div>
        `;
        container.appendChild(card);
    });
}
