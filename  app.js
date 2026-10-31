/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyB2y89DQ-R6OGX2mfqGMDj-JyTsF7cNFXM",
  authDomain: "live-rdx.firebaseapp.com",
  databaseURL: "https://live-rdx-default-rtdb.firebaseio.com",
  projectId: "live-rdx",
  storageBucket: "live-rdx.firebasestorage.app",
  messagingSenderId: "692994664561",
  appId: "1:692994664561:web:b77ee7cfa66d1298cd13d0",
  measurementId: "G-YBJLG84N38"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ================= HELPERS ================= */
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

function generateRDXID() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'RDX-';
  for (let i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)];
  s += '-';
  for (let i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

let currentUserData = null;

/* ================= AUTH STATE ================= */
auth.onAuthStateChanged(async (user) => {
  const loginView = document.getElementById('loginView');
  const certView = document.getElementById('certView');
  const navActions = document.getElementById('navActions');

  if (user) {
    loginView.style.display = 'none';
    certView.classList.add('show');
    navActions.innerHTML =
      '<div class="user-chip"><img src="' + (user.photoURL || 'logo.png') + '" alt="">' +
      (user.displayName || user.email) + '</div>' +
      '<button class="btn btn-ghost" onclick="logout()">Logout</button>';

    const ref = db.collection('rdx_users').doc(user.uid);
    const doc = await ref.get();
    let code;
    if (!doc.exists) {
      code = generateRDXID();
      await ref.set({
        email: user.email,
        name: user.displayName || 'RDX Member',
        authCode: code,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      code = doc.data().authCode;
    }
    currentUserData = {
      name: doc.exists ? (doc.data().name || user.email) : (user.displayName || user.email),
      email: user.email,
      authCode: code
    };
    document.getElementById('authCodeDisplay').textContent = code;
    renderPreview();
  } else {
    currentUserData = null;
    loginView.style.display = 'block';
    certView.classList.remove('show');
    navActions.innerHTML =
      '<a href="#projects" class="btn btn-ghost">Projects</a>' +
      '<a href="#badge" class="btn btn-primary">Get Badge</a>';
  }
});

/* ================= LOGIN HANDLERS ================= */
document.getElementById('googleLoginBtn').addEventListener('click', async () => {
  try {
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    showToast('✅ Logged in with Google');
  } catch (e) { showToast('❌ ' + e.message); }
});

document.getElementById('emailLoginBtn').addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value.trim();
  const pwd = document.getElementById('passwordInput').value;
  if (!email || pwd.length < 6) return showToast('⚠️ Enter valid email & 6+ chars');
  try {
    await auth.signInWithEmailAndPassword(email, pwd);
    showToast('✅ Logged in');
  } catch (e) { showToast('❌ ' + e.message); }
});

document.getElementById('emailSignupBtn').addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value.trim();
  const pwd = document.getElementById('passwordInput').value;
  if (!email || pwd.length < 6) return showToast('⚠️ Enter valid email & 6+ chars');
  try {
    await auth.createUserWithEmailAndPassword(email, pwd);
    showToast('🎉 Account created');
  } catch (e) { showToast('❌ ' + e.message); }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  auth.signOut(); showToast('👋 Logged out');
});

function logout() { auth.signOut(); showToast('👋 Logged out'); }
window.logout = logout;

