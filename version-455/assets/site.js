(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobileNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var currentSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === currentSlide);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === currentSlide);
      });
    }

    if (slides.length) {
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(currentSlide - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(currentSlide + 1);
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });
      window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-search]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
    var activeCategory = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function filterCards(root) {
      var scope = root || document;
      var input = scope.querySelector("[data-movie-search]") || document.querySelector("[data-movie-search]");
      var query = normalize(input ? input.value : "");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-category"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardCategory = card.getAttribute("data-category") || "";
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchCategory = activeCategory === "all" || cardCategory === activeCategory;
        card.style.display = matchQuery && matchCategory ? "" : "none";
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        filterCards(document);
      });
    });

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.getAttribute("data-filter-category") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        filterCards(document);
      });
    });

    Array.prototype.slice.call(document.querySelectorAll(".static-player")).forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-cover");
      var src = player.getAttribute("data-video-src");

      if (!video || !src) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else {
        video.src = src;
      }

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      function toggleVideo() {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }

      video.addEventListener("click", toggleVideo);
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
    });
  });
})();
