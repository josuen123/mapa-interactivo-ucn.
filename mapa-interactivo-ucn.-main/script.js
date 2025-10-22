// === INTERACCIÓN CON BUSCADOR ===
const header = document.querySelector('.header-content');
const searchInput = document.getElementById('search');

header.addEventListener('click', () => {
  header.classList.add('search-expanded');
  searchInput.focus();
});

// === PINES SVG ===
const pins = document.querySelectorAll('.pin-wrapper');
const panel = document.getElementById('info-panel');
const panelTitle = document.getElementById('panel-title');
const panelDesc = document.getElementById('panel-desc');
const panelImg = document.getElementById('panel-img');
const closeBtn = document.getElementById('close-panel');

pins.forEach(pin => {
  pin.addEventListener('click', () => {
    const title = pin.dataset.title;
    const desc = pin.dataset.desc;

    panelTitle.textContent = title;
    panelDesc.textContent = desc;
    panelImg.src = "img/" + title.replace(/\s+/g, "_").toLowerCase() + ".jpg"; // opcional
    panel.classList.add('open');
  });
});

closeBtn.addEventListener('click', () => {
  panel.classList.remove('open');
});