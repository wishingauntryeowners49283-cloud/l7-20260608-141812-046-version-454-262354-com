(() => {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  ready(() => {
    initMobileMenu();
    initCarousel();
    initFilters();
    initPlayers();
  });

  function initMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", () => {
      menu.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
      const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
      const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
      const prev = carousel.querySelector("[data-carousel-prev]");
      const next = carousel.querySelector("[data-carousel-next]");
      let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
      let timer = null;

      if (slides.length < 2) {
        return;
      }

      const show = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      };

      const start = () => {
        stop();
        timer = window.setInterval(() => show(active + 1), 5200);
      };

      const stop = () => {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };

      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          show(index);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", () => {
          show(active - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", () => {
          show(active + 1);
          start();
        });
      }

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      start();
    });
  }

  function initFilters() {
    const input = document.querySelector("[data-filter-input]");
    const items = Array.from(document.querySelectorAll("[data-filter-item]"));
    const empty = document.querySelector("[data-empty-state]");

    if (!input || !items.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    input.value = initial;

    const apply = () => {
      const words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let visible = 0;

      items.forEach((item) => {
        const text = (item.getAttribute("data-search") || "").toLowerCase();
        const matched = words.every((word) => text.includes(word));
        item.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    input.addEventListener("input", apply);
    apply();
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach((box) => {
      const video = box.querySelector("video[data-hls]");
      const overlay = box.querySelector(".player-overlay");
      const message = box.querySelector("[data-player-message]");
      let hls = null;

      if (!video) {
        return;
      }

      const source = video.getAttribute("data-hls");

      const setMessage = (text) => {
        if (message) {
          message.textContent = text;
        }
      };

      const attach = () => {
        if (video.dataset.ready === "1") {
          return true;
        }

        if (!source) {
          setMessage("播放源暂不可用");
          return false;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.dataset.ready = "1";
          return true;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.dataset.ready = "1";
          return true;
        }

        setMessage("当前播放环境不支持此视频格式");
        return false;
      };

      const play = () => {
        if (!attach()) {
          return;
        }

        video.play().then(() => {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        }).catch(() => {
          setMessage("点击视频控件开始播放");
        });
      };

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("play", () => {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", () => {
        if (overlay && !video.ended) {
          overlay.classList.remove("is-hidden");
        }
      });

      window.addEventListener("beforeunload", () => {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }
})();
