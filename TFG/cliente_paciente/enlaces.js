// ------------------- enlaces.js -------------------

// FUNCION PARA AGREGAR EVENTOS A LOS ENLACES
function agregarEvento(id, url) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.addEventListener("click", function () {
            window.location.href = url;
        });
    } else {
        console.error(`Elemento '${id}' no encontrado`);
    }
}

// Espera que el DOM esté listo antes de asignar eventos
document.addEventListener("DOMContentLoaded", function () {
    agregarEvento("verperfil", "cliente_paciente/miperfil.html");
    agregarEvento("verhisalert", "cliente_paciente/mihistorialtomas.html");

    agregarEvento("VerMisRecetas", "cliente_paciente/misrecetas.html");
    agregarEvento("VerMisMedicos", "cliente_paciente/mismedicos.html");
    agregarEvento("VerMisAlertas", "cliente_paciente/misalertas.html");
    agregarEvento("vermedicamentos", "cliente_paciente/mismedicamentos.html");
});


// ------------------- Script 1: Mostrar fecha -------------------
document.addEventListener("DOMContentLoaded", function () {
    // Obtener la fecha actual
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth(); // Los meses comienzan desde 0
    const anio = fecha.getFullYear();
    const diaSemana = fecha.getDay(); // 0 es domingo, 1 es lunes, etc.

    // Arrays con nombres de días y meses
    const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    // Crear el texto con la fecha
    const textoFecha = `Hoy es ${diasSemana[diaSemana]} ${dia} de ${meses[mes]} del ${anio}`;

    // Insertar el texto en el div con id "fecha"
    document.getElementById("fecha").textContent = textoFecha;
});

