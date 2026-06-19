document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
    var container = scope.parentElement || document;
    var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
    var count = scope.querySelector("[data-result-count]");

    function cardText(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-tags") || ""
      ].join(" ").toLowerCase();
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var activeFilters = selects.map(function (select) {
        return {
          key: select.getAttribute("data-filter-select"),
          value: select.value
        };
      });
      var visible = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchSelects = activeFilters.every(function (filter) {
          if (!filter.value) {
            return true;
          }
          return (card.getAttribute("data-" + filter.key) || "") === filter.value;
        });
        var shown = matchQuery && matchSelects;
        card.classList.toggle("is-hidden", !shown);
        if (shown) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "显示 " + visible + " 部";
      }
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });
    applyFilters();
  });
});
