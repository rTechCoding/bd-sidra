/* ==========================================================================
   Sidra's Birthday Celebration - Main Controller & Navigation Switcher
   ========================================================================== */

let currentGalleryIndex = 0;
let ytAboutPlayer = null;
let wasPlayingBackgroundMusicBeforeVideo = false;

/* YouTube IFrame API Global Callback */
window.onYouTubeIframeAPIReady = function() {
  ytAboutPlayer = new YT.Player('about-yt-player', {
    height: '315',
    width: '100%',
    videoId: 'OVLrXFwNKT4',
    playerVars: {
      'autoplay': 1,
      'controls': 1,
      'rel': 0,
      'modestbranding': 1,
      'enablejsapi': 1
    },
    events: {
      'onReady': onAboutPlayerReady
    }
  });
};

function onAboutPlayerReady() {
  initAboutVideoScrollObserver();
}

function initAboutVideoScrollObserver() {
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = aboutSection.querySelector('video');
      const iframe = aboutSection.querySelector('iframe');

      if (entry.isIntersecting) {
        if (window.birthdayAudio && window.birthdayAudio.isPlaying) {
          wasPlayingBackgroundMusicBeforeVideo = true;
          window.birthdayAudio.pause();
        }
        if (video) {
          video.play().catch(e => console.log(e));
        }
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          } catch(e) {}
        }
      } else {
        if (video) {
          video.pause();
        }
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          } catch(e) {}
        }
        if (wasPlayingBackgroundMusicBeforeVideo && window.birthdayAudio) {
          window.birthdayAudio.play();
          wasPlayingBackgroundMusicBeforeVideo = false;
        }
      }
    });
  }, { threshold: 0.15 });

  observer.observe(aboutSection);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutVideoScrollObserver);
} else {
  initAboutVideoScrollObserver();
}

// Dynamically inject YouTube Iframe API script
(function loadYouTubeApi() {
  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }
  }
})();

window.toggleTheme = function() {
  const isLight = document.body.classList.toggle('light-mode');
  const icon = document.getElementById('theme-toggle-icon');
  if (icon) icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';

  localStorage.setItem('sidra_theme', isLight ? 'light' : 'dark');
  if (window.birthdayAudio) window.birthdayAudio.playPopSound();
};

window.initTheme = function() {
  const savedTheme = localStorage.getItem('sidra_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) icon.className = 'fas fa-sun';
  }
};

window.openLightbox = function(target) {
  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const allImgs = Array.from(document.querySelectorAll('.gallery-item img'));

  if (!modal || !imgEl || allImgs.length === 0) return;

  let imgSrc = '';

  if (typeof target === 'number') {
    currentGalleryIndex = Math.max(0, Math.min(target, allImgs.length - 1));
    imgSrc = allImgs[currentGalleryIndex].src;
  } else if (target && target.nodeType) {
    const img = target.tagName === 'IMG' ? target : target.querySelector('img');
    if (img) {
      imgSrc = img.src;
      const foundIdx = allImgs.indexOf(img);
      if (foundIdx !== -1) currentGalleryIndex = foundIdx;
    }
  } else {
    currentGalleryIndex = 0;
    imgSrc = allImgs[0].src;
  }

  if (imgSrc) {
    imgEl.src = imgSrc;
    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
    if (window.birthdayAudio) window.birthdayAudio.playPopSound();
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => { modal.style.display = 'none'; }, 400);
  }
};

window.navigateLightbox = function(dir) {
  const allImgs = Array.from(document.querySelectorAll('.gallery-item img'));
  if (allImgs.length === 0) return;

  currentGalleryIndex = (currentGalleryIndex + dir + allImgs.length) % allImgs.length;
  const imgEl = document.getElementById('lightbox-img');
  if (imgEl && allImgs[currentGalleryIndex]) {
    imgEl.src = allImgs[currentGalleryIndex].src;
    if (window.birthdayAudio) window.birthdayAudio.playPopSound();
  }
};

window.openGiftModal = function(title, desc, icon) {
  AppController.showModal(title, desc, icon);
};

