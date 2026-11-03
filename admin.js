// admin.js
const ADMIN_EMAIL = "rdx.hq.in@gmail.com";

async function renderAdminPanel() {
  const user = auth.currentUser;
  const tableBody = document.getElementById('adminUserTable');
  const totalEl = document.getElementById('adminTotalUsers');
  
  if (!user) {
    document.querySelector('.admin-panel').innerHTML = `<h2 style="color:#ef4444;">Access Denied</h2><p style="color:#94a3b8;">You must be logged in to view the admin panel.</p>`;
    return;
  }

  if (user.email !== ADMIN_EMAIL) {
    document.querySelector('.admin-panel').innerHTML = `<h2 style="color:#ef4444;">Access Denied</h2><p style="color:#94a3b8;">Only the RDX Administrator (${ADMIN_EMAIL}) can access this page.</p>`;
    return;
  }

  try {
    const allDocs = await db.collection('rdx_users').get();
    totalEl.textContent = allDocs.size;

    const snapshot = await db.collection('rdx_users').orderBy('createdAt', 'desc').limit(10).get();
    tableBody.innerHTML = '';

    if (snapshot.empty) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">No users registered yet.</td></tr>`;
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${data.name || 'N/A'}</td>
        <td>${data.email || 'N/A'}</td>
        <td><span class="admin-badge">${data.authCode || 'N/A'}</span></td>
        <td>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('en-GB') : 'Recently'}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (e) {
    console.error(e);
    tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444;">Error loading data: ${e.message}</td></tr>`;
  }
}

// Page load hote hi render karo
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('/rdx/')) {
    renderAdminPanel();
  }
});