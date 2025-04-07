// Obtener el contenedor donde se mostrarán los Pokémon
const listaPokemon = document.getElementById('listaPokemon');
let URL = 'https://pokeapi.co/api/v2/pokemon/';

// Obtener y mostrar los datos de los Pokémon
// Este bucle recorre los primeros 151 Pokémon y los obtiene de la API
for (let i = 1; i <= 151; i++) {
    fetch(URL + i)
        .then(response => response.json())
        .then(data => {
            mostrarPokemon(data); // Muestra cada Pokémon en la lista
            console.log(data); // Muestra los datos en la consola para depuración
        });
}

// Función para obtener el color de fondo basado en los tipos
// Utiliza las variables CSS personalizadas para asignar colores según el tipo del Pokémon
function obtenerColorDeFondo(types) {
    const rootStyles = getComputedStyle(document.documentElement);
    const colors = types.map(type => rootStyles.getPropertyValue(`--type-${type.type.name}`));
    return colors.length > 1
        ? `linear-gradient(to bottom, ${colors[0]},${colors[1]})`
        : `linear-gradient(to bottom, ${colors[0]} 50%, rgba(0, 0, 0, 0.8) 100%)`; // Oscurece después del 50%
}

// Función para obtener un color más oscuro para las características del Pokémon
// Convierte colores hexadecimales a RGB y los oscurece un 20%
function obtenerColorDeFondoCaracteristicas(types) {
    const rootStyles = getComputedStyle(document.documentElement);
    let color = rootStyles.getPropertyValue(`--type-${types[0].type.name}`).trim();

    // Convertir el color de hex a RGB si es necesario
    if (color.startsWith('#')) {
        const bigint = parseInt(color.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        color = `rgb(${r}, ${g}, ${b})`;
    }

    // Extraer valores RGB y oscurecerlos un 20%
    const rgbMatch = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (rgbMatch) {
        const r = Math.max(0, Math.floor(rgbMatch[1] * 0.8));
        const g = Math.max(0, Math.floor(rgbMatch[2] * 0.8));
        const b = Math.max(0, Math.floor(rgbMatch[3] * 0.8));
        return `rgb(${r}, ${g}, ${b})`;
    }

    return color; // Retorna el color original si no es RGB
}

// Función para obtener las evoluciones del Pokémon
async function obtenerEvoluciones(pokemonId) {
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
    const speciesData = await speciesResponse.json();
    const evolutionChainUrl = speciesData.evolution_chain.url;

    const evolutionResponse = await fetch(evolutionChainUrl);
    const evolutionData = await evolutionResponse.json();

    const evoluciones = [];
    let currentEvolution = evolutionData.chain;

    while (currentEvolution) {
        const name = currentEvolution.species.name;
        const id = currentEvolution.species.url.split('/').filter(Boolean).pop();
        evoluciones.push({ name, id });
        currentEvolution = currentEvolution.evolves_to[0];
    }

    return evoluciones.length > 1 ? evoluciones : []; // Devuelve un array vacío si no hay evoluciones
}

// Función para obtener la descripción del Pokémon
async function obtenerDescripcion(pokemonId) {
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
    const speciesData = await speciesResponse.json();

    // Buscar la descripción en español
    const descripcion = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
    return descripcion ? descripcion.flavor_text.replace(/\n|\f/g, ' ') : 'No hay informacion de este Pokemon.';
}

// Función para abrir el modal del Pokémon
// Muestra información detallada del Pokémon en un modal
async function openPokemonModal(data) {
    const modal = document.getElementById('pokemonModal');
    const modalContent = modal.querySelector('.Pokemon-content');
    const screenWidth = window.innerWidth;

    let types = data.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');

    // Obtener evoluciones
    const evoluciones = (await obtenerEvoluciones(data.id)).filter(evo => parseInt(evo.id) <= 151);
    const evolucionesHtml = evoluciones.map(evo => `
        <div class="evolution">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png" alt="${evo.name}" style="width: 100px; height: 100px;">
            <p>${evo.name.charAt(0).toUpperCase() + evo.name.slice(1)}</p>
        </div>
    `).join('');

    // Hide the evolution div if no evolutions are available
    const evolutionDivStyle = evoluciones.length === 0 ? 'display: none;' : '';

    // Obtener descripción
    const descripcion = await obtenerDescripcion(data.id);

    switch (true) {
        case screenWidth > 1200:
            modalContent.innerHTML = `
            <div class="modal-body">
                <span class="close-modal">&times;</span>
                <div class="content-header-modal" style="border-bottom: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)};"> 
                    <div class="header-modal">
                        <p class="pokemon-id-back">N.°${data.id.toString().padStart(3, '0')}</p>
                        <div class="content-name-header-modal"> 
                            <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
                        </div>
                        <img src="/img/genero.png" alt="generos" class="generos">
                    </div> 
                </div> 
                <div class="modal-body-content">
                    <div class="pokemon-characteristics">
                        <div class="container-characteristics">
                            <p class="caracteristics-pokemon" style="background: ${obtenerColorDeFondoCaracteristicas(data.types)};">Altura</p>
                            <p class="characteristics-for-pokemons">${data.height / 10} m</p>
                        </div>    
                        <div class="container-characteristics">
                            <p class="caracteristics-pokemon" style="background: ${obtenerColorDeFondoCaracteristicas(data.types)};">Peso</p>
                            <p class="characteristics-for-pokemons">${data.weight / 10} kg</p>
                        </div>
                    </div>
                   <div class="pokemon-types">
                   <div class="container-types" style="justify-content: ${data.types.length > 1 ? 'space-between' : 'center'};">
                   ${data.types.map(type => `<p class="${type.type.name} tipo">${type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}</p>`).join('')}
                   </div>
                   <img src="${data.sprites.other["official-artwork"].front_default}" alt="${data.name}" class="pokemon-image-modal">
                   <div class="pokeball-container">
                       <img src="/img/pngwing.com.png" alt="pokeball" class="pokeball">
                   </div>
                   </div>
                    <div class="pokemon-stats">
                        <h3>Estadisticas</h3>
                        <div class="stats-container">
                            ${generarStats(data.stats)}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="pokemon-types">
                        <div class="pokemon-evolutions" style="border-left: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)}; border-right: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)}; ${evolutionDivStyle}">
                            ${evolucionesHtml}
                        </div>
                    </div>
                </div>
                <div class="pokemon-description" style="border-left: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)}; border-right: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)};">
                    <h3>Informacion</h3>
                    <p>${descripcion}</p>
                </div>
            </div>`;
            break;

        case screenWidth <= 900:
            modalContent.innerHTML = `
            <div class="modal-body">
                <span class="close-modal">&times;</span>
                <div class="content-header-modal" style="border-bottom: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)};"> 
                    <div class="header-modal">
                        <p class="pokemon-id-back">N.°${data.id.toString().padStart(3, '0')}</p>
                        <div class="content-name-header-modal"> 
                            <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
                        </div>
                         <img src="/img/genero.png" alt="generos" class="generos">
                    </div> 
                </div> 
                <div class="modal-body-content">
                    <div class="pokemon-characteristics">
                        <div class="container-characteristics">
                            <p class="caracteristics-pokemon" style="background: ${obtenerColorDeFondoCaracteristicas(data.types)};">Altura</p>
                            <p class="characteristics-for-pokemons">${data.height / 10} m</p>
                        </div>    
                        <div class="container-characteristics">
                            <p class="caracteristics-pokemon" style="background: ${obtenerColorDeFondoCaracteristicas(data.types)};">Peso</p>
                            <p class="characteristics-for-pokemons">${data.weight / 10} kg</p>
                        </div>
                    </div>
                <div class="pokemon-and-evolutions">
                  <div class="pokemon-types">
                   <div class="types-pokemon-top">
                       <div class="container-types" style="justify-content: ${data.types.length > 1 ? 'space-between' : 'center'};">
                       ${data.types.map(type => `<p class="${type.type.name} tipo">${type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)}</p>`).join('')}
                       </div>
                       <img src="${data.sprites.other["official-artwork"].front_default}" alt="${data.name}" class="pokemon-image-modal">
                   </div>
                    <div class="pokemon-evolutions" style="border-left: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)}; border-right: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)}; ${evolutionDivStyle}">
                        ${evolucionesHtml}
                    </div>
                </div>
                   </div>
                    <div class="pokemon-stats">
                        <h3>Estadisticas</h3>
                        <div class="stats-container">
                            ${generarStats(data.stats)}
                        </div>
                    </div>
                </div>
                <div class="pokemon-description" style="border-left: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)}; border-right: 3px solid ${obtenerColorDeFondoCaracteristicas(data.types)};">
                    <h3>Informacion</h3>
                    <p>${descripcion}</p>
                </div>
            </div>`;
            break;
    }

    // Establecer el color de fondo dinámico
    const modalBody = modal.querySelector('.modal-body');
    const backgroundColor = obtenerColorDeFondo(data.types);
    modalBody.style.background = backgroundColor;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Cerrar el modal al hacer clic en la X
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Reproducir el sonido del Pokémon al hacer clic en su imagen
    const pokemonImage = modal.querySelector('.pokemon-image-modal');
    pokemonImage.addEventListener('click', () => {
        const audio = new Audio(`https://play.pokemonshowdown.com/audio/cries/${data.name.toLowerCase()}.mp3`);
        audio.play();
    });
}

