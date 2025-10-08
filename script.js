// Helpers
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const overlay = $('#overlay');
let openPanel = null;

// Mostrar panel
function showPanel(id, {updateHash=true} = {}){
  const p = document.getElementById(id);
  if(!p) return;
  $$('.panel').forEach(el => el.setAttribute('aria-hidden','true'));
  p.setAttribute('aria-hidden','false');
  overlay.hidden = false;
  openPanel = p;
  if(updateHash) history.pushState(null, '', `#${id}`);
}

// Ocultar panel
function hidePanel({clearHash=true} = {}){
  if(!openPanel) return;
  openPanel.setAttribute('aria-hidden','true');
  overlay.hidden = true;
  openPanel = null;
  if(clearHash) history.replaceState(null, '', location.pathname + location.search);
}
overlay.addEventListener('click', ()=>hidePanel());
document.addEventListener('keydown', e => { if(e.key === 'Escape') hidePanel(); });
$$('[data-close]').forEach(btn => btn.addEventListener('click', ()=>hidePanel()));

// Click en zonas
$$('.zone').forEach(z=>{
  z.addEventListener('click', ()=> showPanel(z.dataset.panel));
});

// Búsqueda
const input = $('#search');
input.addEventListener('input', ()=>{
  const q = input.value.trim().toLowerCase();
  $$('.piece').forEach(p => p.classList.remove('flash'));
  if(!q) return;
  const match = Array.from($$('.zone')).find(z => (z.dataset.name||'').toLowerCase().includes(q));
  if(match){
    const piece = match.querySelector('.piece');
    if(piece) piece.classList.add('flash');
  }
});
input.addEventListener('keydown', e=>{
  if(e.key==='Enter'){
    const q = input.value.trim().toLowerCase();
    const match = Array.from($$('.zone')).find(z => (z.dataset.name||'').toLowerCase().includes(q));
    if(match) showPanel(match.dataset.panel);
  }
});

// Abrir panel desde hash
function openFromHash(){
  const h = (location.hash || '').slice(1);
  if(!h) return;
  const panel = document.getElementById(h);
  if(panel && panel.classList.contains('panel')){
    showPanel(h, {updateHash:false});
  }
}
window.addEventListener('load', openFromHash);
window.addEventListener('hashchange', openFromHash);
