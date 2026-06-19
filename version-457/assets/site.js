document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (navToggle && mobilePanel) {
    navToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterScope = document.querySelector("[data-filter-scope]");

  if (filterScope) {
    var searchInput = filterScope.querySelector("[data-search-input]");
    var categorySelect = filterScope.querySelector("[data-category-select]");
    var typeSelect = filterScope.querySelector("[data-type-select]");
    var yearSelect = filterScope.querySelector("[data-year-select]");
    var cards = Array.prototype.slice.call(filterScope.querySelectorAll("[data-card]"));

    function normalized(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalized(searchInput ? searchInput.value : "");
      var category = normalized(categorySelect ? categorySelect.value : "");
      var type = normalized(typeSelect ? typeSelect.value : "");
      var year = normalized(yearSelect ? yearSelect.value : "");

      cards.forEach(function (card) {
        var text = normalized(card.getAttribute("data-text"));
        var cardCategory = normalized(card.getAttribute("data-category"));
        var cardType = normalized(card.getAttribute("data-type"));
        var cardYear = normalized(card.getAttribute("data-year"));
        var visible = true;

        if (keyword && text.indexOf(keyword) === -1) {
          visible = false;
        }
        if (category && category !== cardCategory) {
          visible = false;
        }
        if (type && type !== cardType) {
          visible = false;
        }
        if (year && year !== cardYear) {
          visible = false;
        }

        card.classList.toggle("hidden-card", !visible);
      });
    }

    [searchInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  }
});
