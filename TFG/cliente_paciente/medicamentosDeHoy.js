document.addEventListener("DOMContentLoaded", function () {
    const idPaciente = localStorage.getItem("idUsuario");

    // Verifica si el idPaciente existe y no está vacío
    if (!idPaciente) {
        document.getElementById("diacuenta").textContent = "No se ha encontrado el paciente.";
        return;
    }

    // Muestra un mensaje de carga mientras se obtiene la información
    document.getElementById("diacuenta").textContent = "Cargando...";

    // Realiza la solicitud GET para obtener las alertas de hoy
    axios.get(`http://localhost:9050/pacientes/alertasDeHoy/${idPaciente}/alertas/hoy`)
    
        .then(res => {
            const cantidad = res.data;
            console.log(cantidad);
            const mensaje = cantidad === 0
                ? "Hoy no tienes ningún medicamento por tomar"
                : `Hoy tienes ${cantidad} medicamentos por tomar`;

            // Actualiza el contenido de la página con la respuesta
            document.getElementById("diacuenta").textContent = mensaje;
        })
        .catch(err => {
            console.error("Error al obtener el conteo de alertas de hoy:", err);
            document.getElementById("diacuenta").textContent = "No se pudo cargar el recordatorio.";
        });
});
