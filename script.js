// --- VARIABLES GLOBALES ---
let allEdificiosData = []; // Variable para guardar TODOS los datos de la API

// --- REFERENCIAS AL DOM (Elementos de la página) ---
const header = document.querySelector('.header-content');
const searchInput = document.getElementById('search');
const searchResultsContainer = document.getElementById('search-results');

const pins = document.querySelectorAll('.pin-wrapper');
const panel = document.getElementById('info-panel');
const panelContent = document.getElementById('panel-content');
const closeBtn = document.getElementById('close-panel');

// --- EVENTO PRINCIPAL: Se ejecuta cuando la página carga ---
document.addEventListener('DOMContentLoaded', async () => {
  
  // 1. Lógica del Header (expandir al hacer clic)
  header.addEventListener('click', (e) => {
    if (e.target.id !== 'search') { // No expandir si el clic fue EN el input
      header.classList.add('search-expanded');
      searchInput.focus();
    }
  });

  // 2. Lógica para cerrar el panel de info
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
  });

  // 3. Cargar los datos de la base de datos UNA SOLA VEZ
  await cargarDatosGlobales();

  // 4. Asignar clics a los PINES del mapa
  pins.forEach(pin => {
    pin.addEventListener('click', () => {
      const nombreEdificio = pin.dataset.edificioNombre;
      if (nombreEdificio) {
        // Llama a la función que muestra la info desde los datos globales
        mostrarInfoDesdeDatos(nombreEdificio);
      }
    });
  });

  // 5. Asignar el evento de "escribir" a la barra de BÚSQUEDA
  searchInput.addEventListener('input', handleSearch);

  // Anti-error: Ocultar resultados si se hace clic fuera del buscador
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target) && !searchResultsContainer.contains(e.target)) {
      searchResultsContainer.style.display = 'none';
      header.classList.remove('search-expanded');
    }
  });
});

// --- FUNCIONES ---

/**
 * 1. Carga todos los datos de la API y los guarda en 'allEdificiosData'
 */
async function cargarDatosGlobales() {
  try {
    const response = await fetch('/api/edificios');
    if (!response.ok) {
      throw new Error(`Error de API: ${response.statusText}`);
    }
    allEdificiosData = await response.json();
    console.log('Datos de edificios cargados exitosamente.');
  } catch (error) {
    console.error('Error fatal al cargar datos globales:', error);
    // Podrías mostrar un error al usuario aquí
  }
}

/**
 * 2. Lógica de Búsqueda (se llama cada vez que escribes)
 */
function handleSearch() {
  const query = searchInput.value.toLowerCase().trim();

  // Anti-error: Si no hay nada escrito, oculta los resultados
  if (query.length === 0) {
    searchResultsContainer.innerHTML = '';
    searchResultsContainer.style.display = 'none';
    return;
  }

  const results = [];

  // Anti-error: Si los datos aún no cargan, avisa
  if (allEdificiosData.length === 0) {
    searchResultsContainer.innerHTML = '<div class="search-result-item no-matches">Cargando datos...</div>';
    searchResultsContainer.style.display = 'block';
    return;
  }

  // --- El motor de búsqueda ---
  for (const edificio of allEdificiosData) {
    // 1. Buscar por nombre de Edificio
    if (edificio.nombre.toLowerCase().includes(query)) {
      results.push({
        tipo: 'edificio',
        nombre: edificio.nombre,
        html: `<strong>${edificio.nombre}</strong> (Pabellón)`
      });
    }

    // 2. Buscar por nombre de Sala
    for (const piso of edificio.pisos) {
      for (const sala of piso.salas) {
        if (sala.nombre.toLowerCase().includes(query)) {
          results.push({
            tipo: 'sala',
            nombre: sala.nombre,
            edificioNombre: edificio.nombre, // Clave: sabemos a qué edificio pertenece
            html: `<strong>${sala.nombre}</strong> (Piso ${piso.numero}, Ed. ${edificio.nombre})`
          });
        }
      }
    }
  }

  // 3. Mostrar los resultados en el HTML
  mostrarResultadosBusqueda(results);
}

