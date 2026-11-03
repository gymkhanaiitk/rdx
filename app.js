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

// Admin Email
const ADMIN_EMAIL = "info@rdx.mywire.org";

/* ================= HELPERS ================= */
let base64Cache = { sign: null, stamp: null };
let currentUserData = null;

const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

async function getBase64Image(fileName, type) {
  if (base64Cache[type]) return base64Cache[type];
  try {
    const res = await fetch(fileName);
    if (!res.ok) throw new Error("File not found");
    const text = await res.text();
    base64Cache[type] = text.trim().startsWith('data:') ? text.trim() : `data:image/png;base64,${text.trim()}`;
    return base64Cache[type];
  } catch (err) { return null; }
}

function generateRDXID() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'RDX-';
  for (let i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)];
  s += '-';
  for (let i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

/* ================= ROUTING SYSTEM ================= */
function navigate(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageName);
  if (target) target.classList.add('active');
  else document.getElementById('page-home').classList.add('active');
  
  window.scrollTo(0, 0);
  if (pageName === 'admin') renderAdminPanel();
}

/* ================= RENDER PAGES (Templates) ================= */
const appEl = document.getElementById('app');
appEl.innerHTML = `
  <!-- HOME PAGE -->
  <div id="page-home" class="page active">
    <header class="hero">
      <div class="hero-eyebrow">rdx.is-a.dev</div>
      <h1>Build. Own. <em>Dominate.</em></h1>
      <p>A next-generation digital ecosystem crafted by RDX. We build real-world websites, tools, and network nodes.</p>
      <div class="hero-cta">
        <a href="#certificate" class="btn btn-primary" onclick="navigate('certificate')">⬇ Get Verified Badge</a>
        <a href="#about" class="btn btn-ghost" onclick="navigate('about')">About RDX</a>
      </div>
    </header>
  </div>

  <!-- ABOUT PAGE -->
  <div id="page-about" class="page">
    <section>
      <div class="section-title">
        <h2>Who is RDX?</h2>
        <p>The visionary behind the code.</p>
      </div>
      <div class="profile-card">
        <img src="logo.png" alt="RDX Profile" class="profile-img" onerror="this.src='https://ui-avatars.com/api/?name=RDX&background=00e5ff&color=0a0e1a&size=150'">
        <div class="profile-info">
          <h3>RDX</h3>
          <div class="tagline">IITK '31 • IITM '31 ⚡</div>
          <p>Full-Stack Web Developer & Digital Architect. I build high-performance, scalable, and secure web solutions. From e-commerce portals to community networks, RDX is the absolute root authority of <strong>rdx.is-a.dev</strong>.</p>
          <p style="margin-top: 15px; font-size: 14px; color: #00e5ff;">
            🎓 <strong>B.Tech</strong> @ IIT Kanpur (IITK '31) <br>
            🎓 <strong>Online BS Degree</strong> (Data Science & Management) @ IIT Madras (IITM '31)
          </p>
        </div>
      </div>
    </section>
  </div>

  <!-- PROJECTS PAGE -->
  <div id="page-projects" class="page">
    <section>
      <div class="section-title">
        <h2>RDX Projects</h2>
        <p>Real websites, real work — all built under the RDX ecosystem.</p>
      </div>
      <div class="grid">
        <div class="card"><h3>Students' Gymkhana – IITK</h3><p>Official student body portal.</p><a href="https://www.sgiitk.mywire.org/" target="_blank">Visit Site →</a></div>
        <div class="card"><h3>Siddhi Vinayak Enterprises</h3><p>Business website for SVE India.</p><a href="https://www.sveindia.mywire.org/" target="_blank">Visit Site →</a></div>
        <div class="card"><h3>Buy SVE Portal</h3><p>E-commerce portal.</p><a href="https://www.buysve.mywire.org/" target="_blank">Visit Site →</a></div>
        <div class="card"><h3>Lachharsar Village</h3><p>Community website.</p><a href="https://www.lachharsar.mywire.org/" target="_blank">Visit Site →</a></div>
        <div class="card"><h3>Nandi Gaushala Lachharsar</h3><p>Gaushala portal.</p><a href="https://www.ngssl.mywire.org/" target="_blank">Visit Site →</a></div>
        <div class="card"><h3>MyVNC Snip URL</h3><p>URL shortener.</p><a href="https://url.myvnc.com/" target="_blank">Visit Site →</a></div>
        <div class="card"><h3>AIESAU Portal</h3><p>Student portal.</p><a href="https://aiesau.netlify.app/" target="_blank">Visit Site →</a></div>
        <div class="card"><h3>SVG Party</h3><p>SVG playground.</p><a href="https://svgparty.netlify.app/" target="_blank">Visit Site →</a></div>
        <div class="card"><h3>Live IITK</h3><p>Live updates.</p><a href="https://liveiitk.netlify.app/" target="_blank">Visit Site →</a></div>
        <div class="card"><h3>Awaaz IITK</h3><p>Community voice.</p><a href="https://awaaziitk.netlify.app/" target="_blank">Visit Site →</a></div>
      </div>
    </section>
  </div>

  <!-- CERTIFICATE PAGE -->
  <div id="page-certificate" class="page">
    <section>
      <div class="section-title">
        <h2>Get Your Verified Badge</h2>
        <p>Login → get unique RDX ID → download in any format → upload to your site.</p>
      </div>
      <div class="cert-panel">
        <div id="loginView">
          <h2>🔐 Login Required</h2>
          <p>Sign in to get your unique RDX ID.</p>
          <div class="login-box">
            <button class="google-btn" id="googleLoginBtn">
              <svg viewBox="0 0 48 48" width="18" height="18"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.3 5.3C41 35.9 44 30.4 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
              Continue with Google
            </button>
            <div class="divider">OR</div>
            <input type="email" id="emailInput" placeholder="Enter your email">
            <input type="password" id="passwordInput" placeholder="Password (min 6 chars)">
            <button class="btn btn-primary" id="emailLoginBtn">Login with Email</button>
            <button class="btn btn-ghost" id="emailSignupBtn">Create Account</button>
          </div>
        </div>
        <div id="certView" class="cert-result">
          <h2>✅ You're Verified!</h2>
          <p>Your unique RDX ID:</p>
          <div class="auth-code" id="authCodeDisplay">RDX-XXXX-XXXX</div>
          <div class="preview-box">
            <h4>Live Preview</h4>
            <div id="previewCanvasHolder"></div>
          </div>
          <div class="format-label">Choose Download Format</div>
          <div class="format-grid">
            <button class="format-btn" data-format="png"><span class="fmt-icon">🖼️</span><span class="fmt-name">PNG</span></button>
            <button class="format-btn" data-format="pdf"><span class="fmt-icon">📄</span><span class="fmt-name">PDF</span></button>
            <button class="format-btn" data-format="html"><span class="fmt-icon">🌐</span><span class="fmt-name">HTML</span></button>
            <button class="format-btn" data-format="svg"><span class="fmt-icon">✒️</span><span class="fmt-name">SVG</span></button>
          </div>
          <button class="btn btn-ghost" id="logoutBtn" style="width:100%; margin-top:20px;">Logout</button>
        </div>
      </div>
    </section>
  </div>

  <!-- CONTACT PAGE -->
  <div id="page-contact" class="page">
    <section>
      <div class="section-title">
        <h2>Contact Us</h2>
        <p>Need a website? Let's build something amazing together.</p>
      </div>
      <div class="contact-card">
        <div class="contact-icon">📧</div>
        <h3>Website Development Inquiry</h3>
        <p>For custom websites, portfolios, e-commerce stores, or any web development work, drop us an email.</p>
        <a href="mailto:info@rdx.mywire.org" class="btn btn-primary contact-email">info@rdx.mywire.org</a>
      </div>
    </section>
  </div>

  <!-- ADMIN PAGE -->
  <div id="page-admin" class="page">
    <section>
      <div class="admin-panel">
        <h2>⚡ RDX Admin Control Panel</h2>
        <p style="color:#94a3b8; margin-bottom: 30px;">Welcome, Administrator. View system statistics and manage users.</p>
        <div class="admin-grid">
          <div class="admin-stat"><h4>Total Verified Users</h4><h2 id="adminTotalUsers">0</h2></div>
          <div class="admin-stat"><h4>Total Projects</h4><h2>10</h2></div>
          <div class="admin-stat"><h4>System Status</h4><h2 style="color:#4ade80; font-size: 32px;">Online</h2></div>
        </div>
        
        <h2 style="margin-top: 50px;">Recent Registrations</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Unique ID</th><th>Joined</th></tr>
            </thead>
            <tbody id="adminUserTable">
              <tr><td colspan="4" style="text-align: center; color: #64748b;">Loading data...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
`;

