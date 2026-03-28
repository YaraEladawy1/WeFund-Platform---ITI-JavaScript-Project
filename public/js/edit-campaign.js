const BASE_URL = window.WEFUND_API || window.location.origin;

const params = new URLSearchParams(window.location.search);
const editId = params.get('id');

const raw = localStorage.getItem('currentUser');
if (!raw) {
    window.location.href = 'login.html';
}
const currentUser = JSON.parse(raw);

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

function readImageAsBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }
        if (!file.type.startsWith('image/')) {
            reject(new Error('Choose an image file.'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.readAsDataURL(file);
    });
}

async function loadCampaign() {
    if (!editId) {
        document.getElementById('editFormWrap').innerHTML = '<p>Missing campaign id.</p>';
        return;
    }
    try {
        const res = await fetch(`${BASE_URL}/campaigns/${encodeURIComponent(editId)}`);
        if (!res.ok) throw new Error('not found');
        const c = await res.json();
        const isOwner = String(c.creatorId) === String(currentUser.id);
        const isAdmin = currentUser.role === 'admin';
        if (!isOwner && !isAdmin) {
            document.getElementById('editFormWrap').innerHTML = '<p>Not allowed to edit this campaign.</p>';
            return;
        }

        document.getElementById('title').value = c.title || '';
        document.getElementById('goal').value = c.goal != null ? c.goal : '';
        document.getElementById('description').value = c.description || '';
        document.getElementById('deadline').value = c.deadline || '';
        document.getElementById('category').value = c.category || 'community';
    } catch {
        document.getElementById('editFormWrap').innerHTML = '<p>Campaign not found.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadCampaign);

const form = document.getElementById('editCampaignForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!editId) return;

        const title = document.getElementById('title').value.trim();
        const goal = parseFloat(document.getElementById('goal').value);
        const description = document.getElementById('description').value.trim();
        const deadline = document.getElementById('deadline').value;
        const category = document.getElementById('category').value;
        const imageFile = document.getElementById('imageFile').files[0];

        if (!title || !goal || !description || !deadline || !category) {
            alert('Fill all required fields.');
            return;
        }

        const patch = { title, description, goal, deadline, category };
        if (imageFile) {
            try {
                patch.image = await readImageAsBase64(imageFile);
            } catch (err) {
                alert(err.message);
                return;
            }
        }

        try {
            const res = await fetch(`${BASE_URL}/campaigns/${encodeURIComponent(editId)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch)
            });
            if (!res.ok) {
                alert('Update failed.');
                return;
            }
            alert('Campaign updated.');
            window.location.href = `campaign-details.html?id=${encodeURIComponent(editId)}`;
        } catch (err) {
            console.error(err);
            alert('Server error.');
        }
    });
}
