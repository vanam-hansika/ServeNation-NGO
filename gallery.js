import { db, collection, getDocs, orderBy, query } from './firebase.js';

// ---- DOM Elements ----
const galleryGrid = document.getElementById('galleryGrid');
const galleryLoading = document.getElementById('galleryLoading');
const filterBtns = document.querySelectorAll('.filter-btn');

// ---- State ----
let allImages = [];

// ---- 1. Fetch Gallery Data ----
async function loadGallery() {
  if (!db) {
    console.warn("Firestore not ready.");
    return;
  }

  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    allImages = [];
    querySnapshot.forEach(docSnap => {
      allImages.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    renderGallery(allImages);
    
    if (galleryLoading) {
      galleryLoading.style.display = 'none';
    }

  } catch (err) {
    console.error("Error fetching gallery:", err);
    if (galleryLoading) {
      galleryLoading.innerHTML = '<p style="color: red;">Failed to load gallery images.</p>';
    }
  }
}

// ---- 2. Render Gallery Items ----
function renderGallery(images) {
  // Clear grid but keep loading if it was there (actually loading is hidden now)
  const items = galleryGrid.querySelectorAll('.gallery-item');
  items.forEach(item => item.remove());

  if (images.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'gallery-empty';
    emptyMsg.style.gridColumn = '1 / -1';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.padding = 'var(--space-12)';
    emptyMsg.innerHTML = '<i class="fas fa-camera" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 1rem;"></i><p>No activity images uploaded yet.</p>';
    galleryGrid.appendChild(emptyMsg);
    return;
  }

  images.forEach(imgData => {
    const item = document.createElement('div');
    item.className = 'gallery-item animate-fade-up';
    // We don't have categories in requirements for dynamic images yet, 
    // but the UI has filter buttons. Let's default them to 'events' or just hide them if not needed.
    // For now, we'll keep it simple as the user didn't specify categories for upload.
    item.setAttribute('data-category', 'events'); 
    
    item.innerHTML = `
      <img src="${imgData.imageUrl}" alt="NGO activity image" loading="lazy" />
      <div class="gallery-overlay">
        <p class="gallery-caption">NGO Activity</p>
      </div>
    `;

    item.addEventListener('click', () => openLightbox(imgData.imageUrl, "ServeNation Activity Image"));
    galleryGrid.appendChild(item);
  });
}

// ---- 3. Lightbox Logic ----
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCap = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(url, caption) {
  if (lightboxImg) lightboxImg.src = url;
  if (lightboxCap) lightboxCap.textContent = caption;
  if (lightbox) lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (lightbox) lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

lightboxClose && lightboxClose.addEventListener('click', closeLightbox);
lightbox && lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ---- 4. Filter Logic (Simplistic) ----
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    
    // Since current requirements don't have categories for uploaded images, 
    // we'll just show all for any filter for now, or you could implement 
    // category selection in the admin dashboard later.
    if (filter === 'all') {
      renderGallery(allImages);
    } else {
      // For now, we'll just show an empty filter or keep all if we want.
      // Let's filter by nothing to show it works.
      const filtered = allImages.filter(img => (img.category === filter || filter === 'events')); 
      renderGallery(filtered);
    }
  });
});

// Start the show
loadGallery();
