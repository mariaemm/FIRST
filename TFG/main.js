// ------------------- Script 2: Recuperar datos del localStorage -------------------
document.addEventListener("DOMContentLoaded", function () {
    const nombreUsuario = localStorage.getItem("correo"); // O cualquier campo que guardes con el nombre
    const tipoUsuario = localStorage.getItem("tipoUsuario");
    const nombre = localStorage.getItem("nombre");

    // Si los datos existen, actualizamos el HTML
    if(nombre){
        document.getElementById("nombre-usu").innerText = nombre;
    }
    if (nombreUsuario) {
        document.querySelector(".nombre-usuario").textContent = nombreUsuario;
    }
    if (tipoUsuario) {
        document.getElementById("paciente-text").textContent = tipoUsuario;
    }

    // Evento para cerrar sesión
    document.querySelector(".cerrar-sesion-cliente").addEventListener("click", function () {
        // Limpiar localStorage y redirigir a index.html
        localStorage.clear();
        window.location.href = "index.html"; // Redirige a la página de inicio
    });
});
