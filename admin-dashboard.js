import { db, auth, onAuthStateChanged, signOut, collection, getDocs, orderBy, query } from './firebase.js';

const ADMIN_EMAIL = "admin@servenation.org";

const dashboardContent = document.getElementById('dashboardContent');
const logoutBtn = document.getElementById('logoutBtn');
const tableBody = document.getElementById('tableBody');
const volunteersTable = document.getElementById('volunteersTable');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorIndicator = document.getElementById('errorIndicator');
const totalBadge = document.getElementById('totalBadge');

console.log("🛠️ Admin Dashboard Script Loaded");

// 1. Session Guard
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.email === ADMIN_EMAIL) {
      console.log("✅ Admin access verified:", user.email);
      dashboardContent.style.display = 'block';
      loadVolunteers();
    } else {
      console.error("❌ Access Denied: User is NOT authorized admin.");
      // Forced sign out for non-admins trying to stay logged in
      signOut(auth).then(() => {
        window.location.href = "admin-login.html";
      });
    }
  } else {
    console.log("ℹ️ No active session. Redirecting to login...");
    window.location.href = "admin-login.html";
  }
});

// 2. Logout Handler
logoutBtn.addEventListener('click', async () => {
  try {
    console.log("👋 Logging out...");
    await signOut(auth);
    window.location.href = "admin-login.html";
  } catch (err) {
    console.error("❌ Logout error:", err);
  }
});

// Image Upload Elements
const uploadForm = document.getElementById('uploadForm');
const imageUpload = document.getElementById('imageUpload');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');

// 3. Image Upload Logic
if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = imageUpload.files[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      uploadStatus.textContent = '❌ Please select a JPG or PNG image.';
      uploadStatus.style.color = 'var(--orange-dark)';
      uploadStatus.style.display = 'block';
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    uploadStatus.style.display = 'none';

    try {
      // Import storage specifics inline or assume exported from firebase.js
      const { storage, ref, uploadBytesResumable, getDownloadURL, addDoc, serverTimestamp } = await import('./firebase.js');

      // Unique filename
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, `gallery/${fileName}`);

      // Upload to Storage
      const snapshot = await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save to Firestore
      await addDoc(collection(db, "gallery"), {
        imageUrl: downloadURL,
        createdAt: serverTimestamp()
      });

      uploadStatus.textContent = '✅ Image uploaded to gallery successfully!';
      uploadStatus.style.color = 'green';
      uploadStatus.style.display = 'block';
      uploadForm.reset();

    } catch (err) {
      console.error('Upload Error:', err);
      uploadStatus.textContent = '❌ Failed to upload image.';
      uploadStatus.style.color = 'var(--orange-dark)';
      uploadStatus.style.display = 'block';
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Image';
    }
  });
}

// 4. Data Fetching
async function loadVolunteers() {
  if (!db) {
    console.error("❌ Firestore DB not initialized.");
    showError();
    return;
  }

  try {
    console.log("📡 Fetching volunteers...");
    const q = query(collection(db, "volunteers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    tableBody.innerHTML = '';
    let count = 0;

    querySnapshot.forEach((docSnap) => {
      count++;
      const data = docSnap.data();
      
      let dateString = "N/A";
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        const d = data.createdAt.toDate();
        dateString = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--gray-500); font-size: var(--text-xs);">${dateString}</td>
        <td style="font-weight: 600;">${escapeHTML(data.name || '—')}</td>
        <td><a href="mailto:${escapeHTML(data.email || '')}" class="text-green-600">${escapeHTML(data.email || '—')}</a></td>
        <td>${escapeHTML(data.mobile || '—')}</td>
        <td><span class="badge-area">${escapeHTML(data.areaOfInterest || '—').toUpperCase()}</span></td>
        <td style="max-width: 300px; overflow:hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHTML(data.about || '')}">
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
      loadingIndicator.innerHTML = '<p>No volunteers have registered yet.</p>';
      loadingIndicator.style.display = 'block';
    }

    console.log("🎉 Loaded", count, "volunteers.");

  } catch (err) {
    console.error("❌ Fetch error:", err);
    showError();
  }
}

function showError() {
  loadingIndicator.style.display = 'none';
  errorIndicator.style.display = 'block';
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}