window.blowCakeCandles = function() {
  const btn = document.getElementById('blow-candles-btn');
  const flames = document.querySelectorAll('.flame');
  const overlay = document.querySelector('.cake-flames-overlay');

  if (btn) btn.disabled = true;

  // 1. Play blowing wind audio
  if (window.birthdayAudio) window.birthdayAudio.playBlowoutSound();

  // 2. Start candle blowing flame animation & rising smoke puffs
  flames.forEach((f, idx) => {
    setTimeout(() => {
      f.classList.add('blowing');
      if (overlay) {
        const smoke = document.createElement('div');
        smoke.className = 'smoke-puff';
        smoke.style.top = getComputedStyle(f).top;
        smoke.style.left = getComputedStyle(f).left;
        overlay.appendChild(smoke);
        setTimeout(() => smoke.remove(), 2200);
      }
    }, idx * 120);
  });

  // 3. Stop flame effect & trigger live celebration on cake stage
  setTimeout(() => {
    flames.forEach(f => {
      f.classList.remove('blowing');
      f.classList.add('blown-out');
    });

    if (window.birthdayAudio) window.birthdayAudio.playPopSound();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    }
  }, 1800);

  // 4. Give user time to enjoy live cake celebration, THEN open popup after 3.5s!
  setTimeout(() => {
    if (btn) btn.disabled = false;
    AppController.showModal("🎂 Wish Granted! 🎂", "Sidra's birthday candles have been blown out! May all your sweet birthday wishes, dreams, and eternal happiness come true!", "🕯️");
  }, 3500);
};

window.openMysteryBox = function() {
  AppController.showModal("Mystery Unlocked! 👑", "Sidra, you are an extraordinary treasure! Thank you for illuminating our lives with your kindness, elegance, and beauty!", "💖");
};

function extractYouTubeVideoId(url) {
  if (!url) return 'chLjOfmT0js';
  const match = url.match(/(?:embed\/|v\/|watch\?v=|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : 'chLjOfmT0js';
}

window.openVideoModal = function(videoUrl) {
    const modal = document.getElementById("videoModal");
    const iframe = document.getElementById("videoFrame");

    // Mute/Pause background music automatically when opening video
    if (window.birthdayAudio) {
      if (window.birthdayAudio.isPlaying) {
        wasPlayingBackgroundMusicBeforeVideo = true;
      }
      window.birthdayAudio.pause();
    }

    if (iframe) iframe.src = videoUrl;
    if (modal) {
      modal.style.display = "flex";
      modal.classList.add("active");
    }

    if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
};

window.closeVideoModal = function() {
    const iframe = document.getElementById("videoFrame");
    const modal = document.getElementById("videoModal");

    if (iframe) iframe.src = "";
    if (modal) {
      modal.style.display = "none";
      modal.classList.remove("active");
    }

    if (wasPlayingBackgroundMusicBeforeVideo && window.birthdayAudio) {
      window.birthdayAudio.play();
      wasPlayingBackgroundMusicBeforeVideo = false;
    }
};

function modalOpacityZero(el) {
  el.style.opacity = '0';
  el.style.pointerEvents = 'none';
  setTimeout(() => { el.style.display = 'none'; }, 400);
}

window.toggleWishLike = function(btn) {
  const icon = btn.querySelector('i');
  const countEl = btn.querySelector('.like-count');

  if (icon) {
    const isLiked = icon.classList.contains('fas');
    if (isLiked) {
      icon.className = 'far fa-heart';
      icon.style.color = 'var(--primary-pink)';
      if (countEl) countEl.textContent = Math.max(0, parseInt(countEl.textContent || '0') - 1);
    } else {
      icon.className = 'fas fa-heart';
      icon.style.color = '#FF4D8D';
      if (countEl) countEl.textContent = parseInt(countEl.textContent || '0') + 1;
      if (typeof confetti === 'function') {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      }
    }
  }

  btn.style.transform = 'scale(1.2)';
  setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
  if (window.birthdayAudio) window.birthdayAudio.playPopSound();
};

window.scrollToTop = function() {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {}
  try {
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {}
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  if (window.birthdayAudio) window.birthdayAudio.playPopSound();
};

window.openTheaterCurtains = function() {
  const modal = document.getElementById('theater-curtain-modal');
  const centerStage = document.querySelector('.curtain-center-stage');
  const sideImgs = document.querySelectorAll('.curtain-side-img-wrap');

  if (centerStage) {
    centerStage.style.opacity = '0';
    centerStage.style.transform = 'translate(-50%, -50%) scale(0.9)';
    centerStage.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  }

  sideImgs.forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.4s ease';
  });

  if (window.birthdayAudio) {
    window.birthdayAudio.playPopSound();
    window.birthdayAudio.play();
  }

  if (typeof confetti === 'function') {
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
  }

  setTimeout(() => {
    if (modal) {
      modal.classList.add('opened');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 1600);
    }
  }, 250);
};

