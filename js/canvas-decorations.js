/* ==========================================================================
   Sidra's Birthday Celebration - Canvas Decorations & Particle Engine
   ========================================================================== */

class BackgroundDecorations {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.particles = [];
    this.balloons = [];
    this.mouse = { x: -100, y: -100 };
    
    this.resize();
    this.initParticles();
    this.initBalloons();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      const glowEl = document.getElementById('cursor-glow');
      if (glowEl) {
        glowEl.style.left = `${e.clientX}px`;
        glowEl.style.top = `${e.clientY}px`;
      }
    });
  }

  initParticles() {
    this.particles = [];
    const count = Math.floor((this.width * this.height) / 12000);
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: ['#FF4D8D', '#FFD700', '#8A2BE2', '#FFFFFF', '#E6E6FA'][Math.floor(Math.random() * 5)],
        alpha: Math.random(),
        type: Math.random() > 0.4 ? 'sparkle' : 'heart'
      });
    }
  }

  initBalloons() {
    this.balloons = [];
    for (let i = 0; i < 8; i++) {
      this.balloons.push({
        x: Math.random() * this.width,
        y: this.height + Math.random() * 300,
        radius: Math.random() * 15 + 18,
        speed: Math.random() * 1 + 0.8,
        color: ['#FF4D8D', '#8A2BE2', '#FFD700', '#FF85A1'][Math.floor(Math.random() * 4)],
        swing: Math.random() * 2
      });
    }
  }

  drawHeart(x, y, size, color, alpha) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    const topCurveHeight = size * 0.3;
    this.ctx.moveTo(x, y + topCurveHeight);
    this.ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size);
    this.ctx.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    this.ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  drawBalloon(b) {
    this.ctx.save();
    this.ctx.fillStyle = b.color;
    this.ctx.beginPath();
    this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = b.color;
    this.ctx.beginPath();
    this.ctx.moveTo(b.x - 3, b.y + b.radius);
    this.ctx.lineTo(b.x + 3, b.y + b.radius);
    this.ctx.lineTo(b.x, b.y + b.radius + 6);
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(b.x, b.y + b.radius + 6);
    this.ctx.quadraticCurveTo(b.x + Math.sin(b.swing) * 10, b.y + b.radius + 25, b.x, b.y + b.radius + 45);
    this.ctx.stroke();

    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.alpha += (Math.random() - 0.5) * 0.02;
      p.alpha = Math.max(0.1, Math.min(0.9, p.alpha));

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      if (p.type === 'heart') {
        this.drawHeart(p.x, p.y, p.size * 3, p.color, p.alpha);
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    this.balloons.forEach((b) => {
      b.y -= b.speed;
      b.swing += 0.02;
      b.x += Math.sin(b.swing) * 0.5;

      if (b.y < -100) {
        b.y = this.height + 100;
        b.x = Math.random() * this.width;
      }
      this.drawBalloon(b);
    });

    requestAnimationFrame(() => this.animate());
  }
}

function startBgDecorations() {
  window.bgDecorations = new BackgroundDecorations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startBgDecorations);
} else {
  startBgDecorations();
}
