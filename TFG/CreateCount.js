document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const userTypeSelect = document.getElementById("user-type");
    const extraFieldsContainer = document.getElementById("extra-fields");

    // Función para actualizar los campos según el tipo de usuario
    function actualizarCamposExtra() {
        extraFieldsContainer.innerHTML = ""; // Limpiar los campos previos

        const tipoUsuario = userTypeSelect.value;
        if (tipoUsuario === "PACIENTE") {
            extraFieldsContainer.innerHTML = `
                <label for="diagnostico">DIAGNÓSTICO</label>
                <input type="text" id="diagnostico" name="diagnostico" required>
            `;
        } else if (tipoUsuario === "MEDICO") {
            extraFieldsContainer.innerHTML = `
                <label for="numeroColegiado">NÚMERO COLEGIADO</label>
                <input type="text" id="numeroColegiado" name="numeroColegiado" required>

                <label for="especialidad">ESPECIALIDAD</label>
                <input type="text" id="especialidad" name="especialidad" required>
            `;
        }
    }

    // Escuchar cambios en el select para mostrar los campos correspondientes
    userTypeSelect.addEventListener("change", actualizarCamposExtra);
    actualizarCamposExtra(); // Ejecutar al cargar la página

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const nombre = document.getElementById("name").value;
        const apellido = document.getElementById("apellido").value;
        const dni = document.getElementById("dni").value;
        const correo = document.getElementById("correo").value;
        const contrasena = document.getElementById("contrasena").value;
        const tipoUsuario = userTypeSelect.value;

        let usuario = {
            nombre: nombre,
            apellido: apellido,
            dni: dni,
            correo: correo,
            contrasena: contrasena,
            tipoUsuario: tipoUsuario
        };

        // Validación adicional dependiendo del tipo de usuario
        if (tipoUsuario === "PACIENTE") {
            const diagnostico = document.getElementById("diagnostico").value;
            if (!diagnostico) {
                alert("Por favor, ingrese el diagnóstico.");
                return;
            }
            usuario.diagnostico = diagnostico;
        } else if (tipoUsuario === "MEDICO") {
            const numeroColegiado = document.getElementById("numeroColegiado").value;
            const especialidad = document.getElementById("especialidad").value;
            if (!numeroColegiado || !especialidad) {
                alert("Por favor, complete los datos del médico.");
                return;
            }
            usuario.numeroColegiado = numeroColegiado;
            usuario.especialidad = especialidad;
        }

        // Enviar la solicitud de creación de usuario
        axios.post("http://localhost:9050/usuarios/alta2", usuario, {
            headers: { "Content-Type": "application/json" }
        })
        .then(response => {
            // Respuesta exitosa
            alert(response.data); // Muestra la respuesta del servidor
            window.location.href = "LoginCount.html"; // Redirigir a la página de login después de registro exitoso
        })
        .catch(error => {
            // Manejo de error
            console.error("Error al registrar:", error);
            alert("Error al registrar el usuario.");
        });
    });
});
