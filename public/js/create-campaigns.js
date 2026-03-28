const BASE_URL = window.WEFUND_API || window.location.origin;

const raw = localStorage.getItem('currentUser');
if (!raw) {
    window.location.href = 'login.html';
}
const currentUser = JSON.parse(raw);

function readImageAsBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Please choose an image file.'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read file.'));
        reader.readAsDataURL(file);
    });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

const createCampaignForm = document.getElementById('createCampaignForm');
if (createCampaignForm) {
    createCampaignForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const goal = parseFloat(document.getElementById('goal').value);
        const description = document.getElementById('description').value.trim();
        const deadline = document.getElementById('deadline').value;
        const category = document.getElementById('category').value;
        const imageFile = document.getElementById('imageFile').files[0];

        if (!title || !goal || !description || !deadline || !category) {
            alert('Please fill out all fields.');
            return;
        }
        if (!imageFile) {
            alert('Please choose a cover image.');
            return;
        }

        let image;
        try {
            image = await readImageAsBase64(imageFile);
        } catch (err) {
            alert(err.message || 'Invalid image.');
            return;
        }

        const campaign = {
            id: `c${Date.now()}`,
            title,
            description,
            goal,
            raised: 0,
            deadline,
            category,
            image,
            creatorId: String(currentUser.id),
            isApproved: currentUser.role === 'admin'
        };

        try {
            const res = await fetch(`${BASE_URL}/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaign)
            });
            if (!res.ok) {
                alert('Could not create campaign.');
                return;
            }
            if (currentUser.role === 'admin') {
                alert('Campaign created successfully and published.');
            } else {
                alert('Your campaign was created successfully and is waiting for approval.');
            }
            window.location.href = 'my-campaigns.html';
        } catch (err) {
            console.error(err);
            alert('Server error. Is WeFund running?');
        }
    });
}
