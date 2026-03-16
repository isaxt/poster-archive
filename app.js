/* =============================================
   PASTE — Poster Archive
   app.js — Gallery, Upload, Lightbox logic
   Storage: localStorage (shared in-browser)
   ============================================= */

(function () {
  'use strict';

  // ─── Storage key ───────────────────────────
  const STORAGE_KEY = 'paste_posters_v6';

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
      if (!raw) savePosters();
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

  // Seed posters — local files from the /posters folder
  function getSeedPosters() {
  const now = Date.now();
  const files = [
    { file: 'a_typography.png',        title: 'A Typography',         category: 'art'         },
    { file: 'abstract_bodies.png',     title: 'Abstract Bodies',      category: 'art'         },
    { file: 'abstract.png',            title: 'Abstract',             category: 'art'         },
    { file: 'ai_plant.png',            title: 'AI Plant',             category: 'art'         },
    { file: 'ai_psych.png',            title: 'AI Psych',             category: 'art'         },
    { file: 'anthology_censor.png',    title: 'Anthology Censor',     category: 'art'         },
    { file: 'art_statement_2.png',     title: 'Art Statement 2',      category: 'art'         },
    { file: 'art_statement_3.png',     title: 'Art Statement 3',      category: 'art'         },
    { file: 'art_statement_4.png',     title: 'Art Statement 4',      category: 'art'         },
    { file: 'art_statement.png',       title: 'Art Statement',        category: 'art'         },
    { file: 'beauty_within.png',       title: 'Beauty Within',        category: 'art'         },
    { file: 'blue_qr.png',             title: 'Blue QR',              category: 'art'         },
    { file: 'brooklyn_exhibition.png', title: 'Brooklyn Exhibition',  category: 'event'       },
    { file: 'catnip.png',              title: 'Catnip',               category: 'art'         },
    { file: 'cd_lecture.png',          title: 'CD Lecture',           category: 'event'       },
    { file: 'cd_talk.png',             title: 'CD Talk',              category: 'event'       },
    { file: 'class_catalog.png',       title: 'Class Catalog',        category: 'event'       },
    { file: 'collage_poster.png',      title: 'Collage Poster',       category: 'art'         },
    { file: 'color_art.png',           title: 'Color Art',            category: 'art'         },
    { file: 'columbia_engineering.png',title: 'Columbia Engineering', category: 'event'       },
    { file: 'cool spiral.png',         title: 'Cool Spiral',          category: 'art'         },
    { file: 'crazy_graphics.png',      title: 'Crazy Graphics',       category: 'art'         },
    { file: 'creative_open_call.png',  title: 'Creative Open Call',   category: 'event'       },
    { file: 'cute_letter.png',         title: 'Cute Letter',          category: 'art'         },
    { file: 'daemons.png',             title: 'Daemons',              category: 'art'         },
    { file: 'day_ta.png',              title: 'Day TA',               category: 'event'       },
    { file: 'design_before.png',       title: 'Design Before',        category: 'art'         },
    { file: 'enthographic_media.png',  title: 'Ethnographic Media',   category: 'event'       },
    { file: 'exhibition_poster.png',   title: 'Exhibition Poster',    category: 'event'       },
    { file: 'f_train.png',             title: 'F Train',              category: 'art'         },
    { file: 'fallen_poster.png',       title: 'Fallen Poster',        category: 'art'         },
    { file: 'fashion_grad.JPG',        title: 'Synergies',            category: 'event'       },
    { file: 'fbi_film.png',            title: 'FBI Film',             category: 'event'       },
    { file: 'food_allergy.png',        title: 'Food Allergy',         category: 'advertising' },
    { file: 'fragmented_hope.png',     title: 'Fragmented Hope',      category: 'art'         },
    { file: 'french.png',              title: 'French',               category: 'art'         },
    { file: 'friends.png',             title: 'Friends',              category: 'art'         },
    { file: 'gug_panel.png',           title: 'Gug Panel',            category: 'event'       },
    { file: 'i_love.png',              title: 'I Love',               category: 'art'         },
    { file: 'illustration_mixer.png',  title: 'Illustration Mixer',   category: 'event'       },
    { file: 'imagine.png',             title: 'Imagine',              category: 'art'         },
    { file: 'is_it_fate.png',          title: 'Is It Fate',           category: 'art'         },
    { file: 'kite_city.png',           title: 'Kite City',            category: 'art'         },
    { file: 'learn_art.png',           title: 'Learn Art',            category: 'event'       },
    { file: 'local_s3.png',            title: 'Local S3',             category: 'art'         },
    { file: 'love_messengers.png',     title: 'Love Messengers',      category: 'art'         },
    { file: 'mai.png',                 title: 'Mai',                  category: 'art'         },
    { file: 'man_trapped.png',         title: 'Man Trapped',          category: 'art'         },
    { file: 'media_res.png',           title: 'Media Res',            category: 'event'       },
    { file: 'mocca.png',               title: 'Mocca',                category: 'advertising' },
    { file: 'new_yorker.png',          title: 'New Yorker',           category: 'art'         },
    { file: 'no_wifi.png',             title: 'No WiFi',              category: 'art'         },
    { file: 'party_poster.PNG',        title: 'Party Poster',         category: 'event'       },
    { file: 'pattern_freak.png',       title: 'Pattern Freak',        category: 'art'         },
    { file: 'photo_crit.PNG',          title: 'Photo Crit',           category: 'event'       },
    { file: 'photo_fest.png',          title: 'Photo Fest',           category: 'event'       },
    { file: 'pink_redacted.png',       title: 'Pink Redacted',        category: 'art'         },
    { file: 'plant_tag.png',           title: 'Plant Tag',            category: 'art'         },
    { file: 'praxis.png',              title: 'Praxis',               category: 'event'       },
    { file: 'president_protocol.png',  title: 'President Protocol',   category: 'event'       },
    { file: 'print_show.png',          title: 'Print Show',           category: 'event'       },
    { file: 'publication.png',         title: 'Publication',          category: 'event'       },
    { file: 'queen_elizabeth.png',     title: 'Queen Elizabeth',      category: 'art'         },
    { file: 'quran_snip.png',          title: 'Quran Snip',           category: 'art'         },
    { file: 'random_stuff.png',        title: 'Random Stuff',         category: 'art'         },
    { file: 'reader.png',              title: 'Reader',               category: 'art'         },
    { file: 'red_city.png',            title: 'Red City',             category: 'art'         },
    { file: 'red_poster.png',          title: 'Red Poster',           category: 'art'         },
    { file: 'rock_climbing.png',       title: 'Rock Climbing',        category: 'advertising' },
    { file: 'russia_china.png',        title: 'Russia China',         category: 'art'         },
    { file: 'russian.png',             title: 'Russian',              category: 'art'         },
    { file: 'subway_planned.png',      title: 'Subway Planned',       category: 'art'         },
    { file: 'surveillance.png',        title: 'Surveillance',         category: 'art'         },
    { file: 'taylor_swift.png',        title: 'Taylor Swift',         category: 'advertising' },
    { file: 'tech_start_up.png',       title: 'Tech Start Up',        category: 'advertising' },
    { file: 'time_frames.png',         title: 'Time Frames',          category: 'art'         },
    { file: 'transdiscplinary.PNG',    title: 'Transdisciplinary',    category: 'event'       },
    { file: 'vr_poster.png',           title: 'VR Poster',            category: 'event'       },
    { file: 'welcome_sf.png',          title: 'Welcome SF',           category: 'event'       },
    { file: 'yellow_plant.png',        title: 'Yellow Plant',         category: 'art'         },
  ];

  return files.map((p, i) => ({
    id: uid(),
    title: p.title,
    artist: '',
    year: '',
    category: p.category,
    notes: '',
    imageData: null,
    imageUrl: `posters/${p.file}`,
    addedAt: now - (files.length - i) * 86400000
  }));
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
          onerror="this.style.minHeight='120px';this.style.background='#f5ede2'"
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

    setTimeout(() => {
      posters.unshift(poster);
      savePosters();

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

  uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) closeUploadModal();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.closest('.lightbox-inner') === null) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('open')) closeLightbox();
      else if (uploadModal.classList.contains('open')) closeUploadModal();
    }
  });

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderGallery();
    });
  });

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