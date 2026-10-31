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
      authCode: code,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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

/* ================= IMAGE LOADER (For Canvas) ================= */
function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // Agar image na mile toh null dega
    img.src = src;
  });
}

/* ================= BADGE DRAW (White Certificate Theme) ================= */
async function drawBadge(canvas, name, code, email, date) {
  const W = 800, H = 600; // Thoda bada size taaki text aur images clear dikhe
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 1. Background (Solid White)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // 2. Border (Cyan & Gold style)
  ctx.strokeStyle = '#00bcd4'; 
  ctx.lineWidth = 8;
  ctx.strokeRect(15, 15, W - 30, H - 30);
  
  ctx.strokeStyle = '#0f1a2b'; 
  ctx.lineWidth = 1.5;
  ctx.strokeRect(28, 28, W - 56, H - 56);

  // 3. Watermark (Faint RDX text)
  ctx.save();
  ctx.translate(W/2, H/2); ctx.rotate(-0.2);
  ctx.font = '900 200px Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(0, 188, 212, 0.04)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('RDX', 0, 0);
  ctx.restore();

  // Load Images
  const logoImg = await loadImage('logo.png');
  const signImg = await loadImage('sign.png');
  const stampImg = await loadImage('stamp.png');

  // 4. Header - Logo Image
  if (logoImg) {
    ctx.drawImage(logoImg, W/2 - 40, 50, 80, 80);
  } else {
    // Fallback if logo missing
    ctx.beginPath(); ctx.arc(W/2, 90, 40, 0, Math.PI*2); 
    ctx.fillStyle = '#00bcd4'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif'; 
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('RDX', W/2, 90);
  }

  // Title
  ctx.fillStyle = '#0f1a2b';
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px Times New Roman, serif';
  ctx.fillText('CERTIFICATE OF VERIFIED OWNERSHIP', W/2, 165);

  ctx.fillStyle = '#00bcd4';
  ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('OFFICIAL RDX ECOSYSTEM LICENSE', W/2, 185);

  // 5. Certificate ID (Top Right)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = '11px Courier New, monospace';
  ctx.fillText('CERTIFICATE ID: ' + code, W - 50, 60);
  ctx.fillText('DATE OF ISSUE: ' + date, W - 50, 75);

  // 6. Main Content Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('This official document certifies that', W/2, 230);

  // Name
  ctx.fillStyle = '#0f1a2b';
  ctx.font = 'bold 36px Times New Roman, serif';
  ctx.fillText(name, W/2, 275);

  // Line under name
  const nameWidth = ctx.measureText(name).width;
  ctx.beginPath();
  ctx.moveTo(W/2 - nameWidth/2 - 20, 285);
  ctx.lineTo(W/2 + nameWidth/2 + 20, 285);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Subtext
  ctx.fillStyle = '#334155';
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('has successfully verified their identity and is an absolute,', W/2, 315);
  ctx.fillText('authorized member of the RDX global network.', W/2, 335);

  // Domain Highlight
  ctx.fillStyle = '#007a8a';
  ctx.font = 'bold 22px Courier New, monospace';
  ctx.fillText('rdx.is-a.dev', W/2, 375);

  // 7. Terms (Small text at bottom)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Arial, sans-serif';
  ctx.fillText('TERMS & CONDITIONS:', 60, 420);
  ctx.fillText('1. This badge is digital proof of association with RDX. It does not grant legal ownership of the domain.', 60, 435);
  ctx.fillText('2. The Unique ID printed above is strictly linked to the user account. Misuse or forging is prohibited.', 60, 450);
  ctx.fillText('3. The user agrees to promote the RDX brand positively. The badge must link back to rdx.is-a.dev.', 60, 465);

  // 8. Footer Section (Sign & Stamp)
  // Signature (Left)
  if (signImg) {
    ctx.drawImage(signImg, 120, 480, 140, 50); // adjust x, y, width, height as needed
  }
  ctx.beginPath();
  ctx.moveTo(100, 540); ctx.lineTo(280, 540);
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b'; ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('AUTHORIZED SIGNATORY', 190, 555);

  // Stamp (Right)
  if (stampImg) {
    ctx.drawImage(stampImg, W - 260, 460, 120, 120); // adjust x, y, width, height as needed
  }
  ctx.beginPath();
  ctx.moveTo(W - 280, 540); ctx.lineTo(W - 100, 540);
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#64748b'; ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('OFFICIAL SEAL', W - 190, 555);

  // Very Bottom Text
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '9px Courier New, monospace';
  ctx.fillText('VERIFIED BY RDX SYSTEM · ' + code, W/2, 580);
}

