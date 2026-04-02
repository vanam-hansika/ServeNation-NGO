import { db, auth, onAuthStateChanged, signOut, collection, getDocs, orderBy, query } from './firebase.js';

const ADMIN_EMAIL = "admin@servenation.org";

const dashboardContent = document.getElementById('dashboardContent');
const logoutBtn = document.getElementById('logoutBtn');
const tableBody = document.getElementById('tableBody');
const volunteersTable = document.getElementById('volunteersTable');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorIndicator = document.getElementById('errorIndicator');
const totalBadge = document.getElementById('totalBadge');

// Protect Route
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    // Redirect if not logged in or not admin
    window.location.href = "admin-login.html";
  } else {
    // Authenticated: show content and load data
    dashboardContent.style.display = 'block';
    loadVolunteers();
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = "admin-login.html";
  } catch (error) {
    console.error("Error signing out: ", error);
  }
});

// Fetch and display data
async function loadVolunteers() {
  if (!db) {
    showError();
    return;
  }

  try {
    // Query volunteers ordered by creation date descending
    const q = query(collection(db, "volunteers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    tableBody.innerHTML = ''; // clear table
    let count = 0;

    querySnapshot.forEach((docSnap) => {
      count++;
      const data = docSnap.data();
      
      // format date if available
      let dateString = "N/A";
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        dateString = data.createdAt.toDate().toLocaleDateString();
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--gray-500); font-size: var(--text-sm);">${dateString}</td>
        <td style="font-weight: 600;">${escapeHTML(data.name || '—')}</td>
        <td><a href="mailto:${escapeHTML(data.email || '')}" style="color: var(--blue-600);">${escapeHTML(data.email || '—')}</a></td>
        <td>${escapeHTML(data.mobile || '—')}</td>
        <td><span class="badge-area">${escapeHTML(data.areaOfInterest || '—').toUpperCase()}</span></td>
        <td style="font-size: var(--text-sm); max-width: 300px; overflow:hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(data.about || '')}">
          ${escapeHTML(data.about || '—')}
        </td>
      `;
      tableBody.appendChild(tr);
    });

    totalBadge.textContent = `Total: ${count}`;

    loadingIndicator.style.display = 'none';
    if (count > 0) {
      volunteersTable.style.display = 'table';
    } else {
      loadingIndicator.innerHTML = '<p>No volunteers registered yet.</p>';
      loadingIndicator.style.display = 'block';
    }

  } catch (error) {
    console.error("Error loading volunteers: ", error);
    showError();
  }
}

function showError() {
  loadingIndicator.style.display = 'none';
  errorIndicator.style.display = 'block';
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}
