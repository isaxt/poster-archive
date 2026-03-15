/* =============================================
   PASTE — Poster Archive
   app.js — Gallery, Upload, Lightbox logic
   Storage: localStorage (shared in-browser)
   ============================================= */

(function () {
  'use strict';

  // ─── Storage key ───────────────────────────
  const STORAGE_KEY = 'paste_posters_v1';

  // ─── State ─────────────────────────────────
  let posters = [];
  let activeFilter = 'all';
  let activeSort = 'newest';
  let pendingImageData = null;

  // ─── DOM refs ──────────────────────────────
  const grid          = document.getElementById('masonryGrid');
  const emptyState    = document.getElementById('emptyState');
  const postCount     = document.getElementById('postCount');
  const uploadModal   = document.getElementById('uploadModal');
  const lightbox      = document.getElementById('lightbox');
  const dropZone      = document.getElementById('dropZone');
  const fileInput     = document.getElementById('fileInput');
  const uploadPreview = document.getElementById('uploadPreview');
  const uploadPrompt  = document.getElementById('uploadPrompt');
  const previewImg    = document.getElementById('previewImg');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxMeta  = document.getElementById('lightboxMeta');
  const uploadError   = document.getElementById('uploadError');
  const submitBtn     = document.getElementById('submitBtn');

  // ─── Load / Save ───────────────────────────
  function loadPosters() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      posters = raw ? JSON.parse(raw) : getSeedPosters();
      if (!raw) savePosters(); // persist seed data
    } catch (e) {
      posters = getSeedPosters();
    }
  }

  function savePosters() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posters));
    } catch (e) {
      // Storage quota — silently fail
    }
  }

  // Seed posters using free, public-domain placeholder images
  function getSeedPosters() {
    const now = Date.now();
    return [
      {
        id: uid(),
        title: 'Metropolis',
        artist: 'Heinz Schulz-Neudamm',
        year: '1927',
        category: 'film',
        notes: 'One of the most valuable film posters ever created. Art deco masterpiece.',
        imageData: null,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Metropolis_Film_poster.jpg/400px-Metropolis_Film_poster.jpg',
        addedAt: now - 86400000 * 5
      },
      {
        id: uid(),
        title: 'Moulin Rouge',
        artist: 'Henri de Toulouse-Lautrec',
        year: '1891',
        category: 'art',
        notes: 'Iconic lithograph advertising poster. Among the first great modern posters.',
        imageData: null,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Henri_de_Toulouse-Lautrec_-_Moulin_Rouge-_La_Goulue_%28Art_Institute_of_Chicago%29_adjusted.jpg/400px-Henri_de_Toulouse-Lautrec_-_Moulin_Rouge-_La_Goulue_%28Art_Institute_of_Chicago%29_adjusted.jpg',
        addedAt: now - 86400000 * 4
      },
      {
        id: uid(),
        title: 'Uncle Sam Wants You',
        artist: 'James Montgomery Flagg',
        year: '1917',
        category: 'political',
        notes: 'Originally used for WWI army recruitment. Later reprinted for WWII.',
        imageData: null,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Unclesamwantyou.jpg/400px-Unclesamwantyou.jpg',
        addedAt: now - 86400000 * 3
      },
      {
        id: uid(),
        title: 'Vertigo',
        artist: 'Saul Bass',
        year: '1958',
        category: 'film',
        notes: 'Saul Bass defined a generation of film title sequences and posters.',
        imageData: null,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Vertigomovie_restoration.jpg/400px-Vertigomovie_restoration.jpg',
        addedAt: now - 86400000 * 2
      },
      {
        id: uid(),
        title: 'Keep Calm and Carry On',
        artist: 'Ministry of Information (UK)',
        year: '1939',
        category: 'political',
        notes: 'WWII motivational poster. Rarely distributed at the time; discovered in 2000.',
        imageData: null,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Keep_Calm_and_Carry_On_Poster.svg/400px-Keep_Calm_and_Carry_On_Poster.svg.png',
        addedAt: now - 86400000 * 1
      },
      {
        id: uid(),
        title: 'Fillmore West',
        artist: 'Victor Moscoso',
        year: '1967',
        category: 'music',
        notes: 'Psychedelic concert poster. Moscoso pioneered vibrating color combinations.',
        imageData: null,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Victor_Moscoso-_Neon_Rose_13.jpg/400px-Victor_Moscoso-_Neon_Rose_13.jpg',
        addedAt: now
      }
    ];
  }

  // ─── Render gallery ────────────────────────
  function renderGallery() {
    let filtered = activeFilter === 'all'
      ? [...posters]
      : posters.filter(p => p.category === activeFilter);

    filtered.sort((a, b) =>
      activeSort === 'newest' ? b.addedAt - a.addedAt : a.addedAt - b.addedAt
    );

    grid.innerHTML = '';
    emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';

    filtered.forEach((poster, i) => {
      const card = buildCard(poster, i);
      grid.appendChild(card);
    });

    postCount.textContent = `${posters.length} poster${posters.length !== 1 ? 's' : ''}`;
  }

  function buildCard(poster, index) {
    const card = document.createElement('div');
    card.className = 'poster-card';
    card.style.animationDelay = `${Math.min(index * 40, 400)}ms`;

    const imgSrc = poster.imageData || poster.imageUrl || '';

    card.innerHTML = `
      <div class="poster-img-wrap">
        <img
          src="${escHtml(imgSrc)}"
          alt="${escHtml(poster.title)}"
          loading="lazy"
          onerror="this.style.minHeight='120px';this.style.background='#232120'"
        />
      </div>
      <div class="card-overlay"></div>
      <div class="card-body">
        <div class="card-category">${escHtml(poster.category)}</div>
        <div class="card-title">${escHtml(poster.title || 'Untitled')}</div>
        <div class="card-meta">
          ${poster.artist ? `<span>${escHtml(poster.artist)}</span>` : ''}
          ${poster.year ? `<span>${escHtml(poster.year)}</span>` : ''}
        </div>
      </div>
    `;

    card.addEventListener('click', () => openLightbox(poster));
    return card;
  }

  // ─── Lightbox ──────────────────────────────
  function openLightbox(poster) {
    const imgSrc = poster.imageData || poster.imageUrl || '';
    lightboxImg.src = imgSrc;
    lightboxImg.alt = poster.title || 'Poster';

    lightboxMeta.innerHTML = `
      <div class="lbm-category">${escHtml(poster.category)}</div>
      <div class="lbm-title">${escHtml(poster.title || 'Untitled')}</div>
      ${poster.artist ? `
      <div class="lbm-row">
        <span class="lbm-key">Artist</span>
        <span class="lbm-value">${escHtml(poster.artist)}</span>
      </div>` : ''}
      ${poster.year ? `
      <div class="lbm-row">
        <span class="lbm-key">Year</span>
        <span class="lbm-value">${escHtml(poster.year)}</span>
      </div>` : ''}
      <div class="lbm-row">
        <span class="lbm-key">Category</span>
        <span class="lbm-value">${escHtml(poster.category)}</span>
      </div>
      ${poster.notes ? `<div class="lbm-notes">"${escHtml(poster.notes)}"</div>` : ''}
      <div class="lbm-date-added">Added ${formatDate(poster.addedAt)}</div>
    `;

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  // ─── Upload modal ──────────────────────────
  function openUploadModal() {
    resetUploadForm();
    uploadModal.classList.add('open');
    uploadModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeUploadModal() {
    uploadModal.classList.remove('open');
    uploadModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function resetUploadForm() {
    pendingImageData = null;
    previewImg.src = '';
    uploadPreview.style.display = 'none';
    uploadPrompt.style.display = 'block';
    fileInput.value = '';
    document.getElementById('posterTitle').value = '';
    document.getElementById('posterArtist').value = '';
    document.getElementById('posterYear').value = '';
    document.getElementById('posterCategory').value = 'music';
    document.getElementById('posterNotes').value = '';
    uploadError.style.display = 'none';
    submitBtn.disabled = false;
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showError('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showError('Image must be under 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      pendingImageData = e.target.result;
      previewImg.src = pendingImageData;
      uploadPrompt.style.display = 'none';
      uploadPreview.style.display = 'block';
      uploadError.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!pendingImageData) {
      showError('Please add an image first.');
      return;
    }

    const title    = document.getElementById('posterTitle').value.trim();
    const artist   = document.getElementById('posterArtist').value.trim();
    const year     = document.getElementById('posterYear').value.trim();
    const category = document.getElementById('posterCategory').value;
    const notes    = document.getElementById('posterNotes').value.trim();

    const poster = {
      id: uid(),
      title:     title || 'Untitled',
      artist,
      year,
      category,
      notes,
      imageData: pendingImageData,
      imageUrl:  null,
      addedAt:   Date.now()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding…';

    // Slight delay for UX feel
    setTimeout(() => {
      posters.unshift(poster);
      savePosters();

      // Reset filter to show all so new poster is visible
      activeFilter = 'all';
      document.querySelectorAll('.filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.filter === 'all');
      });

      renderGallery();
      closeUploadModal();
      submitBtn.textContent = 'Add to Archive';
    }, 300);
  }

  function showError(msg) {
    uploadError.textContent = msg;
    uploadError.style.display = 'block';
  }

  // ─── Drag & drop ───────────────────────────
  dropZone.addEventListener('click', (e) => {
    if (!e.target.closest('.preview-remove') && !e.target.closest('.file-link')) {
      if (!pendingImageData) fileInput.click();
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  fileInput.addEventListener('change', () => {
    handleFile(fileInput.files[0]);
  });

  // ─── Event listeners ───────────────────────
  document.getElementById('openUploadBtn').addEventListener('click', openUploadModal);
  document.getElementById('emptyUploadBtn').addEventListener('click', openUploadModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeUploadModal);
  document.getElementById('cancelBtn').addEventListener('click', closeUploadModal);
  document.getElementById('removePreview').addEventListener('click', (e) => {
    e.stopPropagation();
    pendingImageData = null;
    previewImg.src = '';
    uploadPreview.style.display = 'none';
    uploadPrompt.style.display = 'block';
    fileInput.value = '';
  });

  submitBtn.addEventListener('click', handleSubmit);

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);

  // Close on overlay click
  uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) closeUploadModal();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.closest('.lightbox-inner') === null) {
      closeLightbox();
    }
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('open')) closeLightbox();
      else if (uploadModal.classList.contains('open')) closeUploadModal();
    }
  });

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderGallery();
    });
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    activeSort = e.target.value;
    renderGallery();
  });

  // ─── Helpers ───────────────────────────────
  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatDate(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  // ─── Init ──────────────────────────────────
  loadPosters();
  renderGallery();

})();