const BASE_URL = window.WEFUND_API || window.location.origin;

const urlParams = new URLSearchParams(window.location.search);
const campaignId = urlParams.get('id');

function escapeHtml(str) {
    if (str == null) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

function campaignImageSrc(c) {
    return window.wefundImageSrc(c && c.image);
}

document.addEventListener('DOMContentLoaded', () => {
    if (!campaignId) {
        const container = document.getElementById('campaignDetailContent');
        if (container) {
            container.innerHTML =
                '<p style="padding:2rem;">No campaign selected. <a href="campaigns.html">Explore campaigns</a>.</p>';
        }
        return;
    }
    loadCampaignDetails();
});

async function loadCampaignDetails() {
    try {
        const res = await fetch(`${BASE_URL}/campaigns/${encodeURIComponent(campaignId)}`);
        if (!res.ok) throw new Error('Not found');
        const c = await res.json();
        let creatorName = 'Organizer';
        if (c.creatorId) {
            const uRes = await fetch(`${BASE_URL}/users/${encodeURIComponent(c.creatorId)}`);
            if (uRes.ok) {
                const u = await uRes.json();
                creatorName = u.name || creatorName;
            }
        }
        renderDetails(c, creatorName);
        loadPledgesForCampaign();
    } catch (err) {
        console.error(err);
        const container = document.getElementById('campaignDetailContent');
        if (container) container.innerHTML = '<p>Could not load this campaign.</p>';
    }
}

function renderDetails(c, creatorName) {
    const raised = Number(c.raised || 0);
    const goal = Number(c.goal || 1);
    const progress = Math.min((raised / goal) * 100, 100).toFixed(0);
    const container = document.getElementById('campaignDetailContent');

    container.innerHTML = `
        <div class="detail-header-wrapper">
            <img src="${campaignImageSrc(c)}" class="detail-banner-img" alt="" onerror="wefundImgFallback(this)">
            <div class="detail-info-side">
                <span class="status-badge approved">${escapeHtml(c.category || '')}</span>
                <h1>${escapeHtml(c.title)}</h1>
                <p>By <strong>${escapeHtml(creatorName)}</strong> · deadline <strong>${escapeHtml(c.deadline || '—')}</strong></p>

                <div class="progress-widget">
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:10px;">
                        <span>$${raised.toLocaleString()} raised</span>
                        <span>Goal: $${goal.toLocaleString()}</span>
                    </div>
                </div>
                <button type="button" onclick="openDonateModal()" class="primary-btn">Support this campaign</button>
            </div>
        </div>
        <div style="background:white; padding:40px; border-radius:30px; margin-top:30px;">
            <h3>About this campaign</h3>
            <p>${escapeHtml(c.description || '')}</p>
        </div>
        <div id="pledgesSection" style="background:white; padding:40px; border-radius:30px; margin-top:24px;">
            <h3>Recent support</h3>
            <div id="pledgesList"><p style="color:#666;">Loading pledges…</p></div>
        </div>
    `;
}

async function loadPledgesForCampaign() {
    const listEl = document.getElementById('pledgesList');
    if (!listEl) return;
    try {
        const res = await fetch(`${BASE_URL}/pledges?campaignId=${encodeURIComponent(campaignId)}`);
        const pledges = await res.json();
        if (!pledges.length) {
            listEl.innerHTML = '<p style="color:#666;">No pledges yet. Be the first to support!</p>';
            return;
        }
        listEl.innerHTML = pledges
            .map(
                (p) =>
                    `<p>$${Number(p.amount).toLocaleString()} pledged · supporter #${escapeHtml(String(p.userId || 'guest'))}</p>`
            )
            .join('');
    } catch {
        listEl.innerHTML = '<p>Could not load pledge list.</p>';
    }
}

window.openDonateModal = () => document.getElementById('donateModal').classList.remove('hidden');
window.closeDonateModal = () => document.getElementById('donateModal').classList.add('hidden');

/** Mock payment: confirmation dialogs only (bonus requirement). */
window.processDonation = async () => {
    const raw = localStorage.getItem('currentUser');
    if (!raw) {
        alert('Please log in to pledge.');
        window.location.href = 'login.html';
        return;
    }
    const u = JSON.parse(raw);
    if (u.isActive === false) {
        alert('Your account is suspended.');
        return;
    }

    const amountEl = document.getElementById('donateAmount');
    const amount = Number(amountEl && amountEl.value);
    if (!Number.isFinite(amount) || amount <= 0) {
        alert('Enter a valid amount.');
        return;
    }

    const step1 = window.confirm(
        `Confirm mock payment of $${amount.toLocaleString()} to this campaign?\n\n(No real money — coursework demo.)`
    );
    if (!step1) return;

    const step2 = window.confirm('Final confirmation: submit this pledge to the server?');
    if (!step2) return;

    try {
        const res = await fetch(`${BASE_URL}/pledges`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount,
                campaignId: String(campaignId),
                userId: String(u.id)
            })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            alert(err.message || 'Pledge failed.');
            return;
        }
        alert('Thank you! Your pledge was recorded.');
        closeDonateModal();
        loadCampaignDetails();
    } catch (e) {
        console.error(e);
        alert('Network error. Is the server running?');
    }
};
