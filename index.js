import { parse } from './backend/analizador.js';
import { InterpreterVisitor } from './backend/interprete.js';
import { CompilerVisitor } from './backend/compilador.js';


// Selección de elementos del DOM
const editor = document.getElementById('code-editor');
const btnExecute = document.getElementById('execute');
const btnReport = document.getElementById('reportFile');
const ast = document.getElementById('ast');
const salida = document.getElementById('output');
const salida2 = document.getElementById('output2');

// Variables globales
let interpreteGlobal = null;
let erroresGlobales = [];  // Array global para almacenar los errores

// Manejador de eventos para el botón de ejecución
btnExecute.addEventListener('click', () => {
    const codigoFuente = editor.value;
    erroresGlobales = [];  // Limpiar el array de errores en cada ejecución
    salida.innerHTML = '';  // Limpiar la consola de salida
    salida2.innerHTML = '';  // Limpiar la consola de salida

    try {
        const sentencias = parse(codigoFuente);  // Posibles errores sintácticos
        console.log({ sentencias });

        const interprete = new InterpreterVisitor();  // Crea una nueva instancia del intérprete
        const compilador = new CompilerVisitor();  // Crea una nueva instancia del compilador

        // Interpretar las sentencias
        sentencias.forEach(sentencia => {
            try {
                sentencia.accept(interprete); 
                sentencia.accept(compilador);
            } catch (error) {
                // Captura errores semánticos durante la interpretación
                console.error(error);
                erroresGlobales.push({
                    mensaje: error.message || "Error semántico desconocido",
                    linea: error.linea || 0,  // Agrega información de línea si está disponible
                    columna: error.columna || 0,  // Agrega información de columna si está disponible
                    tipo: "Semántico"  // Marca el tipo de error
                });
            }
        });

        // Mostrar salida del intérprete
        salida.innerHTML = interprete.salida;
        salida2.innerHTML = compilador.code.toString().replace(/\n/g, '\n');

        // Almacenar la instancia del intérprete globalmente para su uso posterior
        interpreteGlobal = interprete;
        console.log("Intérprete global configurado:", interpreteGlobal);

    } catch (error) {
        // Captura errores sintácticos (parseo)
        console.log(error);
        erroresGlobales.push({
            mensaje: error.message || "Error de análisis (sintáctico)",
            linea: error.linea || 0,
            columna: error.columna || 0,
            tipo: "Sintáctico"  // Marca el tipo de error
        });
        salida.innerHTML = "Se ha producido un error durante la ejecución.";
    }

    // Mostrar errores en la consola de salida
    if (erroresGlobales.length > 0) {
        mostrarErroresEnConsola();
    }
});


// Función para mostrar los errores en la consola de salida
function mostrarErroresEnConsola() {
    const erroresTexto = erroresGlobales.map(error => {
        try {
            const linea = error.location?.end?.line || "N/A";
            const columna = error.location?.end?.column || "N/A";
            const tipoError = error.tipo || "Desconocido"; // Identifica el tipo de error
            return `Línea ${linea}, Columna ${columna}: [${tipoError}] ${error.mensaje}`;
        } catch (e) {
            return `Error: ${error.mensaje}`;
        }
    }).join('\n');
    salida.innerHTML += `\n\nErrores:\n${erroresTexto}`;
}


// Manejador de eventos para el botón de reporte
btnReport.addEventListener('click', () => {
    if (!interpreteGlobal) {
        alert("No se ha ejecutado ningún código para generar el reporte.");
        return;
    }

    const entorno = interpreteGlobal.getEntornoGlobal();
    const errores = erroresGlobales;

    // Generar reportes en HTML
    const reporteHTML = generarReporteHTML(entorno);
    const reporteErroresHTML = generarReporteErrores(errores);

    // Crear ventana para el reporte de símbolos
    const ventanaSimbolos = window.open("", "_blank");
    if (ventanaSimbolos) {
        ventanaSimbolos.document.open();
        ventanaSimbolos.document.write(reporteHTML);
        ventanaSimbolos.document.close();
    } else {
        console.error("No se pudo abrir la ventana para el reporte de símbolos.");
    }

    // Usar un mayor retraso para evitar que los navegadores bloqueen la segunda ventana
    setTimeout(() => {
        const ventanaErrores = window.open("", "_blank");
        if (ventanaErrores) {
            ventanaErrores.document.open();
            ventanaErrores.document.write(reporteErroresHTML);
            ventanaErrores.document.close();
        } else {
            console.error("No se pudo abrir la ventana para el reporte de errores.");
        }
    }, 1000);  // Retraso mayor, por ejemplo, 1000 ms
});


function generarReporteHTML(entorno) {
    let html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Símbolos</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #000;
                    color: #FFF;
                    margin: 0;
                    padding: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    padding: 12px;
                    border: 1px solid #444;
                    text-align: left;
                }
                th {
                    background-color: #333;
                }
                tr:nth-child(even) {
                    background-color: #222;
                }
                tr:hover {
                    background-color: #555;
                }
                h2 {
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <h2>Tabla de Símbolos</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Línea</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>`;

    // Iteramos sobre los símbolos del entorno
    for (const [nombre, { tipo, valor, linea, columna }] of Object.entries(entorno.getSimbolos())) {
        html += `
            <tr>
                <td>${nombre}</td>
                <td>${tipo}</td>
                <td>${valor}</td>
                <td>${linea}</td>
                <td>${columna}</td>
            </tr>`;
    }

    html += `
                </tbody>
            </table>
        </body>
        </html>`;

    return html;
}

function generarReporteErrores(errores) {
    let htmlErrores = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reporte de Errores</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #000;
                    color: #FFF;
                    margin: 0;
                    padding: 20px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    padding: 12px;
                    border: 1px solid #444;
                    text-align: left;
                }
                th {
                    background-color: #333;
                }
                tr:nth-child(even) {
                    background-color: #222;
                }
                tr:hover {
                    background-color: #555;
                }
                h2 {
                    border-bottom: 2px solid #333;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <h2>Reporte de Errores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Línea</th>
                        <th>Columna</th>
                        <th>Tipo</th>
                        <th>Mensaje</th>
                    </tr>
                </thead>
                <tbody>`;

    errores.forEach((error) => {
        const linea = error.linea || "N/A";
        const columna = error.columna || "N/A";
        const tipoError = error.tipo || "Desconocido";
        htmlErrores += `
            <tr>
                <td>${linea}</td>
                <td>${columna}</td>
                <td>${tipoError}</td>
                <td>${error.mensaje}</td>
            </tr>`;
    });

    htmlErrores += `
                </tbody>
            </table>
        </body>
        </html>`;

    return htmlErrores;
}