/* ================= ADMIN LOGIC ================= */
async function renderAdminPanel() {
  const user = auth.currentUser;
  if (!user) {
    document.getElementById('page-admin').innerHTML = `<section><div class="admin-panel"><h2 style="color:#ef4444;">Access Denied</h2><p style="color:#94a3b8;">You must be logged in to view the admin panel.</p></div></section>`;
    return;
  }
  
  if (user.email !== ADMIN_EMAIL) {
    document.getElementById('page-admin').innerHTML = `<section><div class="admin-panel"><h2 style="color:#ef4444;">Access Denied</h2><p style="color:#94a3b8;">Only the RDX Administrator can access this page.</p></div></section>`;
    return;
  }

  const tableBody = document.getElementById('adminUserTable');
  const totalEl = document.getElementById('adminTotalUsers');
  
  try {
    const snapshot = await db.collection('rdx_users').orderBy('createdAt', 'desc').limit(10).get();
    tableBody.innerHTML = '';
    
    const allDocs = await db.collection('rdx_users').get();
    totalEl.textContent = allDocs.size;

    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${data.name || 'N/A'}</td>
        <td>${data.email || 'N/A'}</td>
        <td><span class="admin-badge">${data.authCode || 'N/A'}</span></td>
        <td>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (e) {
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444;">Error loading data: ${e.message}</td></tr>`;
  }
}

/* ================= AUTH STATE & NAVBAR UPDATE ================= */
auth.onAuthStateChanged(async (user) => {
  const navActions = document.getElementById('navActions');
  const loginView = document.getElementById('loginView');
  const certView = document.getElementById('certView');
  
  if (user) {
    const isAdmin = user.email === ADMIN_EMAIL;
    
    navActions.innerHTML = `
      <div class="user-chip"><img src="${user.photoURL || 'logo.png'}" alt="">${user.displayName || user.email}</div>
      ${isAdmin ? `<button class="btn btn-ghost" onclick="navigate('admin')" style="color:#facc15; border-color:#facc15;">Admin</button>` : ''}
      <button class="btn btn-ghost" onclick="logout()">Logout</button>
    `;
    
    if (loginView) loginView.style.display = 'none';
    if (certView) certView.classList.add('show');

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
    
    const codeEl = document.getElementById('authCodeDisplay');
    if (codeEl) codeEl.textContent = code;
    
    await getBase64Image('sign.txt', 'sign');
    await getBase64Image('stamp.txt', 'stamp');
    renderPreview();
    
  } else {
    navActions.innerHTML = `
      <a href="#projects" class="btn btn-ghost" onclick="navigate('projects')">Projects</a>
      <a href="#contact" class="btn btn-ghost" onclick="navigate('contact')">Contact</a>
      <a href="#certificate" class="btn btn-primary" onclick="navigate('certificate')">Get Badge</a>
    `;
    if (loginView) loginView.style.display = 'block';
    if (certView) certView.classList.remove('show');
    currentUserData = null;
  }
});

/* ================= LOGIN EVENTS ================= */
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

function logout() { auth.signOut(); showToast('👋 Logged out'); navigate('home'); }
window.logout = logout;
window.navigate = navigate;

/* ================= BADGE DRAW & DOWNLOAD ================= */
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function drawBadge(canvas, name, code, email, date) {
  const W = 800, H = 600;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#00bcd4'; ctx.lineWidth = 8; ctx.strokeRect(15, 15, W - 30, H - 30);
  ctx.strokeStyle = '#0f1a2b'; ctx.lineWidth = 1.5; ctx.strokeRect(28, 28, W - 56, H - 56);

  ctx.save();
  ctx.translate(W/2, H/2); ctx.rotate(-0.2);
  ctx.font = '900 200px Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(0, 188, 212, 0.04)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('RDX', 0, 0);
  ctx.restore();

  const logoImg = await loadImage('logo.png');
  const signImg = await loadImage(base64Cache.sign);
  const stampImg = await loadImage(base64Cache.stamp);

  if (logoImg) { ctx.drawImage(logoImg, W/2 - 40, 50, 80, 80); }
  else {
    ctx.beginPath(); ctx.arc(W/2, 90, 40, 0, Math.PI*2);
    ctx.fillStyle = '#00bcd4'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('RDX', W/2, 90);
  }

  ctx.fillStyle = '#0f1a2b'; ctx.textAlign = 'center'; ctx.font = 'bold 28px Times New Roman, serif';
  ctx.fillText('CERTIFICATE OF VERIFIED OWNERSHIP', W/2, 165);
  ctx.fillStyle = '#00bcd4'; ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('OFFICIAL RDX ECOSYSTEM LICENSE', W/2, 185);

  ctx.textAlign = 'right'; ctx.fillStyle = '#64748b'; ctx.font = '11px Courier New, monospace';
  ctx.fillText('CERTIFICATE ID: ' + code, W - 50, 60);
  ctx.fillText('DATE OF ISSUE: ' + date, W - 50, 75);

  ctx.textAlign = 'center'; ctx.fillStyle = '#334155'; ctx.font = '16px Arial, sans-serif';
  ctx.fillText('This official document certifies that', W/2, 230);
  ctx.fillStyle = '#0f1a2b'; ctx.font = 'bold 36px Times New Roman, serif';
  ctx.fillText(name, W/2, 275);

  const nameWidth = ctx.measureText(name).width;
  ctx.beginPath(); ctx.moveTo(W/2 - nameWidth/2 - 20, 285); ctx.lineTo(W/2 + nameWidth/2 + 20, 285);
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.stroke();

  ctx.fillStyle = '#334155'; ctx.font = '16px Arial, sans-serif';
  ctx.fillText('has successfully verified their identity and is an absolute,', W/2, 315);
  ctx.fillText('authorized member of the RDX global network.', W/2, 335);

  ctx.fillStyle = '#007a8a'; ctx.font = 'bold 22px Courier New, monospace';
  ctx.fillText('rdx.is-a.dev', W/2, 375);

  ctx.textAlign = 'center'; ctx.fillStyle = '#00bcd4'; ctx.font = 'bold 12px Arial, sans-serif';
  ctx.fillText('Contact for web development: info@rdx.mywire.org', W/2, 410);

  ctx.textAlign = 'left'; ctx.fillStyle = '#94a3b8'; ctx.font = '10px Arial, sans-serif';
  ctx.fillText('TERMS & CONDITIONS:', 60, 435);
  ctx.fillText('1. This badge is digital proof of association with RDX. It does not grant legal ownership of the domain.', 60, 450);
  ctx.fillText('2. The Unique ID printed above is strictly linked to the user account. Misuse or forging is prohibited.', 60, 465);
  ctx.fillText('3. The user agrees to promote the RDX brand positively. The badge must link back to rdx.is-a.dev.', 60, 480);

  if (signImg) ctx.drawImage(signImg, 120, 490, 140, 50);
  ctx.beginPath(); ctx.moveTo(100, 550); ctx.lineTo(280, 550);
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.stroke();
  ctx.textAlign = 'center'; ctx.fillStyle = '#64748b'; ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('AUTHORIZED SIGNATORY', 190, 565);

  if (stampImg) ctx.drawImage(stampImg, W - 260, 480, 120, 120);
  ctx.beginPath(); ctx.moveTo(W - 280, 550); ctx.lineTo(W - 100, 550);
  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#64748b'; ctx.font = 'bold 11px Arial, sans-serif';
  ctx.fillText('OFFICIAL SEAL', W - 190, 565);

  ctx.fillStyle = '#cbd5e1'; ctx.font = '9px Courier New, monospace';
  ctx.fillText('VERIFIED BY RDX SYSTEM · ' + code, W/2, 585);
}

async function renderPreview() {
  if (!currentUserData) return;
  const holder = document.getElementById('previewCanvasHolder');
  if (!holder) return;
  holder.innerHTML = '<div style="color:#94a3b8;font-size:12px;">Loading preview...</div>';
  const c = document.createElement('canvas');
  c.style.maxWidth = '100%'; c.style.borderRadius = '8px';
  await drawBadge(c, currentUserData.name, currentUserData.authCode, currentUserData.email, currentUserData.date);
  holder.innerHTML = '';
  holder.appendChild(c);
}

document.querySelectorAll('.format-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!currentUserData) return showToast('⚠️ Please login first');
    const fmt = btn.dataset.format;
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

function downloadPNG(canvas) {
  canvas.toBlob(blob => {
    triggerDownload(URL.createObjectURL(blob), 'rdx-cert-' + currentUserData.authCode + '.png');
    showToast('✅ PNG downloaded');
  }, 'image/png');
}

function downloadPDF(canvas) {
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
  pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
  pdf.save('rdx-cert-' + currentUserData.authCode + '.pdf');
  showToast('✅ PDF downloaded');
}

function downloadSVG() {
  const name = (currentUserData.name || 'RDX Member');
  const code = currentUserData.authCode;
  const date = currentUserData.date;
  const sign = base64Cache.sign || '';
  const stamp = base64Cache.stamp || '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#ffffff"/>
    <rect x="15" y="15" width="770" height="570" fill="none" stroke="#00bcd4" stroke-width="8"/>
    <rect x="28" y="28" width="744" height="544" fill="none" stroke="#0f1a2b" stroke-width="1.5"/>
    <image href="logo.png" x="360" y="50" width="80" height="80" />
    <text x="400" y="165" text-anchor="middle" font-family="Times New Roman, serif" font-size="28" font-weight="bold" fill="#0f1a2b">CERTIFICATE OF VERIFIED OWNERSHIP</text>
    <text x="400" y="185" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#00bcd4">OFFICIAL RDX ECOSYSTEM LICENSE</text>
    <text x="750" y="60" text-anchor="end" font-family="Courier New, monospace" font-size="11" fill="#64748b">CERTIFICATE ID: ${code}</text>
    <text x="750" y="75" text-anchor="end" font-family="Courier New, monospace" font-size="11" fill="#64748b">DATE OF ISSUE: ${date}</text>
    <text x="400" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#334155">This official document certifies that</text>
    <text x="400" y="275" text-anchor="middle" font-family="Times New Roman, serif" font-size="36" font-weight="bold" fill="#0f1a2b">${name}</text>
    <line x1="200" y1="285" x2="600" y2="285" stroke="#cbd5e1" stroke-width="1" />
    <text x="400" y="315" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#334155">has successfully verified their identity and is an absolute,</text>
    <text x="400" y="335" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#334155">authorized member of the RDX global network.</text>
    <text x="400" y="375" text-anchor="middle" font-family="Courier New, monospace" font-size="22" font-weight="bold" fill="#007a8a">rdx.is-a.dev</text>
    <text x="400" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#00bcd4">Contact for web development: info@rdx.mywire.org</text>
    <text x="60" y="435" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8">TERMS &amp; CONDITIONS:</text>
    <text x="60" y="450" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8">1. This badge is digital proof of association with RDX. It does not grant legal ownership of the domain.</text>
    <text x="60" y="465" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8">2. The Unique ID printed above is strictly linked to the user account. Misuse or forging is prohibited.</text>
    <text x="60" y="480" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8">3. The user agrees to promote the RDX brand positively. The badge must link back to rdx.is-a.dev.</text>
    ${sign ? `<image href="${sign}" x="120" y="490" width="140" height="50" />` : ''}
    <line x1="100" y1="550" x2="280" y2="550" stroke="#64748b" stroke-width="1" />
    <text x="190" y="565" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748b">AUTHORIZED SIGNATORY</text>
    ${stamp ? `<image href="${stamp}" x="540" y="480" width="120" height="120" />` : ''}
    <line x1="520" y1="550" x2="700" y2="550" stroke="#64748b" stroke-width="1" />
    <text x="610" y="565" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#64748b">OFFICIAL SEAL</text>
    <text x="400" y="585" text-anchor="middle" font-family="Courier New, monospace" font-size="9" fill="#cbd5e1">VERIFIED BY RDX SYSTEM · ${code}</text>
  </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  triggerDownload(URL.createObjectURL(blob), 'rdx-cert-' + code + '.svg');
  showToast('✅ SVG downloaded');
}

function downloadHTML() {
  const name = (currentUserData.name || 'RDX Member');
  const code = currentUserData.authCode;
  const date = currentUserData.date;
  const sign = base64Cache.sign || '';
  const stamp = base64Cache.stamp || '';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>RDX Certificate - ${code}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; background: #0a0e1a; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .rdx-cert { background: #ffffff; width: 100%; max-width: 800px; aspect-ratio: 4/3; border: 8px solid #00bcd4; position: relative; overflow: hidden; padding: 40px; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
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
    .cert-contact { font-size: 12px; font-weight: bold; color: #00bcd4; margin-top: 15px; }
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
  </style></head><body>
  <div class="rdx-cert">
    <div class="watermark">RDX</div>
    <div class="cert-meta"><b>CERTIFICATE ID:</b> ${code}<br><b>ISSUED ON:</b> ${date}</div>
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
      <div class="cert-contact">Contact for web development: info@rdx.mywire.org</div>
    </div>
    <div class="cert-terms">
      <b>TERMS &amp; CONDITIONS:</b>
      1. This badge is digital proof of association with RDX. It does not grant legal ownership of the domain.<br>
      2. The Unique ID printed above is strictly linked to the user account. Misuse or forging is prohibited.<br>
      3. The user agrees to promote the RDX brand positively. The badge must link back to rdx.is-a.dev.
    </div>
    <div class="cert-footer">
      <div class="sign-block">${sign ? `<img src="${sign}" alt="Signature">` : ''}<div class="sign-line"></div><span>AUTHORIZED SIGNATORY</span></div>
      <div class="stamp-block">${stamp ? `<img src="${stamp}" alt="Stamp">` : ''}<div class="stamp-line"></div><span>OFFICIAL SEAL</span></div>
    </div>
    <div class="bottom-text">VERIFIED BY RDX SYSTEM · ${code}</div>
  </div></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  triggerDownload(URL.createObjectURL(blob), 'rdx-cert-' + code + '.html');
  showToast('✅ HTML Certificate downloaded');
}