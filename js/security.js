/**
 * Sidra's Birthday Celebration - Security & Anti-Inspection Module
 * Handles Password Modal Verification (PIN: 0808), Anti-Copying, Anti-Download, 
 * Anti-Inspection, and Screenshot Protection.
 */

(function () {
  'use strict';

  class SecurityManager {
    constructor() {
      this.pinDigits = [];
      this.initPasswordModal();
      // Security protections disabled per user request
      // this.initAntiDownload();
      // this.initAntiInspect();
      // this.initScreenshotProtection();
      // this.initAntiCopy();
    }

    /* ==========================================
       1. Secret Password Modal Handler (PIN: 0808)
       ========================================== */
    initPasswordModal() {
      window.addEventListener('keydown', (e) => {
        const modal = document.getElementById('password-modal');
        if (!modal || modal.style.display === 'none' || modal.style.opacity === '0') return;

        if (e.key >= '0' && e.key <= '9') {
          this.pressKeypad(e.key);
        } else if (e.key === 'Backspace') {
          this.pressKeypad('clear');
        } else if (e.key === 'Enter') {
          this.verifyPin();
        }
      });
    }

    pressKeypad(key) {
      if (key === 'clear') {
        this.pinDigits = [];
      } else {
        if (this.pinDigits.length < 4) {
          this.pinDigits.push(key);
        }
      }
      this.updateOtpUI();
      if (window.birthdayAudio && typeof window.birthdayAudio.playPopSound === 'function') {
        window.birthdayAudio.playPopSound();
      }
    }

    updateOtpUI() {
      for (let i = 1; i <= 4; i++) {
        const box = document.getElementById(`otp-${i}`);
        if (box) {
          if (this.pinDigits[i - 1]) {
            box.value = this.pinDigits[i - 1];
            box.classList.add('filled');
          } else {
            box.value = '';
            box.classList.remove('filled');
          }
        }
      }
    }

    verifyPin() {
      const modal = document.getElementById('password-modal');
      const errorEl = document.getElementById('pin-error-msg');
      const pin = this.pinDigits.join('');

      if (pin === '0808') {
        if (errorEl) errorEl.textContent = '';
        if (window.birthdayAudio && typeof window.birthdayAudio.playPopSound === 'function') {
          window.birthdayAudio.playPopSound();
        }
        if (typeof confetti === 'function') {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        }

        if (modal) {
          modal.style.opacity = '0';
          modal.style.pointerEvents = 'none';
          setTimeout(() => {
            modal.style.display = 'none';
            // Show loader-screen & start 1st page progress bar loader!
            const loader = document.getElementById('loader-screen');
            if (loader) {
              loader.style.display = 'flex';
              loader.style.opacity = '1';
              loader.style.pointerEvents = 'all';
            }
            if (window.appController && typeof window.appController.startLoadingScreen === 'function') {
              window.appController.startLoadingScreen();
            }
          }, 500);
        }
      } else {
        if (errorEl) errorEl.textContent = '❌ Incorrect PIN Code! (Password: 0808)';
        this.pinDigits = [];
        this.updateOtpUI();

        for (let i = 1; i <= 4; i++) {
          const box = document.getElementById(`otp-${i}`);
          if (box) {
            box.classList.add('shake');
            setTimeout(() => box.classList.remove('shake'), 500);
          }
        }

        const content = modal?.querySelector('.password-modal-content');
        if (content) {
          content.classList.add('shake');
          setTimeout(() => content.classList.remove('shake'), 500);
        }
      }
    }

    /* ==========================================
       2. Anti-Image Download & Right-Click Block
       ========================================== */
    initAntiDownload() {
      // Block right click on whole document
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showSecurityAlert('🔒 Right-clicking & inspecting code is disabled!');
        return false;
      });

      // Block dragging of images
      document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
          e.preventDefault();
          return false;
        }
      });
    }

    /* ==========================================
       3. Anti-Inspect & Keyboard Shortcut Block
       ========================================== */
    initAntiInspect() {
      document.addEventListener('keydown', (e) => {
        // F12 key
        if (e.keyCode === 123 || e.key === 'F12') {
          e.preventDefault();
          this.showSecurityAlert('🔒 Developer Tools (F12) are disabled!');
          return false;
        }

        // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Elements)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
          e.preventDefault();
          this.showSecurityAlert('🔒 Inspect Element is disabled!');
          return false;
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
          e.preventDefault();
          this.showSecurityAlert('🔒 View Page Source is disabled!');
          return false;
        }

        // Ctrl+S (Save Page) & Ctrl+P (Print)
        if (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
          e.preventDefault();
          this.showSecurityAlert('🔒 Saving & Printing page is disabled!');
          return false;
        }
      });
    }

    /* ==========================================
       4. Screenshot & Snipping Tool Protection (Win + PrtScn Blackout)
       ========================================== */
    initScreenshotProtection() {
      const triggerInstantBlackout = (reason) => {
        // Synchronous immediate DOM hiding
        document.body.style.visibility = 'hidden';
        document.body.classList.add('secure-blackout');
        
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          try { navigator.clipboard.writeText(''); } catch (err) {}
        }
        
        this.flashSecurityOverlay(reason || '📸 Screenshot attempt detected & blocked!');
        
        setTimeout(() => {
          document.body.style.visibility = 'visible';
          document.body.classList.remove('secure-blackout');
        }, 2000);
      };

      // Synchronous Keydown Hiding for Win, Meta, PrintScreen, Alt+PrtScn
      const handleScreenshotKeys = (e) => {
        const isPrtScn = e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44;
        const isWinKey = e.key === 'Meta' || e.key === 'OS' || e.key === 'Win' || e.code === 'MetaLeft' || e.code === 'MetaRight' || e.keyCode === 91 || e.keyCode === 92;
        const isSnippingCombo = (e.metaKey || e.ctrlKey || isWinKey) && e.shiftKey && (e.key === 'S' || e.key === 's');

        if (isPrtScn || isWinKey || isSnippingCombo) {
          triggerInstantBlackout('📸 Screenshot attempt blocked!');
          e.preventDefault();
          return false;
        }
      };

      window.addEventListener('keydown', handleScreenshotKeys, true);
      document.addEventListener('keydown', handleScreenshotKeys, true);

      window.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen' || e.code === 'PrintScreen' || e.keyCode === 44) {
          triggerInstantBlackout('📸 Screenshot attempt blocked!');
        }
      }, true);

      // Instant Blackout on Visibility Change or Window Blur (Snipping Tool & Window Focus Loss)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          document.body.style.visibility = 'hidden';
          document.body.classList.add('secure-blackout');
        } else {
          document.body.style.visibility = 'visible';
          document.body.classList.remove('secure-blackout');
        }
      });

      window.addEventListener('blur', () => {
        document.body.classList.add('secure-blur');
      });
      window.addEventListener('focus', () => {
        document.body.classList.remove('secure-blur');
        document.body.style.visibility = 'visible';
        document.body.classList.remove('secure-blackout');
      });
    }

    /* ==========================================
       5. Anti-Copy & Text Selection Block
       ========================================== */
    initAntiCopy() {
      document.addEventListener('copy', (e) => {
        e.preventDefault();
        this.showSecurityAlert('🔒 Copying text/code is disabled!');
        return false;
      });
      document.addEventListener('cut', (e) => {
        e.preventDefault();
        return false;
      });
      document.addEventListener('selectstart', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          return false;
        }
      });
    }

    showSecurityAlert(msg) {
      if (window.AppController && typeof window.AppController.showModal === 'function') {
        window.AppController.showModal('🛡️ Security Protection', msg, '🔒');
      } else {
        const errorEl = document.getElementById('pin-error-msg');
        if (errorEl) errorEl.textContent = msg;
      }
    }

    flashSecurityOverlay(msg) {
      let overlay = document.getElementById('security-flash-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'security-flash-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:#000;z-index:99999999;display:flex;align-items:center;justify-content:center;color:#FF4D8D;font-size:1.8rem;font-weight:bold;text-align:center;padding:2rem;transition:opacity 0.3s ease;';
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = `<div><div style="font-size:3rem;margin-bottom:1rem;">🛡️</div>${msg}</div>`;
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';

      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.style.display = 'none'; }, 300);
      }, 1500);
    }
  }

  // Initialize Security Manager
  document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
  });

  // Expose global methods for inline HTML onclick handlers
  window.SecurityManager = SecurityManager;
  window.pressSecurityKeypad = function(key) {
    if (window.securityManager) window.securityManager.pressKeypad(key);
  };
  window.verifySecurityPin = function() {
    if (window.securityManager) window.securityManager.verifyPin();
  };
})();
