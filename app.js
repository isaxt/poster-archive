/* =============================================
   PASTE — Poster Archive
   app.js — Gallery, Upload, Lightbox logic
   Storage: localStorage (shared in-browser)
   ============================================= */

(function () {
  'use strict';

  // ─── Storage key ───────────────────────────
  const STORAGE_KEY = 'paste_posters_v7';

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
    { file: 'a_typography.png',        title: 'a',         category: 'advertising'         },
    { file: 'abstract_bodies.png',     title: 'abstract bodies',      category: 'art'         },
    { file: 'abstract.png',            title: 'abstract',             category: 'art'         },
    { file: 'ai_plant.png',            title: 'AI generated plant',             category: 'art'         },
    { file: 'ai_psych.png',            title: 'AI & Psychanalysis',             category: 'event'         },
    { file: 'anthology_censor.png',    title: 'Anthology of Censorship',     category: 'event'         },
    { file: 'art_statement_2.png',     title: 'Eric C. Chiang',      category: 'other'         },
    { file: 'art_statement_3.png',     title: 'Te-Sian Shih',      category: 'other'         },
    { file: 'art_statement_4.png',     title: 'Chin-Chih Yang',      category: 'other'         },
    { file: 'art_statement.png',       title: 'Huey-Min Chuang',        category: 'other'         },
    { file: 'beauty_within.png',       title: 'Beauty Within Realness',        category: 'advertising'         },
    { file: 'blue_qr.png',             title: 'blue QR',              category: 'art'         },
    { file: 'brooklyn_exhibition.png', title: 'Lettonne Exhibition',  category: 'event'       },
    { file: 'catnip.png',              title: 'Catnip',               category: 'other'         },
    { file: 'cd_lecture.png',          title: 'CD Lecture names',           category: 'event'       },
    { file: 'cd_talk.png',             title: 'CD Lecture Series',              category: 'event'       },
    { file: 'class_catalog.png',       title: 'Contemplative Design+Sacred Spaces',        category: 'advertising'       },
    { file: 'collage_poster.png',      title: 'untitled, collage',       category: 'art'         },
    { file: 'color_art.png',           title: 'Color Art',            category: 'art'         },
    { file: 'columbia_engineering.png',title: 'Columbia Engineering', category: 'event'       },
    { file: 'cool spiral.png',         title: 'spirals',          category: 'art'         },
    { file: 'crazy_graphics.png',      title: 'crazy graphics',       category: 'art'         },
    { file: 'creative_open_call.png',  title: 'Creative Open Call',   category: 'event'       },
    { file: 'cute_letter.png',         title: 'cute letter',          category: 'art'         },
    { file: 'daemons.png',             title: 'Daemons & Other Devices',              category: 'advertising'         },
    { file: 'day_ta.png',              title: 'DAY-KA-TU',               category: 'art'       },
    { file: 'design_before.png',       title: 'Design Before Design',        category: 'advertising'         },
    { file: 'enthographic_media.png',  title: 'Ethnographic Media Lab',   category: 'event'       },
    { file: 'exhibition_poster.png',   title: 'Exhibition Poster',    category: 'event'       },
    { file: 'f_train.png',             title: 'F Train service',              category: 'other'         },
    { file: 'fallen_poster.png',       title: 'build a...',        category: 'advertising'         },
    { file: 'fashion_grad.JPG',        title: 'Synergies',            category: 'event'       },
    { file: 'fbi_film.png',            title: 'FBI Film Disclaimer',             category: 'other'       },
    { file: 'food_allergy.png',        title: 'Food Allergy',         category: 'advertising' },
    { file: 'fragmented_hope.png',     title: 'Fragmented Hope',      category: 'art'         },
    { file: 'french.png',              title: 'untitled',               category: 'art'         },
    { file: 'friends.png',             title: 'we are all friends',              category: 'art'         },
    { file: 'gug_panel.png',           title: 'Panel, 2024',            category: 'event'       },
    { file: 'i_love.png',              title: 'I Love You',               category: 'other'         },
    { file: 'illustration_mixer.png',  title: 'Illustration Mixer',   category: 'event'       },
    { file: 'imagine.png',             title: 'IMAGINE A WORLD',              category: 'art'         },
    { file: 'is_it_fate.png',          title: 'Is It Fate',           category: 'advertising'         },
    { file: 'kite_city.png',           title: 'Kite City',            category: 'advertising'         },
    { file: 'learn_art.png',           title: 'Learning Through Art',            category: 'art'       },
    { file: 'local_s3.png',            title: 'Local S3',             category: 'advertising'         },
    { file: 'love_messengers.png',     title: 'Love Messengers',      category: 'event'         },
    { file: 'mai.png',                 title: 'Mai',                  category: 'art'         },
    { file: 'man_trapped.png',         title: 'Man Trapped Inside His Phone',          category: 'advertising'         },
    { file: 'media_res.png',           title: 'in media res',            category: 'event'       },
    { file: 'mocca.png',               title: 'Mocca Open Call',                category: 'advertising' },
    { file: 'new_yorker.png',          title: 'New Yorker Wall',           category: 'other'         },
    { file: 'no_wifi.png',             title: 'No WiFi',              category: 'other'         },
    { file: 'party_poster.PNG',        title: 'Party Poster',         category: 'event'       },
    { file: 'pattern_freak.png',       title: 'Pattern Freak',        category: 'advertising'         },
    { file: 'photo_crit.PNG',          title: 'Photo Crit',           category: 'art'       },
    { file: 'photo_fest.png',          title: 'Photo Feast',           category: 'event'       },
    { file: 'pink_redacted.png',       title: '[pink redacted]',        category: 'art'         },
    { file: 'plant_tag.png',           title: 'Custom HTML Plant Tag',            category: 'other'         },
    { file: 'praxis.png',              title: 'Praxis',               category: 'other'       },
    { file: 'president_protocol.png',  title: 'President Protocol',   category: 'event'       },
    { file: 'print_show.png',          title: 'Print Show',           category: 'event'       },
    { file: 'publication.png',         title: 'publication poster',          category: 'event'       },
    { file: 'queen_elizabeth.png',     title: 'Queen Elizabeth',      category: 'other'         },
    { file: 'quran_snip.png',          title: 'Quran Snip',           category: 'art'         },
    { file: 'random_stuff.png',        title: 'Random Stuff',         category: 'event'         },
    { file: 'reader.png',              title: 'Reeder',               category: 'art'         },
    { file: 'red_city.png',            title: 'Red City',             category: 'art'         },
    { file: 'red_poster.png',          title: 'Red Poster',           category: 'art'         },
    { file: 'rock_climbing.png',       title: 'Rock Climbing',        category: 'advertising' },
    { file: 'russia_china.png',        title: 'Russia + China',         category: 'other'         },
    { file: 'russian.png',             title: 'untitled',              category: 'art'         },
    { file: 'subway_planned.png',      title: 'L service',       category: 'other'         },
    { file: 'surveillance.png',        title: 'Surveillance',         category: 'art'         },
    { file: 'taylor_swift.png',        title: 'Taylor Swift Event',         category: 'advertising' },
    { file: 'tech_start_up.png',       title: 'Tech Start Up',        category: 'advertising' },
    { file: 'time_frames.png',         title: 'Time Frames',          category: 'art'         },
    { file: 'transdiscplinary.PNG',    title: 'Transdisciplinary',    category: 'event'       },
    { file: 'vr_poster.png',           title: 'VR Poster',            category: 'art'       },
    { file: 'welcome_sf.png',          title: 'Welcome to SF',           category: 'event'       },
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