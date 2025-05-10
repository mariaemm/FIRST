document.addEventListener("DOMContentLoaded", function () {
    const recetasContainer = document.getElementById("axios");
    const fragment = document.createDocumentFragment();
    const idPaciente = localStorage.getItem("idUsuario");

    if (!idPaciente) {
        recetasContainer.innerHTML = "<p>Error: No se encontró el ID del paciente en localStorage.</p>";
        return;
    }

    const url = `http://localhost:9050/pacientes/VerMisRecetas/${idPaciente}`;

    axios.get(url)
        .then(res => {
            const recetas = res.data;
            console.log(recetas);

            if (recetas.length === 0) {
                const mensaje = document.createElement("p");
                mensaje.textContent = "No se encontraron recetas.";
                recetasContainer.appendChild(mensaje);
            } else {
                const div = document.createElement("div");
                div.classList.add("recetas-container");

                recetas.forEach(receta => {
                    const recetaDiv = document.createElement("div");
                    recetaDiv.classList.add("receta-item");

                    // Determinar color según valor de caducidad
                    const caducidadTexto = receta.caducidad?.toUpperCase() || "DESCONOCIDO";
                    const colorCaducidad = caducidadTexto === "ACTIVA" ? "green" :
                                           caducidadTexto === "CADUCADA" ? "red" : "black";

                    recetaDiv.innerHTML = `
                        <h3>Receta ID: ${receta.idReceta}</h3>
                        <strong>Medicación:</strong> ${receta.medicamento.nombreMedicamento} <br>
                        <strong>Fecha de Inicio de la Receta:</strong> ${receta.fechaInicio} <br>
                        <strong>Diagnóstico:</strong> ${receta.paciente.diagnostico} <br>
                        <strong>Duración del Tratamiento:</strong> ${receta.duracionTratamiento} días <br>
                        <strong>Dosis:</strong> ${receta.dosis} ${receta.medicamento.nombreMedicamento.split(" ").slice(-1)[0]} <br>

                        <strong>Frecuencia:</strong> ${receta.frecuencia} hora <br>
                        <strong>Estado de la Receta:</strong>    <hr>
                        <span style="color: ${colorCaducidad}; font-weight: bold;">
                            ${caducidadTexto}
                        </span>
                     
                    `;

                    div.appendChild(recetaDiv);
                });

                fragment.appendChild(div);
            }

            recetasContainer.appendChild(fragment);
        })
        .catch(err => {
            console.error("Hubo un fallo en la petición: " + err);
            const mensaje = document.createElement("p");
            mensaje.textContent = "Hubo un error al cargar las recetas.";
            recetasContainer.appendChild(mensaje);
        });
});
