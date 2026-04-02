import { db, collection, getDocs, orderBy, query } from './firebase.js';

// ---- DOM Elements ----
const galleryGrid = document.getElementById('galleryGrid');
const galleryLoading = document.getElementById('galleryLoading');
const filterBtns = document.querySelectorAll('.filter-btn');

// ---- State ----
// Preload the original static gallery images
const initialStaticImages = [
  {
    id: 'static-1',
    imageUrl: '/assets/images/community-kitchen.jpeg',
    category: 'food',
    caption: 'Community Kitchen — Volunteers distributing food and essentials',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'static-2',
    imageUrl: '/assets/images/environment.jpeg',
    category: 'environment',
    caption: 'River Clean-Up — Volunteers restoring nature',
    createdAt: new Date('2024-01-02')
  },
  {
    id: 'static-3',
    imageUrl: '/assets/images/ngo-day-celebration.jpeg',
    category: 'events',
    caption: 'NGO Day Celebration — Community assembly',
    createdAt: new Date('2024-01-03')
  },
  {
    id: 'static-4',
    imageUrl: '/assets/images/food-donation.jpeg',
    category: 'food',
    caption: 'COVID Relief Food — Distribution of ration kits',
    createdAt: new Date('2024-01-04')
  },
  {
    id: 'static-5',
    imageUrl: '/assets/images/climate-awareness-walk.jpeg',
    category: 'environment',
    caption: 'Climate Awareness Walk — Greener India',
    createdAt: new Date('2024-01-05')
  },
  {
    id: 'static-6',
    imageUrl: '/assets/images/river-cleanup-camp.jpeg',
    category: 'environment',
    caption: 'River Clean-Up Camp — Intensive cleanup drive',
    createdAt: new Date('2024-01-06')
  },
  {
    id: 'static-7',
    imageUrl: '/assets/images/events.jpeg',
    category: 'events',
    caption: 'Donation Camp — Clothes and book collection',
    createdAt: new Date('2024-01-07')
  },
  {
    id: 'static-8',
    imageUrl: '/assets/images/education.jpeg',
    category: 'education',
    caption: 'Child Education Drive — Empowering underprivileged children',
    createdAt: new Date('2024-01-08')
  }
];

let allImages = [...initialStaticImages];

// ---- 1. Fetch Gallery Data ----
async function loadGallery() {
  if (!db) {
    console.warn("Firestore not ready. Showing static images only.");
    renderGallery(allImages);
    if (galleryLoading) galleryLoading.style.display = 'none';
    return;
  }

  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    // Dynamic images pushed before static ones, or just mixed all together
    let dynamicImages = [];
    querySnapshot.forEach(docSnap => {
      dynamicImages.push({
        id: docSnap.id,
        category: 'events', // Defaulting uploaded to events for now
        caption: 'NGO Activity',
        ...docSnap.data()
      });
    });

    // Merge Dynamic (Newest first) with Static
    allImages = [...dynamicImages, ...initialStaticImages];

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
    item.setAttribute('data-category', imgData.category || 'events'); 
    
    item.innerHTML = `
      <img src="${imgData.imageUrl}" alt="${imgData.caption || 'NGO activity image'}" loading="lazy" />
      <div class="gallery-overlay">
        <p class="gallery-caption">${imgData.caption || 'NGO Activity'}</p>
      </div>
    `;

    item.addEventListener('click', () => openLightbox(imgData.imageUrl, imgData.caption || "ServeNation Activity Image"));
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
