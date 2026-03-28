/**
 * API base URL
 * - file:// -> local JSON server on port 3000
 * - localhost with a non-API port (e.g. Live Server) -> still use port 3000 for /users, /login, etc.
 * - Production: same host as the app (run `npm start` and open the site from that server)
 */
(function () {
    const loc = window.location;
    if (loc.protocol === 'file:') {
        window.WEFUND_API = 'http://localhost:3000';
        return;
    }
    const localHost = loc.hostname === 'localhost' || loc.hostname === '127.0.0.1';
    const apiPort = '3000';
    if (localHost && loc.port && loc.port !== apiPort) {
        window.WEFUND_API = loc.protocol + '//' + loc.hostname + ':' + apiPort;
        return;
    }
    window.WEFUND_API = loc.origin;
})();

/** Local placeholder (via.placeholder.com is often unreachable). */
window.wefundPlaceholderImg = function () {
    const loc = window.location;
    if (loc.protocol === 'file:') {
        return new URL('../images/campaign-placeholder.svg', loc.href).href;
    }
    return loc.origin + '/images/campaign-placeholder.svg';
};

/** Normalize campaign image URL; empty remote failures fall back in onerror. */
window.wefundImageSrc = function (raw) {
    const ph = window.wefundPlaceholderImg();
    if (raw == null || String(raw).trim() === '') return ph;
    const s = String(raw);
    if (s.startsWith('data:')) return s;
    return s;
};

window.wefundImgFallback = function (el) {
    if (!el || el.nodeName !== 'IMG') return;
    el.onerror = null;
    el.src = window.wefundPlaceholderImg();
};

/** Remove secrets before storing user in localStorage (defense in depth). */
window.wefundSanitizeClientUser = function (user) {
    if (!user || typeof user !== 'object') return user;
    const out = { ...user };
    delete out.password;
    delete out.pass;
    return out;
};
