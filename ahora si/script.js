// --- VARIABLES GLOBALES ---
// Guardamos referencias a los elementos del HTML
let allEdificiosData = []; 
const header = document.querySelector('.header-content');
const searchInput = document.getElementById('search');
const searchResultsContainer = document.getElementById('search-results');
const pins = document.querySelectorAll('.pin-wrapper');
const panel = document.getElementById('info-panel');
const panelContent = document.getElementById('panel-content');
const closeBtn = document.getElementById('close-panel');

// ¡Esta es la referencia CLAVE para apagar el mapa!
const mapContainer = document.getElementById('map-container');


// --- EVENTO PRINCIPAL: Se ejecuta cuando la página carga ---
document.addEventListener('DOMContentLoaded', async () => {
  
  // 1. Lógica del Header (expandir al hacer clic)
  header.addEventListener('click', (e) => {
    if (e.target.id !== 'search') { 
      header.classList.add('search-expanded');
      searchInput.focus();
    }
  });

  // 2. Lógica para cerrar el panel de info
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    // ¡Vuelve a "encender" el mapa!
    mapContainer.classList.remove('panel-is-open'); 
  });

  // 3. Cargar los datos de la base de datos (solo una vez)
  await cargarDatosGlobales();

  // 4. Asignar clics a los PINES del mapa
  pins.forEach(pin => {
    pin.addEventListener('click', () => {
      const nombreEdificio = pin.dataset.edificioNombre || pin.dataset.title;
      if (nombreEdificio) {
        mostrarInfoDesdeDatos(nombreEdificio);
      }
    });
  });

  // 5. Asignar el evento de "escribir" a la barra de BÚSQUEDA
  searchInput.addEventListener('input', handleSearch);

  // 6. Ocultar resultados si se hace clic fuera del buscador
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && !searchResultsContainer.contains(e.target)) {
      searchResultsContainer.style.display = 'none';
      header.classList.remove('search-expanded');
    }
  });

}); // <-- FIN DEL 'DOMContentLoaded'


// --- FUNCIONES ---

/**
 * 4. Muestra la información del edificio en el panel lateral
 * (Esta es la función más importante)
 */
function mostrarInfoDesdeDatos(nombreBuscado) {
  // 1. Muestra el panel
  panel.classList.add('open');
  
  // 2. ¡¡LA SOLUCIÓN!! "Apaga" el mapa
  mapContainer.classList.add('panel-is-open'); 
  
  // 3. Resetea el scroll del panel a 0
  panelContent.scrollTop = 0;
  
  // 4. Muestra "Cargando..."
  panelContent.innerHTML = '<p>Cargando información...</p>';

  // 5. Busca el edificio en los datos que ya cargamos
  const edificio = allEdificiosData.find(e => e.nombre.toLowerCase() === nombreBuscado.toLowerCase());

  // 6. Construye el HTML y lo inserta en el panel
  if (edificio) {
    let html = `
      <img id="panel-img" src="${edificio.fotoUrl || 'img/mapa-base.jpg'}" alt="Foto de ${edificio.nombre}" />
      <h2 id="panel-title">${edificio.nombre.toUpperCase()}</h2>
      <p id="panel-desc">${edificio.descripcion || 'Información del edificio:'}</p>
      <hr style="margin: 1rem 0;" />
    `;

    if (edificio.pisos && edificio.pisos.length > 0) {
      const pisosHtml = edificio.pisos.map(piso => {
        const salasHtml = (piso.salas && piso.salas.length > 0)
          ? piso.salas.map(sala => `<li>${sala.nombre}</li>`).join('')
          : '<li>No hay salas registradas</li>';
        
        return `
          <li style="margin-bottom: 10px;">
            <strong>Piso ${piso.numero}:</strong>
            <ul style="margin-left: 20px; list-style-type: disc;">
              ${salasHtml}
            </ul>
          </li>
        `;
      }).join('');
      html += `<ul style="margin: 0; padding-left: 20px;">${pisosHtml}</ul>`;
    } else {
      html += '<p>No hay pisos registrados para este edificio.</p>';
    }

    panelContent.innerHTML = html;

  } else {
    // Si no encuentra el edificio
    panelContent.innerHTML = `<h2 id="panel-title">${nombreBuscado.toUpperCase()}</h2><p>No se encontró información para este edificio.</p>`;
  }
}