/* ================= PREVIEW RENDERER ================= */
async function renderPreview() {
  if (!currentUserData) return;
  const holder = document.getElementById('previewCanvasHolder');
  holder.innerHTML = '<div style="color:#94a3b8;font-size:12px;">Loading preview...</div>';
  
  const c = document.createElement('canvas');
  c.style.maxWidth = '100%';
  c.style.height = 'auto';
  c.style.borderRadius = '8px';
  c.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  
  // Await drawing images
  await drawBadge(c, currentUserData.name, currentUserData.authCode, currentUserData.email, currentUserData.date);
  
  holder.innerHTML = '';
  holder.appendChild(c);
}

/* ================= FORMAT BUTTONS ================= */
document.querySelectorAll('.format-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!currentUserData) return showToast('⚠️ Please login first');
    const fmt = btn.dataset.format;
    
    // Create a high-res canvas for downloading
    const c = document.createElement('canvas');
    await drawBadge(c, currentUserData.name, currentUserData.authCode, currentUserData.email, currentUserData.date);
    
    if (fmt === 'png') downloadPNG(c);
    else if (fmt === 'pdf') downloadPDF(c);
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
function downloadPNG(canvas) {
  canvas.toBlob(blob => {
    triggerDownload(URL.createObjectURL(blob), 'rdx-cert-' + currentUserData.authCode + '.png');
    showToast('✅ PNG downloaded');
  }, 'image/png');
}

/* ---- PDF ---- */
function downloadPDF(canvas) {
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  // A4 Landscape size roughly proportional
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
  pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
  pdf.save('rdx-cert-' + currentUserData.authCode + '.pdf');
  showToast('✅ PDF downloaded');
}

/* ---- SVG ---- */
function downloadSVG() {
  const name = (currentUserData.name || 'RDX Member');
  const code = currentUserData.authCode;
  const email = (currentUserData.email || '');
  const date = currentUserData.date;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#ffffff"/>
    <rect x="15" y="15" width="770" height="570" fill="none" stroke="#00bcd4" stroke-width="8"/>
    <rect x="28" y="28" width="744" height="544" fill="none" stroke="#0f1a2b" stroke-width="1.5"/>
    
    <!-- Header -->
    <image href="logo.png" x="360" y="50" width="80" height="80" />
    <text x="400" y="165" text-anchor="middle" font-family="Times New Roman, serif" font-size="28" font-weight="bold" fill="#0f1a2b">CERTIFICATE OF VERIFIED OWNERSHIP</text>
    <text x="400" y="185" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#00bcd4">OFFICIAL RDX ECOSYSTEM LICENSE</text>
    
    <!-- Top Right Meta -->
    <text x="750" y="60" text-anchor="end" font-family="Courier New, monospace" font-size="11" fill="#64748b">CERTIFICATE ID: ${code}</text>
    <text x="750" y="75" text-anchor="end" font-family="Courier New, monospace" font-size="11" fill="#64748b">DATE OF ISSUE: ${date}</text>

    <!-- Body Text -->
    <text x="400" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#334155">This official document certifies that</text>
    <text x="400" y="275" text-anchor="middle" font-family="Times New Roman, serif" font-size="36" font-weight="bold" fill="#0f1a2b">${name}</text>
    <line x1="200" y1="285" x2="600" y2="285" stroke="#cbd5e1" stroke-width="1" />
    <text x="400" y="315" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#334155">has successfully verified their identity and is an absolute,</text>
    <text x="400" y="335" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#334155">authorized member of the RDX global network.</text>
    
    <text x="400" y="375" text-anchor="middle" font-family="Courier New, monospace" font-size="22" font-weight="bold" fill="#007a8a">rdx.is-a.dev</text>

    <!-- Terms -->
    <text x="60" y="420" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8">TERMS &amp; CONDITIONS:</text>
    <text x="60" y="435" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8">1. This badge is digital proof of association with RDX. It does not grant legal ownership of the domain.</text>
    <text x="60" y="450" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8">2. The Unique ID printed above is strictly linked to the user account. Misuse or forging is prohibited.</text>
    <text x="60" y="465" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8">3. The user agrees to promote the RDX brand positively. The badge must link back to rdx.is-a.dev.</text>

    <!-- Footer -->
    <image href="sign.png" x="120" y="480" width="140" height="50" />
    <line x1="100" y1="540" x2="280" y2="540" stroke="#64748b" stroke-width="1" />
    <text x="190" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748b">AUTHORIZED SIGNATORY</text>
    
    <image href="stamp.png" x="540" y="460" width="120" height="120" />
    <line x1="520" y1="540" x2="700" y2="540" stroke="#64748b" stroke-width="1" />
    <text x="610" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748b">OFFICIAL SEAL</text>

    <text x="400" y="580" text-anchor="middle" font-family="Courier New, monospace" font-size="9" fill="#cbd5e1">VERIFIED BY RDX SYSTEM · ${code}</text>
  </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  triggerDownload(URL.createObjectURL(blob), 'rdx-cert-' + code + '.svg');
  showToast('✅ SVG downloaded');
}

/* ---- HTML WIDGET ---- */
function downloadHTML() {
  const name = (currentUserData.name || 'RDX Member');
  const code = currentUserData.authCode;
  const email = (currentUserData.email || '');
  const date = currentUserData.date;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RDX Certificate - ${code}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Arial', sans-serif; background: #0a0e1a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
  
  .rdx-cert {
    background: #ffffff; width: 100%; max-width: 800px; aspect-ratio: 4/3;
    border: 8px solid #00bcd4; position: relative; overflow: hidden;
    padding: 40px; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  }
  .rdx-cert::before { content: ''; position: absolute; top: 12px; left: 12px; right: 12px; bottom: 12px; border: 1.5px solid #0f1a2b; pointer-events: none; }
  .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-20deg); font-size: 200px; font-weight: 900; color: rgba(0,188,212,0.04); pointer-events: none; z-index: 0; }

  .cert-header { text-align: center; position: relative; z-index: 1; }
  .cert-header img { width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px; }
  .cert-header h1 { font-family: 'Times New Roman', serif; font-size: 32px; color: #0f1a2b; letter-spacing: 1px; margin-bottom: 5px; }
  .cert-header h2 { font-size: 14px; color: #00bcd4; letter-spacing: 4px; text-transform: uppercase; }

  .cert-meta { position: absolute; top: 40px; right: 40px; text-align: right; font-family: 'Courier New', monospace; font-size: 12px; color: #64748b; z-index: 1; }
  .cert-meta b { color: #0f1a2b; }

  .cert-body { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; z-index: 1; margin-top: 20px; }
  .cert-body p { font-size: 16px; color: #334155; margin-bottom: 10px; }
  .cert-name { font-family: 'Times New Roman', serif; font-size: 38px; font-weight: bold; color: #0f1a2b; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-bottom: 10px; display: inline-block; }
  .cert-domain { font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #007a8a; margin-top: 10px; }

  .cert-terms { font-size: 10px; color: #94a3b8; text-align: left; margin-top: 30px; position: relative; z-index: 1; }
  .cert-terms b { color: #64748b; display: block; margin-bottom: 4px; }

  .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; position: relative; z-index: 1; padding: 0 20px; }
  .sign-block { text-align: center; }
  .sign-block img { height: 50px; margin-bottom: 5px; }
  .sign-line { width: 180px; height: 1px; background: #64748b; margin-bottom: 6px; }
  .sign-block span { font-size: 11px; font-weight: bold; color: #64748b; letter-spacing: 1px; }

  .stamp-block { text-align: center; }
  .stamp-block img { height: 100px; margin-bottom: -10px; object-fit: contain; }
  .stamp-line { width: 180px; height: 1px; background: #64748b; margin-bottom: 6px; }
  .stamp-block span { font-size: 11px; font-weight: bold; color: #64748b; letter-spacing: 1px; }
  
  .bottom-text { position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-family: 'Courier New', monospace; font-size: 10px; color: #cbd5e1; z-index: 1; }
</style>
</head>
<body>
  <div class="rdx-cert">
    <div class="watermark">RDX</div>
    
    <div class="cert-meta">
      <b>CERTIFICATE ID:</b> ${code}<br>
      <b>ISSUED ON:</b> ${date}
    </div>

    <div class="cert-header">
      <img src="logo.png" alt="RDX Logo">
      <h1>CERTIFICATE OF VERIFIED OWNERSHIP</h1>
      <h2>OFFICIAL RDX ECOSYSTEM LICENSE</h2>
    </div>

    <div class="cert-body">
      <p>This official document certifies that</p>
      <div class="cert-name">${name}</div>
      <p>has successfully verified their identity and is an absolute,<br>authorized member of the RDX global network.</p>
      <div class="cert-domain">rdx.is-a.dev</div>
    </div>

    <div class="cert-terms">
      <b>TERMS &amp; CONDITIONS:</b>
      1. This badge is digital proof of association with RDX. It does not grant legal ownership of the domain.<br>
      2. The Unique ID printed above is strictly linked to the user account. Misuse or forging is prohibited.<br>
      3. The user agrees to promote the RDX brand positively. The badge must link back to rdx.is-a.dev.
    </div>

    <div class="cert-footer">
      <div class="sign-block">
        <img src="sign.png" alt="Signature">
        <div class="sign-line"></div>
        <span>AUTHORIZED SIGNATORY</span>
      </div>
      <div class="stamp-block">
        <img src="stamp.png" alt="Stamp">
        <div class="stamp-line"></div>
        <span>OFFICIAL SEAL</span>
      </div>
    </div>
    
    <div class="bottom-text">VERIFIED BY RDX SYSTEM · ${code}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  triggerDownload(URL.createObjectURL(blob), 'rdx-cert-' + code + '.html');
  showToast('✅ HTML Certificate downloaded');
}