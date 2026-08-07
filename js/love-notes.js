/* ==========================================================================
   Sidra's Birthday Celebration - Love Notes Board Module
   ========================================================================== */

class LoveNotesWall {
  constructor() {
    this.notesGrid = document.getElementById('love-notes-grid');
    this.colors = ['#FFE5EC', '#E6E6FA', '#FFF9C4', '#D1C4E9', '#F8BBD0'];
    this.notes = [
      "Happy Birthday Sidra! May your day be filled with endless smiles and golden moments! 💖",
      "You shine brighter than all the stars in the night sky! Have the happiest birthday ever! ✨",
      "Wishing you a year ahead filled with love, laughter, luxury, and dream achievements! 👑",
      "To the sweetest person in the world — happy birthday! Cheers to wonderful memories! 🥂",
      "May all your birthday wishes come true today and always! Stay blessed & beautiful! 🌸"
    ];

    this.init();
    this.bindEvents();
  }

  init() {
    if (!this.notesGrid) return;
    this.notesGrid.innerHTML = '';
    this.notes.forEach(text => this.createNoteCard(text));
  }

  createNoteCard(text) {
    const note = document.createElement('div');
    note.className = 'sticky-note';
    const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    const randomDeg = (Math.random() - 0.5) * 12;

    note.style.backgroundColor = randomColor;
    note.style.setProperty('--rand-deg', randomDeg);
    note.innerHTML = `
      <div class="sticky-pin">📌</div>
      <p>${text}</p>
    `;

    note.addEventListener('click', () => {
      if (typeof confetti === 'function') confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    });

    this.notesGrid.appendChild(note);
  }

  bindEvents() {
    const addBtn = document.getElementById('add-note-btn');
    const inputEl = document.getElementById('new-note-input');

    if (addBtn && inputEl) {
      addBtn.addEventListener('click', () => {
        const text = inputEl.value.trim();
        if (text) {
          this.createNoteCard(text);
          inputEl.value = '';
          if (window.birthdayAudio) window.birthdayAudio.playPopSound();
        }
      });
    }
  }
}

function startLoveNotesWall() {
  window.loveNotesWall = new LoveNotesWall();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startLoveNotesWall);
} else {
  startLoveNotesWall();
}