/* ================= BADGE DRAW ================= */
function drawBadge(canvas, name, code, email) {
  const W = 600, H = 360;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0a0e1a'); g.addColorStop(1, '#111827');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  const bar = ctx.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, '#00e5ff'); bar.addColorStop(0.5, '#00bcd4'); bar.addColorStop(1, '#00e5ff');
  ctx.fillStyle = bar; ctx.fillRect(0, 0, W, 6); ctx.fillRect(0, H - 6, W, 6);

  ctx.strokeStyle = 'rgba(0,229,255,0.35)'; ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  ctx.save();
  ctx.translate(W/2, H/2); ctx.rotate(-0.25);
  ctx.font = '900 160px Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(0,229,255,0.04)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('RDX', 0, 0);
  ctx.restore();

  const cx = W/2, cy = 62, r = 28;
  const lg = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  lg.addColorStop(0, '#00e5ff'); lg.addColorStop(1, '#008fa8');
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = lg; ctx.fill();
  ctx.font = '900 20px Segoe UI, sans-serif'; ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('RDX', cx, cy + 1);

  ctx.font = '900 18px Segoe UI, sans-serif'; ctx.fillStyle = '#00e5ff';
  ctx.fillText('RDX · VERIFIED', W/2, 108);

  const yy = 145;
  ctx.beginPath(); ctx.arc(W/2, yy, 20, 0, Math.PI * 2);
  ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = 'rgba(0,229,255,0.1)'; ctx.fill();
  ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(W/2 - 9, yy); ctx.lineTo(W/2 - 3, yy + 6); ctx.lineTo(W/2 + 9, yy - 7);
  ctx.stroke();

  ctx.font = '800 20px Segoe UI, sans-serif'; ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  let n = name || 'RDX Member';
  if (n.length > 28) n = n.slice(0, 26) + '…';
  ctx.fillText(n, W/2, 195);

  ctx.font = '500 11px Segoe UI, sans-serif'; ctx.fillStyle = '#64748b';
  ctx.fillText((email || '').slice(0, 44), W/2, 212);

  ctx.font = '700 9px Segoe UI, sans-serif'; ctx.fillStyle = '#64748b';
  ctx.fillText('UNIQUE RDX ID', W/2, 240);

  const iw = 230, ih = 44, ix = (W - iw)/2, iy = 248;
  ctx.fillStyle = 'rgba(0,229,255,0.08)'; ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  roundRect(ctx, ix, iy, iw, ih, 8); ctx.fill(); ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '800 20px Courier New, monospace'; ctx.fillStyle = '#00e5ff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(code, W/2, iy + ih/2 + 1);

  ctx.font = '600 10px Segoe UI, sans-serif'; ctx.fillStyle = '#475569';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Verified by RDX · rdx.is-a.dev', W/2, H - 22);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function renderPreview() {
  if (!currentUserData) return;
  const holder = document.getElementById('previewCanvasHolder');
  holder.innerHTML = '';
  const c = document.createElement('canvas');
  c.style.maxWidth = '100%';
  drawBadge(c, currentUserData.name, currentUserData.authCode, currentUserData.email);
  holder.appendChild(c);
}

/* ================= FORMAT BUTTONS ================= */
document.querySelectorAll('.format-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!currentUserData) return showToast('⚠️ Please login first');
    const fmt = btn.dataset.format;
    if (fmt === 'png') downloadPNG();
    else if (fmt === 'pdf') downloadPDF();
    else if (fmt === 'html') downloadHTML();
    else if (fmt === 'svg') downloadSVG();
  });
});

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ---- PNG ---- */
function downloadPNG() {
  const c = document.createElement('canvas');
  drawBadge(c, currentUserData.name, currentUserData.authCode, currentUserData.email);
  c.toBlob(blob => {
    triggerDownload(URL.createObjectURL(blob), 'rdx-badge-' + currentUserData.authCode + '.png');
    showToast('✅ PNG downloaded');
  }, 'image/png');
}

/* ---- PDF ---- */
function downloadPDF() {
  const c = document.createElement('canvas');
  drawBadge(c, currentUserData.name, currentUserData.authCode, currentUserData.email);
  const imgData = c.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [600, 360] });
  pdf.addImage(imgData, 'PNG', 0, 0, 600, 360);
  pdf.save('rdx-badge-' + currentUserData.authCode + '.pdf');
  showToast('✅ PDF downloaded');
}

/* ---- SVG ---- */
function downloadSVG() {
  const name = (currentUserData.name || 'RDX Member').slice(0, 26);
  const code = currentUserData.authCode;
  const email = (currentUserData.email || '').slice(0, 44);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0e1a"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00e5ff"/>
      <stop offset="50%" stop-color="#00bcd4"/>
      <stop offset="100%" stop-color="#00e5ff"/>
    </linearGradient>
    <linearGradient id="logo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00e5ff"/>
      <stop offset="100%" stop-color="#008fa8"/>
    </linearGradient>
  </defs>

  <rect width="600" height="360" fill="url(#bg)"/>
  <rect x="0" y="0" width="600" height="6" fill="url(#bar)"/>
  <rect x="0" y="354" width="600" height="6" fill="url(#bar)"/>
  <rect x="10" y="10" width="580" height="340" fill="none" stroke="#00e5ff" stroke-opacity="0.35" stroke-width="1.5"/>

  <text x="300" y="200" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="160" font-weight="900" fill="#00e5ff" fill-opacity="0.04" transform="rotate(-15 300 180)">RDX</text>

  <circle cx="300" cy="62" r="28" fill="url(#logo)"/>
  <text x="300" y="69" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="20" font-weight="900" fill="#fff">RDX</text>

  <text x="300" y="108" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="18" font-weight="900" fill="#00e5ff">RDX · VERIFIED</text>

  <circle cx="300" cy="145" r="20" fill="#00e5ff" fill-opacity="0.1" stroke="#00e5ff" stroke-width="2.5"/>
  <polyline points="291,145 297,151 309,138" fill="none" stroke="#00e5ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

  <text x="300" y="200" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="20" font-weight="800" fill="#fff">${name}</text>
  <text x="300" y="217" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="11" fill="#64748b">${email}</text>
  <text x="300" y="245" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="9" font-weight="700" fill="#64748b">UNIQUE RDX ID</text>

  <rect x="185" y="252" width="230" height="44" rx="8" fill="#00e5ff" fill-opacity="0.08" stroke="#00e5ff" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="300" y="280" text-anchor="middle" font-family="Courier New, monospace" font-size="20" font-weight="800" fill="#00e5ff">${code}</text>

  <text x="300" y="338" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="10" font-weight="600" fill="#475569">Verified by RDX · rdx.is-a.dev</text>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  triggerDownload(URL.createObjectURL(blob), 'rdx-badge-' + code + '.svg');
  showToast('✅ SVG downloaded');
}