window.closeWelcomeModal = function() {
  const modal = document.getElementById('welcome-modal');
  const theaterModal = document.getElementById('theater-curtain-modal');

  if (theaterModal) window.openTheaterCurtains();

  if (modal) {
    modal.classList.remove('active');
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => { modal.style.display = 'none'; }, 500);
  }
};

class AppController {
  constructor() {
    window.appController = this;
    window.initTheme();
    this.initWelcomeModal();
    this.initTypedEffect();
    this.initCountdown();
    this.initKeyboardNav();
    this.initScrollTop();
  }

  initWelcomeModal() {
    // Registered welcome handlers
  }

  /* Global Custom Celebration Modal System */
  static showModal(title, message, icon = '🎉') {
    const modal = document.getElementById('celebration-modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const iconEl = document.getElementById('modal-icon');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;

    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'all';
    }

    if (window.birthdayAudio) window.birthdayAudio.playPopSound();
    if (typeof confetti === 'function') {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }

  static closeModal() {
    const modal = document.getElementById('celebration-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.opacity = '0';
      modal.style.pointerEvents = 'none';
      setTimeout(() => { modal.style.display = 'none'; }, 400);
    }
  }

  /* 1. Loading Screen (3 Seconds) - Starts after PIN 0808 is correct */
  startLoadingScreen() {
    const loader = document.getElementById('loader-screen');
    const progressBar = document.getElementById('loader-progress');
    const percentageText = document.getElementById('loader-percentage');
    const mainContent = document.getElementById('main-content');
    let progress = 0;

    const interval = setInterval(() => {
      progress += 5;
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (percentageText) percentageText.textContent = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (loader) {
            loader.style.opacity = '0';
            loader.style.pointerEvents = 'none';
            setTimeout(() => { loader.style.display = 'none'; }, 800);
          }
          if (mainContent) {
            mainContent.style.display = 'block';
          }
          this.showWelcomeModal();
        }, 300);
      }
    }, 80);
  }

  /* 2. Welcome Modal (Red Velvet Theater Curtain Modal) */
  showWelcomeModal() {
    const theaterModal = document.getElementById('theater-curtain-modal');
    const welcomeModal = document.getElementById('welcome-modal');

    if (theaterModal) {
      theaterModal.style.display = 'flex';
      theaterModal.classList.add('active');
      theaterModal.style.opacity = '1';
      theaterModal.style.pointerEvents = 'all';
    } else if (welcomeModal) {
      welcomeModal.style.display = 'flex';
      welcomeModal.classList.add('active');
      welcomeModal.style.opacity = '1';
      welcomeModal.style.pointerEvents = 'all';
    }

    document.getElementById('welcome-open-btn')?.addEventListener('click', () => {
      window.closeWelcomeModal();
      if (window.birthdayAudio) window.birthdayAudio.play();
    });

    document.getElementById('welcome-music-btn')?.addEventListener('click', () => {
      if (window.birthdayAudio) window.birthdayAudio.toggle();
    });

    document.getElementById('welcome-skip-btn')?.addEventListener('click', () => {
      window.closeWelcomeModal();
    });
  }

  /* 3. Hero Typed Effect */
  initTypedEffect() {
    const phrases = [
      "Celebrating the Most Wonderful Queen ✨",
      "May Your Day Be Filled with Sparkles & Joy 💖",
      "Wishing You Luxury, Happiness & Eternal Smiles 👑"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const target = document.getElementById('hero-typed-text');
    if (!target) return;

    const type = () => {
      const current = phrases[phraseIndex];
      if (isDeleting) {
        target.textContent = current.substring(0, charIndex - 1);
        charIndex--;
      } else {
        target.textContent = current.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? 40 : 80;

      if (!isDeleting && charIndex === current.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 500;
      }

      setTimeout(type, speed);
    };

    type();
  }

  /* 4. Live Countdown Timer (August 8th Target Date) */
  initCountdown() {
    // August 8th 00:00:00
    const targetDate = new Date(2026, 7, 8, 0, 0, 0).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      const days = Math.floor(Math.max(0, diff) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((Math.max(0, diff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((Math.max(0, diff) % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((Math.max(0, diff) % (1000 * 60)) / 1000);

      const dEl = document.getElementById('cnt-days');
      const hEl = document.getElementById('cnt-hours');
      const mEl = document.getElementById('cnt-mins');
      const sEl = document.getElementById('cnt-secs');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');

      const welcomeCntVal = document.getElementById('welcome-cnt-val');
      const welcomeOpenBtn = document.getElementById('welcome-open-btn');

      if (diff <= 0) {
        this.isCountdownComplete = true;
        const heading = document.getElementById('countdown-heading');
        if (heading) heading.textContent = "🎂 Happy Birthday Sidra! 🎂";
        if (welcomeCntVal) welcomeCntVal.textContent = "🎂 Celebration Unlocked! 🎉";
        if (welcomeOpenBtn) {
          welcomeOpenBtn.innerHTML = '<i class="fas fa-envelope-open-text"></i> Open Invitation';
          welcomeOpenBtn.classList.add('unlocked');
        }
      } else {
        this.isCountdownComplete = false;
        const timeStr = `${days}d ${hours}h ${mins}m ${String(secs).padStart(2, '0')}s`;
        if (welcomeCntVal) welcomeCntVal.textContent = timeStr;
        if (welcomeOpenBtn) {
          welcomeOpenBtn.innerHTML = `<i class="fas fa-envelope-open-text"></i> Open Invitation`;
          welcomeOpenBtn.classList.add('unlocked');
        }
      }
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /* Keyboard Navigation for Lightbox & Video Modal */
  initKeyboardNav() {
    window.addEventListener('keydown', (e) => {
      const lightboxModal = document.getElementById('lightbox-modal');
      const videoModal = document.getElementById('video-modal');

      if (lightboxModal && lightboxModal.classList.contains('active')) {
        if (e.key === 'ArrowRight') window.navigateLightbox(1);
        if (e.key === 'ArrowLeft') window.navigateLightbox(-1);
        if (e.key === 'Escape') window.closeLightbox();
      }

      if (videoModal && videoModal.classList.contains('active')) {
        if (e.key === 'Escape') window.closeVideoModal();
      }
    });

    const celebrationModal = document.getElementById('celebration-modal');
    celebrationModal?.addEventListener('click', (e) => {
      if (e.target === celebrationModal) AppController.closeModal();
    });

    const videoModal = document.getElementById('video-modal');
    videoModal?.addEventListener('click', (e) => {
      if (e.target === videoModal) window.closeVideoModal();
    });

    const lightboxModal = document.getElementById('lightbox-modal');
    lightboxModal?.addEventListener('click', (e) => {
      if (e.target === lightboxModal) window.closeLightbox();
    });
  }

  /* Tap To Top Button - Opacity changes after scrolling 2 sections */
  initScrollTop() {
    const btn = document.getElementById('scroll-top-btn');

    const check2SectionsOpacity = () => {
      // 2 sections crossed (~550px or 1.1x viewport height)
      const twoSectionsThreshold = Math.max(550, window.innerHeight * 1.1);
      if (window.scrollY >= twoSectionsThreshold) {
        btn?.classList.add('full-opacity');
      } else {
        btn?.classList.remove('full-opacity');
      }
    };

    window.addEventListener('scroll', check2SectionsOpacity);
    window.addEventListener('resize', check2SectionsOpacity);
    check2SectionsOpacity();

    btn?.addEventListener('click', () => {
      window.scrollToTop();
    });
  }
}

function startAppController() {
  window.appController = new AppController();

  const pwdModal = document.getElementById('password-modal');
  if (!pwdModal || pwdModal.style.display === 'none') {
    window.appController.startLoadingScreen();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAppController);
} else {
  startAppController();
}
