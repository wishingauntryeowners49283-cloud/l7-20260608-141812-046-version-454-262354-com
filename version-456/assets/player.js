(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function formatTime(value) {
        if (!Number.isFinite(value)) {
            return "0:00";
        }
        var minutes = Math.floor(value / 60);
        var seconds = Math.floor(value % 60).toString().padStart(2, "0");
        return minutes + ":" + seconds;
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector("[data-overlay]");
            var source = player.getAttribute("data-video-src");
            var attached = false;
            var hls = null;

            if (!video || !source) {
                return;
            }

            function attachSource() {
                if (attached) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else {
                    video.src = source;
                }
            }

            function startVideo() {
                attachSource();
                video.setAttribute("controls", "controls");
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", startVideo);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    startVideo();
                }
            });

            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });

            video.addEventListener("loadedmetadata", function () {
                video.setAttribute("aria-valuetext", formatTime(video.duration));
            });

            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    });
})();
