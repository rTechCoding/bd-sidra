/* ==========================================================================
   Sidra's Birthday Celebration - Photo Booth Module
   ========================================================================== */

class PhotoBooth {
  constructor() {
    this.canvas = document.getElementById('booth-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.video = document.createElement('video');
    this.stream = null;
    this.currentFilter = 'none';
    this.fallbackImg = new Image();
    this.fallbackImg.src = 'assets/sidra_portrait.png';
    this.isCameraActive = false;
    this.customText = "Happy Birthday Sidra! ✨";

    this.initCanvas();
    this.bindControls();
    this.startCamera();
  }

  initCanvas() {
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.fallbackImg.onload = () => {
      this.drawCanvasContent();
    };
  }

  async  startCamera() {
    // Camera access disabled per user request
    this.isCameraActive = false;
    this.drawCanvasContent();
  }

  renderLoop() {
    if (this.isCameraActive && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.drawCanvasContent();
    }
    requestAnimationFrame(() => this.renderLoop());
  }

  drawCanvasContent() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.filter = this.getFilterCSS();

    if (this.isCameraActive && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.drawImage(this.fallbackImg, 0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.filter = 'none';
    this.drawFrameDecorations();
  }

  getFilterCSS() {
    switch(this.currentFilter) {
      case 'vintage': return 'sepia(0.6) contrast(1.1) brightness(0.9)';
      case 'glam': return 'saturate(1.5) hue-rotate(-20deg) brightness(1.1)';
      case 'cyber': return 'hue-rotate(180deg) saturate(2)';
      case 'warm': return 'sepia(0.3) saturate(1.4) brightness(1.05)';
      default: return 'none';
    }
  }

  drawFrameDecorations() {
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Glowing border frame
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 12;
    this.ctx.strokeRect(6, 6, w - 12, h - 12);

    this.ctx.strokeStyle = '#FF4D8D';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(16, 16, w - 32, h - 32);

    // Crown Sticker at Top
    this.ctx.font = '50px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('👑', w / 2, 60);

    // Custom Text Banner at Bottom
    this.ctx.fillStyle = 'rgba(13, 6, 20, 0.75)';
    this.ctx.fillRect(20, h - 70, w - 40, 50);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 22px Great Vibes, cursive';
    this.ctx.fillText(this.customText, w / 2, h - 36);
  }

  bindControls() {
    const filterSelect = document.getElementById('booth-filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.drawCanvasContent();
      });
    }

    const snapBtn = document.getElementById('booth-snap-btn');
    if (snapBtn) {
      snapBtn.addEventListener('click', () => this.snapPhoto());
    }
  }

  snapPhoto() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.inset = '0';
    flash.style.background = '#FFFFFF';
    flash.style.zIndex = '999999';
    flash.style.transition = 'opacity 0.4s ease';
    document.body.appendChild(flash);

    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 400);
    }, 100);

    if (window.birthdayAudio) window.birthdayAudio.playPopSound();

    const dataURL = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Sidra_Birthday_Selfie_${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }
}

function startPhotoBooth() {
  window.photoBooth = new PhotoBooth();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPhotoBooth);
} else {
  startPhotoBooth();
}
