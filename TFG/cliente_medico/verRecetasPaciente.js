const recetasContainer = document.getElementById("historial-pacientes");

function verRecetasDePaciente(idPaciente, nombrePaciente) {
    const numeroColegiado = localStorage.getItem("idUsuario");
    if (!numeroColegiado) {
        recetasContainer.innerHTML = "<p>Error: no se encontró el número de colegiado.</p>";
        return;
    }

    recetasContainer.innerHTML = `<h3>Recetas de ${nombrePaciente}</h3><p>Cargando...</p>`;

    //axios.get(`http://localhost:9050/medicos/VerRecetasDeMisPacientes/paciente/${idPaciente}/medico/${numeroColegiado}`)
    axios.get(`http://localhost:9050/pacientes/VerMisRecetas/${idPaciente}`)
    

        .then(response => {
            const recetas = response.data;
            console.log(recetas);

            if (!recetas || recetas.length === 0) {
                recetasContainer.innerHTML = `<h3>Recetas de ${nombrePaciente}</h3><p>No hay recetas disponibles.</p>`;
                return;
            }

            let tabla = `<table border="1">
                <thead>
                    <tr>
                        <th>Fecha de Inicio</th>
                        <th>Medicamento</th>
                        <th>Dosis(cantidad ml o mg)</th>
                        <th>Frecuencia (h)</th>
                        <th>Duración (días)</th>
                        <th>Estado</th>
                         <th>Medico</th>
                          <th>especialidad del Medico</th>
                           <th>email de Medico</th>
                        <th>Acción</th> <!-- Nueva columna para el botón -->
                    </tr>
                </thead>
                <tbody>`;

            recetas.forEach(receta => {
                const fecha = new Date(receta.fechaInicio).toLocaleString();
                const medicamento = receta.medicamento?.nombreMedicamento || "Sin medicamento";
                const dosis = receta.dosis ?? "No especificada";
                const frecuencia = receta.frecuencia ?? "No especificada";
                const duracion = receta.duracionTratamiento ?? "No especificada";
                const estado = receta.caducidad ?? "Desconocido";
                const medico = receta.medico.usuario.nombre ?? "Desconocido";
                const especialidad = receta.medico.especialidad ?? "Desconocido";
                const emailMedico = receta.medico.usuario.correo ?? "Desconocido";


                // Verificar si la receta tiene alertas pendientes
                const tieneAlertasPendientes = receta.alertas && receta.alertas.some(alerta => alerta.estado === 'sinConfirmar');

                // Agregar el botón de caducar solo si no hay alertas pendientes
                const caducarButton = estado !== "Caducada" && !tieneAlertasPendientes ? 
                    `<button class="btnCaducar" data-id="${receta.idReceta}">Caducar</button>` : 
                    `<span>${estado === "Caducada" ? "Receta caducada" : "Tiene alertas pendientes"}</span>`;

                tabla += `
                    <tr>
                        <td>${fecha}</td>
                        <td>${medicamento}</td>
                        <td>${dosis}</td>
                        <td>${frecuencia}</td>
                        <td>${duracion}</td>
                        <td id="estado_${receta.idReceta}">${estado}</td>
                         <td>${medico}</td>
                         <td>${especialidad}</td>
                         <td>${emailMedico}</td>
                        <td>${caducarButton}</td>
                    </tr>`;
            });

            tabla += `</tbody></table>`;
            recetasContainer.innerHTML = `<h3>Recetas de ${nombrePaciente}</h3>${tabla}`;

            // Asignar el evento a cada botón de caducar
            document.querySelectorAll(".btnCaducar").forEach(button => {
                button.addEventListener("click", function() {
                    const idReceta = this.getAttribute("data-id");
                    caducarReceta(idReceta);
                });
            });

        })
        .catch(error => {
            recetasContainer.innerHTML = "<p>Error al cargar las recetas.</p>";
            console.error(error);
        });
}

// Función para caducar la receta
function caducarReceta(idReceta) {
    axios.post(`http://localhost:9050/medicos/CaducarReceta/${idReceta}`)
        .then(response => {
            // Si la respuesta es exitosa, actualizamos el estado en la tabla
            if (response.status === 200) {
                // Actualizar el estado de la receta a "Caducada" en la tabla
                const estadoCell = document.getElementById(`estado_${idReceta}`);
                estadoCell.textContent = "Caducada";

                // Deshabilitar el botón después de caducar
                const button = document.querySelector(`button[data-id='${idReceta}']`);
                button.disabled = true;

                // Mostrar mensaje de éxito
                alert("Receta caducada correctamente");
            }
        })
        .catch(error => {
            console.error("Error al caducar la receta:", error);
            alert("Error al caducar la receta.");
        });
}
