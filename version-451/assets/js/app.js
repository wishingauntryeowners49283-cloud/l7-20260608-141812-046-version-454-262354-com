(function () {
  function $(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = $('[data-hero-slide]');
    var dots = $('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    setInterval(function () {
      show(active + 1);
    }, 5600);
  }

  function setupSearchForms() {
    $('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function setupFiltering() {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var input = document.querySelector('[data-filter-input]');
    var regionSelect = document.querySelector('[data-region-select]');
    var sortSelect = document.querySelector('[data-sort-select]');
    var cards = $('.movie-card', grid);
    var query = new URLSearchParams(window.location.search).get('q') || '';
    if (input && query) {
      input.value = query;
    }
    function normalize(value) {
      return (value || '').toString().toLowerCase();
    }
    function applyFilter() {
      var term = normalize(input ? input.value : '');
      var region = regionSelect ? regionSelect.value : 'all';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardRegion = card.getAttribute('data-region') || '';
        var matchTerm = !term || haystack.indexOf(term) !== -1;
        var matchRegion = region === 'all' || cardRegion === region || cardRegion.indexOf(region) !== -1;
        card.classList.toggle('filter-hidden', !(matchTerm && matchRegion));
      });
    }
    function applySort() {
      if (!sortSelect || sortSelect.value === 'default') {
        return;
      }
      var sorted = cards.slice().sort(function (a, b) {
        if (sortSelect.value === 'year') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }
        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }
    applySort();
    applyFilter();
  }

  function setupPlayers() {
    $('.player-wrap').forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var overlay = wrap.querySelector('.player-overlay');
      var stream = wrap.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;
      if (!video || !stream) {
        return;
      }
      function playVideo() {
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }
      function start() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        if (!started) {
          started = true;
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          } else {
            video.src = stream;
            playVideo();
          }
        } else {
          playVideo();
        }
      }
      if (overlay) {
        overlay.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupSearchForms();
    setupFiltering();
    setupPlayers();
  });
})();
