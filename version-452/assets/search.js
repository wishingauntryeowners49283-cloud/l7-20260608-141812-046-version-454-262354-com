(function () {
  var movies = window.MOVIE_SEARCH_INDEX || [];
  var keyword = document.getElementById('searchKeyword');
  var year = document.getElementById('searchYear');
  var type = document.getElementById('searchType');
  var region = document.getElementById('searchRegion');
  var reset = document.getElementById('searchReset');
  var count = document.getElementById('searchCount');
  var results = document.getElementById('searchResults');

  function unique(key) {
    return Array.from(new Set(movies.map(function (movie) {
      return movie[key];
    }).filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
  }

  function fill(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy" />',
      '    <span class="poster-shade"></span>',
      '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function apply() {
    if (!results) {
      return;
    }
    var q = keyword ? keyword.value.trim().toLowerCase() : '';
    var yearValue = year ? year.value : '';
    var typeValue = type ? type.value : '';
    var regionValue = region ? region.value : '';
    var filtered = movies.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.oneLine,
        movie.category
      ].join(' ').toLowerCase();
      if (q && haystack.indexOf(q) === -1) {
        return false;
      }
      if (yearValue && movie.year !== yearValue) {
        return false;
      }
      if (typeValue && movie.type !== typeValue) {
        return false;
      }
      if (regionValue && movie.region !== regionValue) {
        return false;
      }
      return true;
    });
    filtered.sort(function (a, b) {
      if (b.year !== a.year) {
        return String(b.year).localeCompare(String(a.year), 'zh-Hans-CN');
      }
      return b.score - a.score;
    });
    var visible = filtered.slice(0, 240);
    results.innerHTML = visible.map(card).join('');
    if (count) {
      count.textContent = '共匹配 ' + filtered.length + ' 部影片，当前显示前 ' + visible.length + ' 部。';
    }
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && keyword) {
      keyword.value = q;
    }
  }

  fill(year, unique('year'));
  fill(type, unique('type'));
  fill(region, unique('region'));
  readQuery();

  [keyword, year, type, region].forEach(function (control) {
    if (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    }
  });

  if (reset) {
    reset.addEventListener('click', function () {
      if (keyword) {
        keyword.value = '';
      }
      if (year) {
        year.value = '';
      }
      if (type) {
        type.value = '';
      }
      if (region) {
        region.value = '';
      }
      apply();
    });
  }

  apply();
})();
