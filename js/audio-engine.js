/* ==========================================================================
   Sidra's Birthday Celebration - Web Audio API Engine & Music Controller
   ========================================================================== */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.5;
    this.currentTrackIndex = 0;
    this.synthInterval = null;
    this.audioElement = null;
    
    this.tracks = [
      { title: "Sidra's Birthday Song 🎵", artist: "Royal Celebration Orchestra", src: "assets/audio/birthday_song.mp3", duration: "03:45" },
      { title: "Sparkling Birthday Magic 🌟", artist: "Fairy Lights Ensemble", src: "assets/audio/song2.mp3", duration: "02:50" },
      { title: "Celestial Moonlight Wishes ✨", artist: "Dreamscape Serenade", src: "assets/audio/song3.mp3", duration: "04:12" }
    ];
  }

  init() {
    if (!this.audioElement) {
      this.audioElement = document.getElementById('bg-audio-player') || new Audio();
      this.audioElement.volume = this.volume;
      this.audioElement.addEventListener('ended', () => this.nextTrack());
    }

    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  play() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    const track = this.tracks[this.currentTrackIndex];
    if (this.audioElement && track && track.src) {
      if (!this.audioElement.src || (!this.audioElement.src.endsWith(track.src) && !this.audioElement.src.includes(track.src))) {
        this.audioElement.src = track.src;
      }
      this.audioElement.play().catch(err => {
        console.log("MP3 autoplay blocked or missing, using Web Audio synth fallback:", err);
        this.startSynthMelody();
      });
    } else {
      this.startSynthMelody();
    }

    this.updateTrackInfo();
    this.updateUI();
  }

  pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.updateUI();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.isPlaying && this.audioElement) {
      this.audioElement.src = this.tracks[this.currentTrackIndex].src;
      this.audioElement.play().catch(e => console.log(e));
    }
    this.updateTrackInfo();
  }

  prevTrack() {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    if (this.isPlaying && this.audioElement) {
      this.audioElement.src = this.tracks[this.currentTrackIndex].src;
      this.audioElement.play().catch(e => console.log(e));
    }
    this.updateTrackInfo();
  }

  updateTrackInfo() {
    const track = this.tracks[this.currentTrackIndex];
    const titleEl = document.getElementById('player-track-title');
    const artistEl = document.getElementById('player-track-artist');
    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
  }

  updateUI() {
    const playBtnIcon = document.getElementById('player-play-btn-icon');
    const albumArt = document.getElementById('player-album-art');
    const mobileToggleBtn = document.querySelector('.mobile-music-toggle-btn');
    const mobileIcon = document.getElementById('mobile-music-icon');

    if (playBtnIcon) {
      playBtnIcon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
    if (albumArt) {
      if (this.isPlaying) {
        albumArt.classList.add('playing');
      } else {
        albumArt.classList.remove('playing');
      }
    }
    if (mobileToggleBtn) {
      if (this.isPlaying) {
        mobileToggleBtn.classList.add('playing');
        if (mobileIcon) mobileIcon.className = 'fas fa-compact-disc fa-spin';
      } else {
        mobileToggleBtn.classList.remove('playing');
        if (mobileIcon) mobileIcon.className = 'fas fa-music';
      }
    }
  }

  startSynthMelody() {
    const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
    let step = 0;

    if (this.synthInterval) clearInterval(this.synthInterval);

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying || !this.audioCtx) return;

      const note = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
      this.playChime(note, 1.2);

      if (step % 8 === 0) {
        this.playChime(note / 2, 2.5, 'triangle', 0.2);
      }
      step++;
    }, 600);
  }

  playChime(freq, duration = 1.0, type = 'sine', volMult = 0.15) {
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      const now = this.audioCtx.currentTime;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(this.volume * volMult, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Audio synth issue", e);
    }
  }

  playBlowoutSound() {
    this.init();
    this.playChime(150, 1.5, 'triangle', 0.3);
    this.playChime(120, 1.2, 'sine', 0.2);
  }

  playPopSound() {
    this.init();
    this.playChime(880, 0.3, 'sine', 0.4);
    setTimeout(() => this.playChime(1174.66, 0.4, 'sine', 0.3), 80);
  }
}

window.birthdayAudio = new AudioEngine();