/**
 * 1. Carga todos los datos de la API y los guarda en 'allEdificiosData'
 */
async function cargarDatosGlobales() {
  try {
    // Asegúrate que esta ruta '/api/edificios' sea correcta
    const response = await fetch('/api/edificios'); 
    if (!response.ok) {
      throw new Error(`Error de API: ${response.statusText}`);
    }
    allEdificiosData = await response.json();
    console.log('Datos de edificios cargados exitosamente.');
  } catch (error) {
    console.error('Error fatal al cargar datos globales:', error);
    // Podrías poner un mensaje de error en el buscador
    searchResultsContainer.innerHTML = '<div class="search-result-item no-matches">Error al cargar datos.</div>';
  }
}

/**
 * 2. Lógica de Búsqueda (se llama cada vez que escribes)
 */
function handleSearch() {
  const query = searchInput.value.toLowerCase().trim();

  // Si no hay nada escrito, oculta los resultados
  if (query.length === 0) {
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.style.display = 'none';
    return;
  }

  const results = [];

  // Si los datos aún no cargan, avisa
  if (allEdificiosData.length === 0) {
    searchResultsContainer.innerHTML = '<div class="search-result-item no-matches">Cargando datos...</div>';
    searchResultsContainer.style.display = 'block';
    return;
  }

  // Busca en los edificios y sus salas
  for (const edificio of allEdificiosData) {
    // 1. Busca por nombre de Edificio
    if (edificio.nombre.toLowerCase().includes(query)) {
      results.push({
        tipo: 'edificio',
        nombre: edificio.nombre,
        html: `<strong>${edificio.nombre}</strong> (Pabellón)`
      });
    }

    // 2. Busca por nombre de Sala
    if (edificio.pisos) {
      for (const piso of edificio.pisos) {
        if (piso.salas) { 
          for (const sala of piso.salas) {
            if (sala.nombre.toLowerCase().includes(query)) {
              results.push({
                tipo: 'sala',
                nombre: sala.nombre,
                edificioNombre: edificio.nombre,
                html: `<strong>${sala.nombre}</strong> (Piso ${piso.numero}, Ed. ${edificio.nombre})`
              });
            }
          }
        }
      }
    }
  }

  // 3. Muestra los resultados en el HTML
  mostrarResultadosBusqueda(results);
}

/**
 * 3. Muestra los resultados de la búsqueda en el div
 */
function mostrarResultadosBusqueda(results) {
  // Si no hay resultados, avisa
  if (results.length === 0) {
    searchResultsContainer.innerHTML = '<div class="search-result-item no-matches">No se encontraron coincidencias.</div>';
    searchResultsContainer.style.display = 'block';
    return;
  }

  // Construye el HTML para cada resultado
  searchResultsContainer.innerHTML = results.map(res => {
    const edificioTarget = res.tipo === 'edificio' ? res.nombre : res.edificioNombre;
    return `
      <div class="search-result-item" data-edificio-nombre="${edificioTarget}">
        ${res.html}
      </div>
    `;
  }).join('');

  searchResultsContainer.style.display = 'block'; 

  // Asigna clics a los NUEVOS resultados
  searchResultsContainer.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const nombreEdificio = item.dataset.edificioNombre;
      if (nombreEdificio) {
        // Reutiliza la misma función que los pines
        mostrarInfoDesdeDatos(nombreEdificio);
        
        // Limpia y oculta la búsqueda
        searchResultsContainer.innerHTML = '';
        searchResultsContainer.style.display = 'none';
        searchInput.value = '';
        searchInput.blur();
        header.classList.remove('search-expanded');
      }
    });
  });
}