/* ---- HTML WIDGET ---- */
function downloadHTML() {
  const name = (currentUserData.name || 'RDX Member');
  const code = currentUserData.authCode;
  const email = (currentUserData.email || '');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verified by RDX · ${code}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #0a0e1a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .rdx-floating-badge {
    position: fixed; bottom: 22px; right: 22px;
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, #00e5ff, #00bcd4);
    color: #06202a; padding: 12px 20px; border-radius: 50px;
    font-weight: 800; font-size: 13px; letter-spacing: 0.5px;
    text-decoration: none; box-shadow: 0 8px 26px rgba(0,229,255,0.45);
    z-index: 9999; transition: 0.25s; border: 2px solid rgba(255,255,255,0.3);
  }
  .rdx-floating-badge:hover { transform: translateY(-3px) scale(1.04); box-shadow: 0 14px 34px rgba(0,229,255,0.6); }
  .rdx-floating-badge .pulse { width: 9px; height: 9px; border-radius: 50%; background: #06202a; animation: rdxPulse 1.6s infinite; }
  @keyframes rdxPulse { 0% { box-shadow: 0 0 0 0 rgba(6,32,42,0.7); } 70% { box-shadow: 0 0 0 10px rgba(6,32,42,0); } 100% { box-shadow: 0 0 0 0 rgba(6,32,42,0); } }

  .rdx-card {
    background: #111827; border: 1px solid #1e293b; border-radius: 18px;
    padding: 40px 32px; max-width: 440px; width: 100%; text-align: center;
    position: relative; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }
  .rdx-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #00e5ff, #00bcd4, #00e5ff); }
  .rdx-logo { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #00e5ff, #008fa8); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 18px; margin: 0 auto 12px; box-shadow: 0 6px 18px rgba(0,229,255,0.4); }
  .rdx-brand { font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #00e5ff; margin-bottom: 4px; }
  .rdx-title { font-size: 11px; letter-spacing: 3px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 18px; }
  .rdx-check { width: 66px; height: 66px; border-radius: 50%; background: rgba(0,229,255,0.1); border: 2px solid #00e5ff; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: #00e5ff; font-size: 30px; }
  .rdx-name { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 4px; }
  .rdx-email { font-size: 12px; color: #64748b; margin-bottom: 22px; }
  .rdx-label { font-size: 10px; letter-spacing: 3px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 8px; }
  .rdx-code { font-family: 'Courier New', monospace; font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #00e5ff; background: rgba(0,229,255,0.07); border: 1.5px dashed #00e5ff; padding: 14px; border-radius: 10px; margin-bottom: 20px; word-break: break-all; }
  .rdx-footer { font-size: 11px; color: #475569; border-top: 1px solid #1e293b; padding-top: 16px; }
  .rdx-footer a { color: #00e5ff; text-decoration: none; font-weight: 700; }
</style>
</head>
<body>
  <a href="https://rdx.is-a.dev" target="_blank" rel="noopener" class="rdx-floating-badge">
    <span class="pulse"></span> Verified by RDX
  </a>
  <div class="rdx-card">
    <div class="rdx-logo">R</div>
    <div class="rdx-brand">RDX</div>
    <div class="rdx-title">Verified Member</div>
    <div class="rdx-check">✓</div>
    <div class="rdx-name">${name}</div>
    <div class="rdx-email">${email}</div>
    <div class="rdx-label">Unique RDX ID</div>
    <div class="rdx-code">${code}</div>
    <div class="rdx-footer">Verified by <a href="https://rdx.is-a.dev" target="_blank">rdx.is-a.dev</a></div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  triggerDownload(URL.createObjectURL(blob), 'rdx-verified-badge-' + code + '.html');
  showToast('✅ HTML widget downloaded');
}