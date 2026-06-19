// Esperamos a que el HTML esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // Capturamos el div de Rojo Fuego
    const btnRojo = document.getElementById("btn-rojo");
    btnRojo.addEventListener("click", () => {
        window.location.href = "rojoFuego.html";
    });

    // Capturamos el div de Verde Hoja
    const btnVerde = document.getElementById("btn-verde");
    btnVerde.addEventListener("click", () => {
        window.location.href = "verde_hoja.html";
    });
    
});

