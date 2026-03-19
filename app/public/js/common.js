const API_BASE = "/api";

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

function showLoading(el) {
    el.innerHTML = '<div class="loading">Loading...</div>';
}

function showError(el, msg) {
    el.innerHTML = `<div class="error">${msg}</div>`;
}

function formatNumber(n) {
    return n ? n.toLocaleString() : "0";
}
