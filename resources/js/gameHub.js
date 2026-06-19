// Variable de arquitectura global requerida obligatoriamente por IodineGBA antes de instanciarse
//window.__LITTLE_ENDIAN__ = true;

document.addEventListener("DOMContentLoaded", () => {
    let emuladorGBA = null;

    try{
        // 1. Instanciar el emulador desde nuestro script unificado
        emuladorGBA = new GameBoyAdvanceEmulator();
        emuladorGBA.playStatusCallback = function(status) { console.log("Estado del emulador:", status); };
        console.log("¡Motor unificado de IodineGBA inicializado con éxito!");

        // 2. Desactivar los hilos secundarios para renderizar directo en el canvas principal
        if (typeof emuladorGBA.toggleOffthreadGraphics === "function") {
            emuladorGBA.toggleOffthreadGraphics(false);
            console.log("-> Modo Canvas Activo (Gráficos fuera de hilo desactivados).");
        }

        // 3. Vincular el canvas mediante el Handler de gráficos nativo
        const canvasGBA = document.getElementById('gba-canvas');

        if (canvasGBA) {
            const ctx = canvasGBA.getContext('2d');
            
            // Guardamos una única instancia de ImageData para no saturar el Garbage Collector a 60 FPS
            const imgData = ctx.createImageData(240, 160);
            
            emuladorGBA.attachGraphicsFrameHandler((buffer) => {
                // CORRECCIÓN 1: Forzamos el mapeo de memoria asegurando que se interprete como un Array de 8 bits sujeto para el Canvas
                if (buffer) {
                    imgData.data.set(new Uint8ClampedArray(buffer.buffer || buffer));
                    ctx.putImageData(imgData, 0, 0);
                }
            });
            console.log("Canvas de juego acoplado mediante el Graphics Frame Handler.");
        }

        // =====================================================================
        // AJUSTE CRÍTICO: DETONADOR DEL TEMPORIZADOR SÍNCRONO (TICK PRINCIPAL)
        // =====================================================================
        // Al no haber Web Worker, obligamos al core a procesar audio, video y lógica cada 16ms (~60 FPS)
        // =====================================================================
        // DISPARADOR ENCONTRADO Y ACTIVACIÓN SÍNCRONA
        // =====================================================================
        // Buscamos cuál es el nombre exacto de la función que hace avanzar los frames:
        let funcionReloj = null;

        if (typeof emuladorGBA.performCoreTimerLoop === "function") {
            funcionReloj = () => emuladorGBA.performCoreTimerLoop();
            console.log("-> Reloj nativo detectado: performCoreTimerLoop");
        } else if (typeof emuladorGBA.timerLoop === "function") {
            funcionReloj = () => emuladorGBA.timerLoop();
            console.log("-> Reloj nativo detectado: timerLoop");
        } else if (typeof emuladorGBA.play === "function") {
            funcionReloj = () => emuladorGBA.play();
            console.log("-> Reloj nativo detectado: play");
        } else if (typeof emuladorGBA.step === "function") {
            funcionReloj = () => emuladorGBA.step();
            console.log("-> Reloj nativo detectado: step");
        }

        // Si encontramos el motor de empuje, lo ejecutamos a 60 FPS
        if (funcionReloj) {
            setInterval(() => {
                try {
                    funcionReloj();
                } catch (e) {
                    console.error("Error en el ciclo de reloj del emulador:", e);
                }
            }, 16);
        } else {
            console.warn("⚠️ No se detectó ninguna función de temporizador automático en emuladorGBA. Métodos disponibles:", Object.keys(emuladorGBA));
        }

    } catch (error) {
        console.error("Error crítico en la configuración de la instancia:", error.message);
    }

    // 4. Lógica de control del botón de inicio
    const starGame = document.getElementById("btn-startGame");
    if (starGame) {
        starGame.addEventListener("click", () => {
            if (!emuladorGBA) {
                alert("El emulador no está listo aún.");
                return;
            }

            console.log("Iniciando peticiones binarias estándar para BIOS y ROM...");

            // Carga clásica de la BIOS
            const xhrBios = new XMLHttpRequest();
            xhrBios.open("GET", "resources/room/bios.bin", true);
            xhrBios.responseType = "arraybuffer";

            xhrBios.onload = function() {
                if (xhrBios.status === 200) {
                    const biosBytes = new Uint8Array(xhrBios.response);
                    emuladorGBA.attachBIOS(biosBytes);
                    console.log("-> BIOS inyectada correctamente.");

                    // Carga clásica de la ROM
                    const xhrRom = new XMLHttpRequest();
                    xhrRom.open("GET", "resources/room/room.gba", true);
                    xhrRom.responseType = "arraybuffer";

                    xhrRom.onload = function() {
                        if (xhrRom.status === 200) {
                            const romBytes = new Uint8Array(xhrRom.response);
                            emuladorGBA.attachROM(romBytes);
                            console.log("-> ROM inyectada correctamente.");

                            try {
                                // Encendido del núcleo de hardware
                                emuladorGBA.initializeCore();
                                console.log("-> Núcleo de hardware inicializado.");
                                
                                emuladorGBA.play();
                                console.log("¡Emulador corriendo de forma exitosa!");
                            } catch (err) {
                                console.error("Error al arrancar el motor core:", err.message);
                            }
                        } else {
                            console.error("No se pudo obtener la ROM desde ./room/room.gba");
                        }
                    };
                    xhrRom.send();
                } else {
                    console.error("No se pudo obtener la BIOS desde ./room/gba_bios.bin");
                }
            };
            xhrBios.send();
        });
    }
});