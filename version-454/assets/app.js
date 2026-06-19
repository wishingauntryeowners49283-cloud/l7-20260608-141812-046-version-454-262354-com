(function () {
  var menuButton = document.querySelector('.js-menu-button');
  var mobileNav = document.querySelector('.js-mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('.js-hero-prev');
  var next = document.querySelector('.js-hero-next');
  var heroIndex = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === heroIndex);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  }

  function scheduleHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5600);
  }

  if (slides.length) {
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(heroIndex - 1);
        scheduleHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(heroIndex + 1);
        scheduleHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        scheduleHero();
      });
    });

    scheduleHero();
  }

  var searchInput = document.querySelector('.js-card-search');
  var filterSelect = document.querySelector('.js-card-filter');
  var sortSelect = document.querySelector('.js-card-sort');
  var grid = document.querySelector('.js-card-grid');

  function getCards() {
    return Array.prototype.slice.call(document.querySelectorAll('.js-card'));
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function applyCardTools() {
    var keyword = normalize(searchInput && searchInput.value);
    var filter = normalize(filterSelect && filterSelect.value);
    var cards = getCards();

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
      var category = normalize(card.getAttribute('data-category'));
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var filterMatch = !filter || category === filter;
      card.classList.toggle('is-filtered-out', !(keywordMatch && filterMatch));
    });
  }

  function sortCards() {
    if (!grid || !sortSelect) {
      return;
    }

    var mode = sortSelect.value;
    var cards = getCards();

    cards.sort(function (a, b) {
      var yearA = Number(a.getAttribute('data-year')) || 0;
      var yearB = Number(b.getAttribute('data-year')) || 0;
      var titleA = normalize(a.getAttribute('data-title'));
      var titleB = normalize(b.getAttribute('data-title'));

      if (mode === 'year-asc') {
        return yearA - yearB || titleA.localeCompare(titleB, 'zh-CN');
      }

      if (mode === 'title-asc') {
        return titleA.localeCompare(titleB, 'zh-CN') || yearB - yearA;
      }

      return yearB - yearA || titleA.localeCompare(titleB, 'zh-CN');
    });

    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyCardTools);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyCardTools);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sortCards();
      applyCardTools();
    });
  }

  var video = document.querySelector('.js-video');
  var playButton = document.querySelector('.js-play-button');
  var statusBox = document.querySelector('.js-player-status');
  var hlsPlayer = null;

  function setStatus(text) {
    if (statusBox) {
      statusBox.textContent = text || '';
    }
  }

  function attachVideo() {
    if (!video) {
      return Promise.reject(new Error('video missing'));
    }

    var stream = video.getAttribute('data-stream');

    if (!stream) {
      setStatus('视频暂时无法播放');
      return Promise.reject(new Error('stream missing'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.getAttribute('src') !== stream) {
        video.setAttribute('src', stream);
      }
      return video.play();
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsPlayer) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(stream);
        hlsPlayer.attachMedia(video);
      }

      return new Promise(function (resolve, reject) {
        hlsPlayer.once(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(resolve).catch(reject);
        });
        hlsPlayer.once(window.Hls.Events.ERROR, function () {
          reject(new Error('play error'));
        });
      });
    }

    video.setAttribute('src', stream);
    return video.play();
  }

  function playVideo() {
    if (!video) {
      return;
    }

    setStatus('正在加载视频');

    attachVideo().then(function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      setStatus('');
    }).catch(function () {
      setStatus('视频已就绪，请点击画面继续');
      if (playButton) {
        playButton.classList.remove('is-hidden');
      }
    });
  }

  if (playButton) {
    playButton.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      setStatus('');
    });

    video.addEventListener('pause', function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove('is-hidden');
      }
    });
  }
})();
