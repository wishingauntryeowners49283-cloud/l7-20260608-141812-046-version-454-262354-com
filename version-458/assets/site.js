import { H as Hls } from './hls-vendor-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setupNavigation() {
  const toggle = $('.nav-toggle');
  const links = $('.site-nav-links');
  const search = $('.nav-search');

  if (!toggle || !links || !search) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    search.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

function setupSearchForms() {
  $$('.js-search-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const action = form.getAttribute('action') || 'search.html';

      if (query) {
        window.location.href = `${action}?q=${encodeURIComponent(query)}`;
      }
    });
  });
}

function setupHeroSlider() {
  const slider = $('[data-hero-slider]');

  if (!slider) {
    return;
  }

  const slides = $$('.hero-slide', slider);
  const dots = $$('.hero-dot', slider);
  const prev = $('[data-hero-prev]', slider);
  const next = $('[data-hero-next]', slider);
  let activeIndex = 0;
  let timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  prev?.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    startTimer();
  });

  next?.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    startTimer();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.slideTo || 0));
      startTimer();
    });
  });

  slider.addEventListener('mouseenter', stopTimer);
  slider.addEventListener('mouseleave', startTimer);
  showSlide(0);
  startTimer();
}

function setupCategoryFilters() {
  const grid = $('[data-card-grid]');

  if (!grid) {
    return;
  }

  const filterInput = $('.js-card-filter');
  const yearSelect = $('.js-year-filter');
  const sortSelect = $('.js-sort-select');
  const resultCount = $('[data-result-count]');
  const cards = $$('.movie-card', grid);

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    const keyword = normalize(filterInput?.value);
    const year = yearSelect?.value || '';
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize(card.dataset.search || '');
      const cardYear = card.dataset.year || '';
      const matchedKeyword = !keyword || haystack.includes(keyword);
      const matchedYear = !year || cardYear === year;
      const shouldShow = matchedKeyword && matchedYear;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = `${visible} 部影片`;
    }
  }

  function applySort() {
    const value = sortSelect?.value || 'year-desc';
    const sortedCards = [...cards].sort((left, right) => {
      if (value === 'score-desc') {
        return Number(right.dataset.score || 0) - Number(left.dataset.score || 0);
      }

      if (value === 'title-asc') {
        return String(left.dataset.title || '').localeCompare(String(right.dataset.title || ''), 'zh-Hans-CN');
      }

      return Number(right.dataset.year || 0) - Number(left.dataset.year || 0);
    });

    sortedCards.forEach((card) => grid.appendChild(card));
    applyFilters();
  }

  filterInput?.addEventListener('input', applyFilters);
  yearSelect?.addEventListener('change', applyFilters);
  sortSelect?.addEventListener('change', applySort);
  applySort();
}

function setupPlayers() {
  $$('.player-shell').forEach((shell) => {
    const video = $('.movie-player', shell);
    const startButton = $('.player-start', shell);
    const message = $('.player-message', shell);
    const source = shell.dataset.m3u8;
    let hls = null;
    let initialized = false;

    if (!video || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function initialize() {
      if (initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('正在使用浏览器原生 HLS 播放能力加载。');
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setMessage('播放源已就绪。');
        });
        hls.on(Hls.Events.ERROR, (eventName, data) => {
          if (data?.fatal) {
            setMessage('当前播放源加载异常，请刷新页面或稍后重试。');
          }
        });
      } else {
        setMessage('当前浏览器不支持 HLS 播放，请更换现代浏览器访问。');
      }
    }

    async function play() {
      initialize();
      startButton?.classList.add('is-hidden');

      try {
        await video.play();
      } catch (error) {
        startButton?.classList.remove('is-hidden');
        setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
      }
    }

    startButton?.addEventListener('click', play);
    video.addEventListener('play', () => startButton?.classList.add('is-hidden'));
    video.addEventListener('pause', () => {
      if (!video.currentTime) {
        startButton?.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', () => {
      hls?.destroy();
      hls = null;
    });
  });
}

function createSearchCard(movie) {
  const tags = (movie.tags || []).slice(0, 3)
    .map((tag) => `<span>${escapeHTML(tag)}</span>`)
    .join('');

  return `
    <article class="movie-card">
      <a class="movie-cover" href="${escapeHTML(movie.href)}" aria-label="观看 ${escapeHTML(movie.title)}">
        <img src="${escapeHTML(movie.cover)}" alt="${escapeHTML(movie.title)}" loading="lazy">
        <span class="movie-score">${escapeHTML(movie.score)}</span>
        <span class="movie-play">播放</span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta-line">
          <span>${escapeHTML(movie.year)}</span>
          <span>${escapeHTML(movie.region)}</span>
          <span>${escapeHTML(movie.type)}</span>
        </div>
        <h3><a href="${escapeHTML(movie.href)}">${escapeHTML(movie.title)}</a></h3>
        <p>${escapeHTML(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}

function setupSearchPage() {
  const container = $('[data-search-results]');
  const summary = $('[data-search-summary]');

  if (!container || !summary) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  const data = window.MOVIE_SEARCH_INDEX || [];
  const input = $('.big-search input[name="q"]');

  if (input) {
    input.value = query;
  }

  const normalizedQuery = query.toLowerCase();
  const results = data.filter((movie) => {
    if (!normalizedQuery) {
      return true;
    }

    const text = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      ...(movie.tags || [])
    ].join(' ').toLowerCase();

    return text.includes(normalizedQuery);
  });

  const sorted = results.sort((left, right) => Number(right.score) - Number(left.score));

  if (!query) {
    summary.textContent = `当前显示全站 ${sorted.length} 部影片，可输入关键词进一步筛选。`;
  } else {
    summary.textContent = `关键词“${query}”共找到 ${sorted.length} 部影片。`;
  }

  container.innerHTML = sorted.map(createSearchCard).join('');
}

setupNavigation();
setupSearchForms();
setupHeroSlider();
setupCategoryFilters();
setupPlayers();
setupSearchPage();