/**
 * 3. Muestra los resultados de la búsqueda en el div
 */
function mostrarResultadosBusqueda(results) {
  // Anti-error: Si no hay resultados, avisa
  if (results.length === 0) {
    searchResultsContainer.innerHTML = '<div class="search-result-item no-matches">No se encontraron coincidencias.</div>';
    searchResultsContainer.style.display = 'block';
    return;
  }

  // Construir el HTML para cada resultado
  searchResultsContainer.innerHTML = results.map(res => {
    // Usamos 'data-edificio-nombre' para saber qué panel abrir
    const edificioTarget = res.tipo === 'edificio' ? res.nombre : res.edificioNombre;
    return `
      <div class="search-result-item" data-edificio-nombre="${edificioTarget}">
        ${res.html}
      </div>
    `;
  }).join('');

  searchResultsContainer.style.display = 'block'; // Mostrar el contenedor

  // 4. Asignar clics a los NUEVOS resultados
  searchResultsContainer.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const nombreEdificio = item.dataset.edificioNombre;
      if (nombreEdificio) {
        // Reutilizamos la misma función que usan los pines
        mostrarInfoDesdeDatos(nombreEdificio);
        
        // Limpiar y ocultar la búsqueda
        searchResultsContainer.innerHTML = '';
        searchResultsContainer.style.display = 'none';
        searchInput.value = ''; // Limpia el input
        searchInput.blur(); // Quita el foco del input
        header.classList.remove('search-expanded'); // Cierra el header
      }
    });
  });
}

/**
 * 4. Muestra la información del edificio en el panel lateral
 * (Esta función es llamada por los PINES y por los RESULTADOS DE BÚSQUEDA)
 */
function mostrarInfoDesdeDatos(nombreBuscado) {
  // 1. Abrir el panel y mostrar "Cargando..."
  panelContent.innerHTML = '<p>Cargando información...</p>';
  panel.classList.add('open');

  // 2. ENCONTRAR el edificio en los datos GLOBALES
  const edificio = allEdificiosData.find(e => e.nombre.toLowerCase() === nombreBuscado.toLowerCase());

  // 3. Si el edificio se encuentra...
  if (edificio) {
    // 4. CONSTRUIR EL HTML con los datos
    let html = `
      <img id="panel-img" src="${edificio.fotoUrl || 'img/mapa-base.jpg'}" alt="Foto de ${edificio.nombre}" />
      <h2 id="panel-title">${edificio.nombre.toUpperCase()}</h2>
      <p id="panel-desc">Información del edificio:</p>
      <hr style="margin: 1rem 0;" />
    `;

    if (edificio.pisos && edificio.pisos.length > 0) {
      const pisosHtml = edificio.pisos.map(piso => {
        const salasHtml = piso.salas.map(sala => 
          `<li>${sala.nombre}</li>`
        ).join('');
        
        return `
          <li style="margin-bottom: 10px;">
            <strong>Piso ${piso.numero}:</strong>
            <ul style="margin-left: 20px; list-style-type: disc;">
              ${salasHtml || '<li>No hay salas registradass</li>'}
            </ul>
          </li>
        `;
      }).join('');
      html += `<ul style="margin: 0; padding-left: 20px;">${pisosHtml}</ul>`;
    } else {
      html += '<p>No hay pisos registrados para este edificio.</p>';
    }

    // 5. Insertar el HTML final en el panel
    panelContent.innerHTML = html;

  } else {
    // 6. Anti-error: Si no se encuentra (raro, pero posible)
    panelContent.innerHTML = `<h2 id="panel-title">${nombreBuscado.toUpperCase()}</h2><p>No se encontró información para este edificio.</p>`;
  }
}