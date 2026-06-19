document.addEventListener("DOMContentLoaded", function () {
  var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  shells.forEach(function (shell) {
    var video = shell.querySelector("video");
    var startButton = shell.querySelector(".player-start");
    var stream = video ? video.getAttribute("data-stream") : "";
    var ready = false;
    var hls = null;

    function attachStream() {
      if (!video || !stream || ready) {
        return Promise.resolve();
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }

      video.src = stream;
      return Promise.resolve();
    }

    function playVideo() {
      if (startButton) {
        startButton.classList.add("is-hidden");
      }

      attachStream().then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (startButton) {
              startButton.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (startButton) {
      startButton.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  });
});
