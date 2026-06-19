document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var trigger = player.querySelector("[data-play-trigger]");
    var cover = player.querySelector("[data-player-cover]");
    var source = player.getAttribute("data-src");
    var ready = false;
    var hlsInstance = null;

    function attachSource() {
      if (!video || !source || ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      ready = true;
    }

    function startPlayback() {
      attachSource();
      if (!video) {
        return;
      }
      player.classList.add("is-playing");
      video.controls = true;
      var playAction = video.play();
      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", startPlayback);
    }
    if (cover && cover !== trigger) {
      cover.addEventListener("click", startPlayback);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!ready) {
          startPlayback();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
});
