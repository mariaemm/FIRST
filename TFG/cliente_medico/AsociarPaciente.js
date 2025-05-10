document.addEventListener("DOMContentLoaded", function () {
    const numeroColegiado = localStorage.getItem("idUsuario");
    const correoPacienteField = document.getElementById("correoPaciente");
    const numeroColegiadoField = document.getElementById("numeroColegiado");

    // Verificar si el número de colegiado existe en localStorage
    if (!numeroColegiado) {
        document.getElementById("mensajeAsociacion").innerHTML = "<p style='color: red;'>Error: No se encontró el número de colegiado en localStorage.</p>";
        return;
    }

    // Asignar el número de colegiado al campo correspondiente en el formulario
    numeroColegiadoField.value = numeroColegiado;  // Asignamos el valor recuperado
    numeroColegiadoField.setAttribute("readonly", true);  // Hacemos el campo solo de lectura

    // Función para enviar la asociación de paciente
    function enviarAsociacion() {
        const correo = correoPacienteField.value;

        // Validar que los campos no estén vacíos
        if (!numeroColegiado || !correo) {
            document.getElementById("mensajeAsociacion").innerHTML = "<p style='color: red;'>Por favor, complete todos los campos.</p>";
            return;
        }

        // Realizar la solicitud para asociar al paciente
        axios.post(`http://localhost:9050/medicos/asociarPaciente/${numeroColegiado}?correo=${correo}`)
            .then(response => {
                // Mostrar mensaje de éxito
                document.getElementById("mensajeAsociacion").innerHTML = `<p style="color: green;">Éxito: ${response.data}</p>`;
            })
            .catch(error => {
                if (error.response) {
                    if (error.response.status === 409) {
                        // El paciente ya está asociado a este médico
                        document.getElementById("mensajeAsociacion").innerHTML = `<p style="color: blue;">Nota: El paciente ya se encuentra asociado a este médico.</p>`;
                    } else if (error.response.status === 400) {
                        // El paciente no está registrado o no existe
                        document.getElementById("mensajeAsociacion").innerHTML = `<p style="color: red;">Error: Este paciente no está registrado o no existe ninguna cuenta asociada a este correo.</p>`;
                    } else {
                        // Otros errores generales
                        document.getElementById("mensajeAsociacion").innerHTML = `<p style="color: red;">Error al asociar paciente. Código de error: ${error.response.status}</p>`;
                    }
                } else {
                    // En caso de que no haya respuesta (error de red o similar)
                    document.getElementById("mensajeAsociacion").innerHTML = `<p style="color: red;">Error al intentar conectar con el servidor.</p>`;
                }
                console.error(error);
            });
    }

    // Asociar el evento del botón para enviar la asociación
    document.getElementById("btnAsociarPaciente").addEventListener("click", enviarAsociacion);
});