// Función para generar los stats en español
function generarStats(stats) {
    const nombresStats = {
        hp: "HP",
        attack: "Ataque",
        defense: "Defensa",
        "special-attack": "At. Especial",
        "special-defense": "Def. Especial",
        speed: "Velocidad"
    };

    const coloresStats = {
        hp: "#f10801",
        attack: "#f47f30",
        defense: "#f8cf32",
        "special-attack": "#6690ed",
        "special-defense": "#7ac74d",
        speed: "#fd558b"
    };

    return stats.map(stat => `
        <div class="stat-item">
            <p>${nombresStats[stat.stat.name] || stat.stat.name}: ${stat.base_stat}</p>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${(stat.base_stat / 200) * 100}%; background-color: ${coloresStats[stat.stat.name] || '#4caf50'};"></div>
            </div>
        </div>
    `).join('');
}

// Función para mostrar las tarjetas de los Pokémon
// Crea y añade una tarjeta con información básica de cada Pokémon
function mostrarPokemon(data) {
    let types = data.types.map(type => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');

    const div = document.createElement('div');
    div.classList.add('pokemon');
    div.innerHTML = `
       <p class="pokemon-id-back">#${data.id.toString().padStart(3, '0')}</p>
       <div class="pokemon-image">
           <img src="${data.sprites["front_default"]}" alt="${data.name}">
       </div>
       <div class="pokemon-info">
           <div class="nombre-contenedor">
               <p>${data.order}</p>
               <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
           </div>
           <div class="pokemon-tipos">
               ${types} 
           </div>
           <div class="pokemon-stats">
               <p class="stat">${data.height / 10}m</p>
               <p class="stat">${data.weight / 10}kg</p>
           </div>
       </div>
    `;
    div.addEventListener('click', () => openPokemonModal(data));
    listaPokemon.appendChild(div);
}
