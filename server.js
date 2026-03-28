const jsonServer = require('json-server');
const path = require('path');
const app = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const PORT = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

app.use(middlewares);
app.use(jsonServer.bodyParser);

function normalizeEmail(email) {
    if (email == null || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
}

function normalizePassword(password) {
    if (password == null) return '';
    return String(password).trim();
}

function sanitizeUser(user) {
    if (!user || typeof user !== 'object') return null;
    const { password: _p, pass: _pass, ...safe } = user;
    return safe;
}

function findUserByEmail(db, email) {
    const target = normalizeEmail(email);
    if (!target) return null;
    const users = db.get('users').value() || [];
    return users.find((u) => normalizeEmail(u.email) === target) || null;
}

function userPasswordMatch(user, password) {
    if (!user || password == null) return false;
    const stored = user.password != null ? user.password : user.pass;
    const incoming = normalizePassword(password);
    return String(stored) === String(incoming);
}

// POST /users — spec: register via JSON Server (before router so we can enforce unique email)
app.post('/users', (req, res) => {
    const { email, password, name, role } = req.body || {};
    const emailNorm = normalizeEmail(email);
    const passNorm = normalizePassword(password);
    const nameTrim = typeof name === 'string' ? name.trim() : '';
    if (!emailNorm || !passNorm || !nameTrim) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const db = router.db;
    if (findUserByEmail(db, emailNorm)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = {
        id: String(Date.now()),
        email: emailNorm,
        password: passNorm,
        name: nameTrim,
        role: role === 'admin' ? 'admin' : 'user',
        isActive: true
    };
    db.get('users').push(newUser).write();
    res.status(201).json(sanitizeUser(newUser));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body || {};
    const passNorm = normalizePassword(password);
    if (!normalizeEmail(email) || !passNorm) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    const db = router.db;
    const found = findUserByEmail(db, email);

    if (found && userPasswordMatch(found, passNorm)) {
        if (found.isActive === false) {
            return res.status(403).json({ message: 'This account has been suspended.' });
        }
        return res.json({ user: sanitizeUser(found) });
    }
    res.status(401).json({ message: 'Invalid email or password' });
});

app.post('/pledges', (req, res) => {
    const { amount, campaignId, userId } = req.body || {};
    const amountNum = Number(amount);
    if (!campaignId || !Number.isFinite(amountNum) || amountNum <= 0) {
        return res.status(400).json({ message: 'Valid amount and campaignId are required' });
    }
    const db = router.db;
    const campaign = db.get('campaigns').find({ id: String(campaignId) }).value();
    if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
    }

    const pledge = {
        id: String(Date.now()),
        amount: amountNum,
        campaignId: String(campaignId),
        userId: userId != null ? String(userId) : null
    };
    db.get('pledges').push(pledge).write();

    const raised = Number(campaign.raised || 0) + amountNum;
    db.get('campaigns')
        .find({ id: String(campaignId) })
        .assign({ raised })
        .write();

    res.status(201).json(pledge);
});

app.use(router);

app.listen(PORT, () => {
    console.log(`WeFund API + static files → http://localhost:${PORT}`);
    console.log(`Open the app: http://localhost:${PORT}/pages/index.html`);
});
