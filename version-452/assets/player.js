import { H as Hls } from './hls-vendor.js';

function initVideo(video) {
  var shell = video.closest('[data-player-shell]');
  var status = shell ? shell.querySelector('[data-player-status]') : null;
  var playButton = shell ? shell.querySelector('[data-play-button]') : null;
  var source = video.getAttribute('data-src');
  var hlsInstance = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  if (!source) {
    setStatus('当前影片暂无播放源。');
    return;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus('播放源加载完成，点击播放。');
    });
    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus('网络波动，正在重新加载播放源。');
        hlsInstance.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus('媒体解码异常，正在尝试恢复。');
        hlsInstance.recoverMediaError();
      } else {
        setStatus('播放源暂时无法播放，请稍后重试。');
        hlsInstance.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    setStatus('播放源已绑定，点击播放。');
  } else {
    setStatus('当前浏览器不支持 HLS 播放。');
  }

  function playOrPause() {
    if (video.paused) {
      video.play().catch(function () {
        setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
      });
    } else {
      video.pause();
    }
  }

  if (playButton) {
    playButton.addEventListener('click', playOrPause);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playOrPause();
    }
  });

  video.addEventListener('play', function () {
    if (shell) {
      shell.classList.add('is-playing');
    }
    setStatus('正在播放。');
  });

  video.addEventListener('pause', function () {
    if (shell) {
      shell.classList.remove('is-playing');
    }
    setStatus('已暂停，点击继续播放。');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.hls-video').forEach(initVideo);
});
