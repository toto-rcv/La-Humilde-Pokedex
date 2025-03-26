
let URL = 'https://pokeapi.co/api/v2/pokemon/';

for (let i = 1; i <= 151; i++) {
    fetch(URL + i)
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
}


function mostrarPokemon(){
    
    const div = document.createElement('div');
    div.classList.add('pokemon');
    div.innerHTML = `
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png" alt="${data.name}">
        <h3>${data.name}</h3>
    `;
}