// Esperamos a que el HTML esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // Capturamos las opciones del menú lateral
    const inicio = document.getElementById("inicio");
    const personajes = document.getElementById("personajes");
    const pokedex = document.getElementById("pokedex");
    
    // Capturamos los contenedores de contenido de cada pestaña
    const gridInicio = document.getElementById("grid-inicio");
    const gridPersonajes = document.getElementById("grid-personajes"); // Asegúrate de tener este ID en tu HTML
    const gridPokedex = document.getElementById("grid-pokedex");       // Asegúrate de tener este ID en tu HTML
    
    // Iniciamos con la pestaña de inicio activa
    inicio.classList.add('active');
    
    inicio.addEventListener("click", (event) => {
        // 1. Manejo de clases activas en el menú
        inicio.classList.add('active');
        pokedex.classList.remove('active');
        personajes.classList.remove('active');
    
        // 2. Mostrar/Ocultar el contenido dinámico
        gridInicio.style.display = "block";       // Muestra Inicio
        gridPersonajes.style.display = "none";    // Oculta Personajes
        gridPokedex.style.display = "none";       // Oculta Pokedex
    });
    
    personajes.addEventListener("click", (event) => {
        // 1. Manejo de clases activas en el menú
        personajes.classList.add('active');
        inicio.classList.remove('active');
        pokedex.classList.remove('active');
    
        // 2. Mostrar/Ocultar el contenido dinámico
        gridInicio.style.display = "none";        // Oculta Inicio
        gridPersonajes.style.display = "block";   // Muestra Personajes
        gridPokedex.style.display = "none";       // Oculta Pokedex
    });
    
    pokedex.addEventListener("click", (event) => {
        // 1. Manejo de clases activas en el menú
        pokedex.classList.add('active');
        inicio.classList.remove('active');
        personajes.classList.remove('active');
    
        // 2. Mostrar/Ocultar el contenido dinámico
        gridInicio.style.display = "none";        // Oculta Inicio
        gridPersonajes.style.display = "none";    // Oculta Personajes
        
        // Si tu Pokédex usa CSS Grid para las tarjetas de Pokémon, cámbialo aquí a "grid"
        gridPokedex.style.display = "grid";       // Muestra Pokédex
    });




    // --- LÓGICA DE LA POKÉDEX ESTILO LIBRO ---

    // Datos de prueba (puedes añadir más siguiendo el mismo formato)
    // Arreglo expandido con 12 Pokémon para rellenar la primera página completa
    const listaPokemon = [
        { "id": "001", "name": "BULBASAUR", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/1.png" },
        { "id": "002", "name": "IVYSAUR", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/2.png" },
        { "id": "003", "name": "VENUSAUR", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/3.png" },
        { "id": "004", "name": "CHARMANDER", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/4.png" },
        { "id": "005", "name": "CHARMELEON", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/5.png" },
        { "id": "006", "name": "CHARIZARD", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/6.png" },
        { "id": "007", "name": "SQUIRTLE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/7.png" },
        { "id": "008", "name": "WARTORTLE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/8.png" },
        { "id": "009", "name": "BLASTOISE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/9.png" },
        { "id": "010", "name": "CATERPIE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/10.png" },
        { "id": "011", "name": "METAPOD", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/11.png" },
        { "id": "012", "name": "BUTTERFREE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/12.png" },
        { "id": "013", "name": "WEEDLE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/13.png" },
        { "id": "014", "name": "KAKUNA", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/14.png" },
        { "id": "015", "name": "BEEDRILL", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/15.png" },
        { "id": "016", "name": "PIDGEY", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/16.png" },
        { "id": "017", "name": "PIDGEOTTO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/17.png" },
        { "id": "018", "name": "PIDGEOT", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/18.png" },
        { "id": "019", "name": "RATTATA", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/19.png" },
        { "id": "020", "name": "RATICATE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/20.png" },
        { "id": "021", "name": "SPEAROW", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/21.png" },
        { "id": "022", "name": "FEAROW", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/22.png" },
        { "id": "023", "name": "EKANS", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/23.png" },
        { "id": "024", "name": "ARBOK", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/24.png" },
        { "id": "025", "name": "PIKACHU", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/25.png" },
        { "id": "026", "name": "RAICHU", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/26.png" },
        { "id": "027", "name": "SANDSHREW", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/27.png" },
        { "id": "028", "name": "SANDSLASH", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/28.png" },
        { "id": "029", "name": "NIDORAN♀", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/29.png" },
        { "id": "030", "name": "NIDORINA", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/30.png" },
        { "id": "031", "name": "NIDOQUEEN", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/31.png" },
        { "id": "032", "name": "NIDORAN♂", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/32.png" },
        { "id": "033", "name": "NIDORINO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/33.png" },
        { "id": "034", "name": "NIDOKING", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/34.png" },
        { "id": "035", "name": "CLEFAIRY", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/35.png" },
        { "id": "036", "name": "CLEFABLE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/36.png" },
        { "id": "037", "name": "VULPIX", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/37.png" },
        { "id": "038", "name": "NINETALES", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/38.png" },
        { "id": "039", "name": "JIGGLYPUFF", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/39.png" },
        { "id": "040", "name": "WIGGLYTUFF", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/40.png" },
        { "id": "041", "name": "ZUBAT", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/41.png" },
        { "id": "042", "name": "GOLBAT", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/42.png" },
        { "id": "043", "name": "ODDISH", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/43.png" },
        { "id": "044", "name": "GLOOM", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/44.png" },
        { "id": "045", "name": "VILEPLUME", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/45.png" },
        { "id": "046", "name": "PARAS", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/46.png" },
        { "id": "047", "name": "PARASECT", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/47.png" },
        { "id": "048", "name": "VENONAT", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/48.png" },
        { "id": "049", "name": "VENOMOTH", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/49.png" },
        { "id": "050", "name": "DIGLETT", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/50.png" },
        { "id": "051", "name": "DUGTRIO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/51.png" },
        { "id": "052", "name": "MEOWTH", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/52.png" },
        { "id": "053", "name": "PERSIAN", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/53.png" },
        { "id": "054", "name": "PSYDUCK", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/54.png" },
        { "id": "055", "name": "GOLDUCK", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/55.png" },
        { "id": "056", "name": "MANKEY", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/56.png" },
        { "id": "057", "name": "PRIMEAPE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/57.png" },
        { "id": "058", "name": "GROWLITHE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/58.png" },
        { "id": "059", "name": "ARCANINE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/59.png" },
        { "id": "060", "name": "POLIWAG", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/60.png" },
        { "id": "061", "name": "POLIWHIRL", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/61.png" },
        { "id": "062", "name": "POLIWRATH", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/62.png" },
        { "id": "063", "name": "ABRA", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/63.png" },
        { "id": "064", "name": "KADABRA", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/64.png" },
        { "id": "065", "name": "ALAKAZAM", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/65.png" },
        { "id": "066", "name": "MACHOP", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/66.png" },
        { "id": "067", "name": "MACHOKE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/67.png" },
        { "id": "068", "name": "MACHAMP", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/68.png" },
        { "id": "069", "name": "BELLSPROUT", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/69.png" },
        { "id": "070", "name": "WEEPINBELL", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/70.png" },
        { "id": "071", "name": "VICTREEBEL", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/71.png" },
        { "id": "072", "name": "TENTACOOL", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/72.png" },
        { "id": "073", "name": "TENTACRUEL", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/73.png" },
        { "id": "074", "name": "GEODUDE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/74.png" },
        { "id": "075", "name": "GRAVELER", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/75.png" },
        { "id": "076", "name": "GOLEM", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/76.png" },
        { "id": "077", "name": "PONYTA", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/77.png" },
        { "id": "078", "name": "RAPIDASH", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/78.png" },
        { "id": "079", "name": "SLOWPOKE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/79.png" },
        { "id": "080", "name": "SLOWBRO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/80.png" },
        { "id": "081", "name": "MAGNEMITE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/81.png" },
        { "id": "082", "name": "MAGNETON", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/82.png" },
        { "id": "083", "name": "FARFETCH'D", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/83.png" },
        { "id": "084", "name": "DODUO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/84.png" },
        { "id": "085", "name": "DODRIO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/85.png" },
        { "id": "086", "name": "SEEL", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/86.png" },
        { "id": "087", "name": "DEWGONG", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/87.png" },
        { "id": "088", "name": "GRIMER", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/88.png" },
        { "id": "089", "name": "MUK", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/89.png" },
        { "id": "090", "name": "SHELLDER", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/90.png" },
        { "id": "091", "name": "CLOYSTER", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/91.png" },
        { "id": "092", "name": "GASTLY", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/92.png" },
        { "id": "093", "name": "HAUNTER", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/93.png" },
        { "id": "094", "name": "GENGAR", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/94.png" },
        { "id": "095", "name": "ONIX", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/95.png" },
        { "id": "096", "name": "DROWZEE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/96.png" },
        { "id": "097", "name": "HYPNO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/97.png" },
        { "id": "098", "name": "KRABBY", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/98.png" },
        { "id": "099", "name": "KINGLER", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/99.png" },
        { "id": "100", "name": "VOLTORB", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/100.png" },
        { "id": "101", "name": "ELECTRODE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/101.png" },
        { "id": "102", "name": "EXEGGCUTE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/102.png" },
        { "id": "103", "name": "EXEGGUTOR", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/103.png" },
        { "id": "104", "name": "CUBONE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/104.png" },
        { "id": "105", "name": "MAROWAK", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/105.png" },
        { "id": "106", "name": "HITMONLEE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/106.png" },
        { "id": "107", "name": "HITMONCHAN", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/107.png" },
        { "id": "108", "name": "LICKITUNG", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/108.png" },
        { "id": "109", "name": "KOFFING", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/109.png" },
        { "id": "110", "name": "WEEZING", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/110.png" },
        { "id": "111", "name": "RHYHORN", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/111.png" },
        { "id": "112", "name": "RHYDON", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/112.png" },
        { "id": "113", "name": "CHANSEY", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/113.png" },
        { "id": "114", "name": "TANGELA", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/114.png" },
        { "id": "115", "name": "KANGASKHAN", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/115.png" },
        { "id": "116", "name": "HORSEA", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/116.png" },
        { "id": "117", "name": "SEADRA", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/117.png" },
        { "id": "118", "name": "GOLDEEN", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/118.png" },
        { "id": "119", "name": "SEAKING", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/119.png" },
        { "id": "120", "name": "STARYU", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/120.png" },
        { "id": "121", "name": "STARMIE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/121.png" },
        { "id": "122", "name": "MR. MIME", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/122.png" },
        { "id": "123", "name": "SCYTHER", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/123.png" },
        { "id": "124", "name": "JYNX", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/124.png" },
        { "id": "125", "name": "ELECTABUZZ", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/125.png" },
        { "id": "126", "name": "MAGMAR", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/126.png" },
        { "id": "127", "name": "PINSIR", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/127.png" },
        { "id": "128", "name": "TAUROS", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/128.png" },
        { "id": "129", "name": "MAGIKARP", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/129.png" },
        { "id": "130", "name": "GYARADOS", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/130.png" },
        { "id": "131", "name": "LAPRAS", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/131.png" },
        { "id": "132", "name": "DITTO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/132.png" },
        { "id": "133", "name": "EEVEE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/133.png" },
        { "id": "134", "name": "VAPOREON", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/134.png" },
        { "id": "135", "name": "JOLTEON", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/135.png" },
        { "id": "136", "name": "FLAREON", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/136.png" },
        { "id": "137", "name": "PORYGON", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/137.png" },
        { "id": "138", "name": "OMANYTE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/138.png" },
        { "id": "139", "name": "OMASTAR", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/139.png" },
        { "id": "140", "name": "KABUTO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/140.png" },
        { "id": "141", "name": "KABUTOPS", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/141.png" },
        { "id": "142", "name": "AERODACTYL", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/142.png" },
        { "id": "143", "name": "SNORLAX", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/143.png" },
        { "id": "144", "name": "ARTICUNO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/144.png" },
        { "id": "145", "name": "ZAPDOS", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/145.png" },
        { "id": "146", "name": "MOLTRES", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/146.png" },
        { "id": "147", "name": "DRATINI", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/147.png" },
        { "id": "148", "name": "DRAGONAIR", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/148.png" },
        { "id": "149", "name": "DRAGONITE", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/149.png" },
        { "id": "150", "name": "MEWTWO", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/150.png" },
        { "id": "151", "name": "MEW", "img": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/151.png" }
    ];

    const pokemonPorPagina = 12; // Ahora cargamos 12 por vista
    let paginaActual = 1;

    function renderizarPagina() {
        const contenedorIzquierdo = document.getElementById("pokedex-left-page");
        const contenedorDerecho = document.getElementById("pokedex-right-page");
        const indicador = document.getElementById("page-indicator");
        const btnPrev = document.getElementById("btn-prev-page");
        const btnNext = document.getElementById("btn-next-page");

        // Limpiamos ambas páginas del libro
        contenedorIzquierdo.innerHTML = "";
        contenedorDerecho.innerHTML = "";

        // Cortar los 12 Pokémon correspondientes a esta página
        const inicioFiltro = (paginaActual - 1) * pokemonPorPagina;
        const finFiltro = inicioFiltro + pokemonPorPagina;
        const pokemonVisibles = listaPokemon.slice(inicioFiltro, finFiltro);

        // Iterar y repartir usando el índice
        pokemonVisibles.forEach((poke, index) => {
            const tarjetaHTML = `
                <div class="pokemon-card">
                    <span class="pokemon-number">No. ${poke.id}</span>
                    <img src="${poke.img}" alt="${poke.name}" class="pokemon-sprite">
                    <h2 class="pokemon-name">${poke.name}</h2>
                </div>
            `;

            // Si el índice es menor a 6, va a la página izquierda. Si es del 6 al 11, a la derecha.
            if (index < 6) {
                contenedorIzquierdo.innerHTML += tarjetaHTML;
            } else {
                contenedorDerecho.innerHTML += tarjetaHTML;
            }
        });

        // Actualizar estados de la paginación
        const totalPaginas = Math.ceil(listaPokemon.length / pokemonPorPagina) || 1;
        indicador.innerText = `Pág. ${paginaActual} de ${totalPaginas}`;

        btnPrev.disabled = paginaActual === 1;
        btnNext.disabled = paginaActual === totalPaginas;
    }

    // Eventos de los botones (Se mantienen igual)
    document.getElementById("btn-prev-page").addEventListener("click", () => {
        if (paginaActual > 1) { paginaActual--; renderizarPagina(); }
    });
    document.getElementById("btn-next-page").addEventListener("click", () => {
        const totalPaginas = Math.ceil(listaPokemon.length / pokemonPorPagina);
        if (paginaActual < totalPaginas) { paginaActual++; renderizarPagina(); }
    });

    // Carga inicial
    renderizarPagina();
    
    
    
});