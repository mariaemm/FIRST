document.addEventListener("DOMContentLoaded", function () {
    const resultadoDiv = document.getElementById("resultadoDiv");

    // OBTENEMOS EL numeroColegiado DESDE localStorage
    const numeroColegiado = localStorage.getItem("idUsuario");

    if (!numeroColegiado) {
        resultadoDiv.innerHTML = "<p>Error: No se encontró el número de colegiado en localStorage.</p>";
        return;
    }

    // HACEMOS UNA PETICIÓN GET PARA OBTENER LOS MEDICAMENTOS
    axios.get("http://localhost:9050/medicos/BuscarTodosLosMedicamentos")
        .then(response => {
            const medicamentos = response.data;
            let opcionesMedicamentos = medicamentos.map(med =>
                `<option value="${med.idMedicamento}">${med.nombreMedicamento}</option>`
            ).join("");

            // Oculte el numero de colegiado
            resultadoDiv.innerHTML = `
                <div id="crearRecetaDiv">
                    <label>Correo del Paciente:</label>
                    <input type="text" id="correo_paciente">
                    <span id="mensajeCorreo" style="margin-left: 10px;"></span><br>

                    <input type="hidden" id="numero_colegiado" value="${numeroColegiado}" readonly>

                    <label>Medicamento:</label>
                    <select id="id_medicamento">
                        ${opcionesMedicamentos}
                    </select><br>

                    <label>Dosis Por cada Toma:</label><input type="text" id="dosis"><br>
                    <label>Frecuencia (cada cuántas horas):</label><input type="text" id="frecuencia"><br>
                    <label>Duración del Tratamiento (días):</label><input type="text" id="duracion_tratamiento"><br>

                    <label>Estado de la Receta:</label>
                    <input type="text" id="caducidad" value="Activa" readonly><br>

                    <button id="btnCrearReceta">Aceptar</button>
                    <p id="mensajeReceta"></p>
                </div>
            `;

            // Activamos la validación solo cuando se escribe '@'
            document.getElementById("correo_paciente").addEventListener("input", function () {
                const valorCorreo = this.value;
                if (valorCorreo.includes("@")) {
                    validarCorreoPaciente(valorCorreo);
                } else {
                    const mensajeCorreo = document.getElementById("mensajeCorreo");
                    mensajeCorreo.textContent = "";
                    mensajeCorreo.dataset.valido = "false";
                }
            });

            document.getElementById("btnCrearReceta").addEventListener("click", enviarReceta);
        })
        .catch(error => {
            console.error("Error al cargar medicamentos:", error);
            resultadoDiv.innerHTML = `<p style="color:red;">Error al cargar medicamentos: ${error.message}</p>`;
        });

    function validarCorreoPaciente(correo) {
        const mensajeCorreo = document.getElementById("mensajeCorreo");

        axios.get(`http://localhost:9050/medicos/buscarPorCorreo?correo=${correo}`)
            .then(response => {
                const paciente = response.data;

                if (paciente) {
                    // Verificar si el paciente está asociado al médico
                    axios.get(`http://localhost:9050/medicos/VerMisPacientes/${numeroColegiado}`)
                        .then(pacientesAsociadosResponse => {
                            const pacientesAsociados = pacientesAsociadosResponse.data;
                            const pacienteAsociado = pacientesAsociados.find(p => p.usuario.correo === correo);

                            if (pacienteAsociado) {
                                mensajeCorreo.style.color = "green";
                                mensajeCorreo.textContent = "✔ Correo existe como paciente y está asociado al médico";
                                mensajeCorreo.dataset.valido = "true";
                            } else {
                                mensajeCorreo.style.color = "red";
                                mensajeCorreo.textContent = "Correo no asociado a este médico";
                                mensajeCorreo.dataset.valido = "false";
                            }
                        })
                        .catch(error => {
                            console.error("Error al obtener pacientes asociados:", error);
                            mensajeCorreo.style.color = "red";
                            mensajeCorreo.textContent = "Error al verificar la asociación con el médico";
                            mensajeCorreo.dataset.valido = "false";
                        });
                } else {
                    mensajeCorreo.style.color = "red";
                    mensajeCorreo.textContent = "Correo no asociado a un paciente";
                    mensajeCorreo.dataset.valido = "false";
                }
            })
            .catch(error => {
                console.error("Error al buscar paciente:", error);
                mensajeCorreo.style.color = "red";
                mensajeCorreo.textContent = "Error al verificar el correo";
                mensajeCorreo.dataset.valido = "false";
            });
    }

    function enviarReceta() {
        const mensajeCorreo = document.getElementById("mensajeCorreo");

        if (mensajeCorreo.dataset.valido !== "true") {
            document.getElementById("mensajeReceta").innerHTML = `<span style="color:red;">No se puede crear la receta. El correo no está asociado.</span>`;
            return;
        }

        const correoPaciente = document.getElementById("correo_paciente").value;

        axios.get(`http://localhost:9050/medicos/buscarPorCorreo?correo=${correoPaciente}`)
            .then(response => {
                const paciente = response.data;

                const recetaDto = {
                    paciente: paciente,
                    numeroColegiado: document.getElementById("numero_colegiado").value,
                    medicamento: {
                        idMedicamento: document.getElementById("id_medicamento").value
                    },
                    dosis: document.getElementById("dosis").value,
                    frecuencia: document.getElementById("frecuencia").value,
                    duracionTratamiento: document.getElementById("duracion_tratamiento").value,
                    caducidad: "Activa"
                };

                axios.post("http://localhost:9050/medicos/CrearReceta", recetaDto)
                    .then(res => {
                        document.getElementById("mensajeReceta").innerHTML = `<span style="color:green;">Receta creada correctamente</span>`;
                    })
                    .catch(err => {
                        document.getElementById("mensajeReceta").innerHTML =
                            `<span style="color:red;">Ya existe una receta para este medicamento. Si quieres crear una nueva receta, debes caducar la receta que está dada de alta.</span>`;
                        document.getElementById("mensajeReceta").innerHTML += 
                            `<br><button id="btnRedirigir" style="background-color: #f44336; color: white; padding: 10px 15px; border: none; cursor: pointer;" onclick="window.location.href='seccionpacientes.html';">Ir a Ver Mis Pacientes</button>`;
                    });
            })
            .catch(error => {
                document.getElementById("mensajeReceta").innerHTML = `<span style="color:red;">Paciente no encontrado</span>`;
                console.error("Error al buscar paciente:", error);
            });
    }
});
