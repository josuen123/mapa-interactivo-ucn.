document.addEventListener("DOMContentLoaded", () => {
const edificios = [
{ id: "g1", nombre: "Pabellón G1", top: "47%", left: "47%", descripcion: "Edificio de docencia con salas para ciencias básicas.", imagen: "img/G1/fachada.jpg", salas: [] },
{ id: "g4", nombre: "Pabellón G4", top: "34%", left: "56%", descripcion: "Laboratorios y aulas de ingeniería.", imagen: "img/G4/G4-1.jpg", salas: [] },
{ id: "g6", nombre: "Pabellón G6", top: "55%", left: "95%", descripcion: "Edificio con laboratorios de informática.", imagen: "img/G6/g6.jpg", salas: [] },
{ id: "casino", nombre: "Casino UCN", top: "14%", left: "49%", descripcion: "Espacio de alimentación principal.", imagen: "img/Casino/casino.jpg", salas: [] },
{ id: "microondas-g4", nombre: "Microondas G4", top: "44%", left: "52%", descripcion: "Zona de microondas y descanso.", imagen: "img/Microondas/microondas.jpg", salas: [] },
{ 
id: "d2", 
nombre: "Pabellón D2", 
top: "53%", 
left: "68%", 
descripcion: "<b>Piso 1:</b><br>Salas 102 y 103 (Laboratorio Computacional)<br><br><b>Piso 2:</b><br>Salas 202 y 203<br><br><b>Piso 3:</b><br>Salas 302, 303 y 304", 
imagen: "img/D2/D2-1.jpg",
salas: ["102", "103", "202", "203", "302", "303", "304"]
},
{ id: "g5", nombre: "Pabellón G5", top: "36%", left: "81%", descripcion: "Edificio de docencia con salas para ciencias empresariales.", imagen: "img/G5/G5-1.jpg", salas: [] },
{ id: "cafeteria", nombre: "Cafeteria", top: "48%", left: "50%", descripcion: "Cafetería con diversas opciones.", imagen: "img/Cafeteria/cafeteria.jpg", salas: [] },
];
const mapContent = document.querySelector(".map-content"); 
const panel = document.getElementById("info-panel");
const closeBtn = document.getElementById("close-panel");
const titleEl = document.getElementById("panel-title");
const imgEl = document.getElementById("panel-img");
const descEl = document.getElementById("panel-desc");
const search = document.getElementById("search");
const handle = document.querySelector(".handle-container");
const headerContent = document.querySelector(".header-content");
let activePinWrapper = null;
const pinElements = new Map();
edificios.forEach((e) => {
const wrapper = document.createElement("div");
wrapper.className = "pin-wrapper";
wrapper.style.top = e.top;
wrapper.style.left = e.left;
const label = document.createElement("div");
label.className = "pin-label";
label.textContent = e.nombre;
const pin = document.createElement("div");
pin.className = "pin";
wrapper.append(label, pin); 
wrapper.addEventListener("click", (event) => {
event.stopPropagation();
mostrarInfo(e, wrapper);
});
mapContent.appendChild(wrapper); 
pinElements.set(e.id, { wrapper, pin });
});
function mostrarInfo(edificio, wrapperElement) {
if (activePinWrapper) activePinWrapper.classList.remove("active");
wrapperElement.classList.add("active");
activePinWrapper = wrapperElement;
titleEl.textContent = edificio.nombre;
imgEl.src = edificio.imagen;
imgEl.alt = `Foto de ${edificio.nombre}`;
descEl.innerHTML = edificio.descripcion; 
panel.classList.add("open");
}
function cerrarPanel() {
panel.classList.remove("open");
if (activePinWrapper) {
activePinWrapper.classList.remove("active");
activePinWrapper = null;
}
}
closeBtn.addEventListener("click", cerrarPanel);
mapContent.addEventListener("click", cerrarPanel);
if(handle) handle.addEventListener("click", cerrarPanel);
panel.addEventListener("click", (e) => e.stopPropagation());
search.addEventListener("input", () => {
const term = search.value.toLowerCase().trim();
edificios.forEach(edificio => {
const { wrapper } = pinElements.get(edificio.id);
const nombreMatch = edificio.nombre.toLowerCase().includes(term);
const salaMatch = edificio.salas.includes(term);
const isMatch = term === '' || nombreMatch || salaMatch;
wrapper.classList.remove('search-match', 'filtered');
if (term !== '') {
if (isMatch) wrapper.classList.add('search-match');
else wrapper.classList.add('filtered');
}
});
});
// --- LÓGICA DEL BUSCADOR EXPANDIBLE ---
headerContent.addEventListener('click', (event) => {
event.stopPropagation(); // Evita que el clic se propague al documento
if (!headerContent.classList.contains('search-expanded')) {
headerContent.classList.add('search-expanded');
search.focus(); // Pone el cursor en el buscador automáticamente
}
});
document.addEventListener('click', (event) => {
if (headerContent.classList.contains('search-expanded')) {
headerContent.classList.remove('search-expanded');
}
});
});