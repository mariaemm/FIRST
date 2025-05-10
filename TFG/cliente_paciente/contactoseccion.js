document.addEventListener("DOMContentLoaded", async function () {
    const correo = localStorage.getItem("correo");
    const idPaciente = localStorage.getItem("idUsuario");
    const mensaje = document.getElementById("mensaje");
    const tabla = document.getElementById("tabla-contactos");
    let relacionesEnumGlobal = [];

    if (!correo || !idPaciente) {
        mensaje.innerText = "No se encontró el correo o ID del usuario.";
        return;
    }

    // Obtener relaciones posibles para el select
    try {
        const resRelaciones = await axios.get("http://localhost:9050/pacientes/relacionesContactoEmergencia");
        relacionesEnumGlobal = resRelaciones.data;
        
    } catch (error) {
        console.error("Error al obtener relacionesEnum:", error);
        mensaje.innerText = "Error al cargar opciones de relación.";
        return;
    }

    // Obtener contactos
    try {
        const resContactos = await axios.get(`http://localhost:9050/pacientes/contacto-emergencia-por-paciente/${correo}`);
        const contactos = resContactos.data;

        tabla.innerHTML = ""; // Limpiar contenido previo

        if (contactos.length === 0) {
            mensaje.innerText = "No hay contactos de emergencia.";
            return;
        }

        contactos.forEach(contacto => {
            const fila = document.createElement("tr");

            // Crear select dinámico para relacionEnum
            const selectRelacion = document.createElement("select");
            relacionesEnumGlobal.forEach(rel => {
                const option = document.createElement("option");
                option.value = rel;
                option.text = rel.charAt(0) + rel.slice(1).toLowerCase();
                if (rel === contacto.relacionEnum) option.selected = true;
                selectRelacion.appendChild(option);
            });

            fila.innerHTML = `
                <td><input type="text" value="${contacto.nombre}" /></td>
                <td><input type="number" value="${contacto.telefono}" /></td>
                <td class="select-container"></td>
                <td><input type="text" value="${contacto.relacionEspecifica || ''}" /></td>
                <td><input type="text" value="${contacto.comentarios || ''}" /></td>
                <td><input type="text" value="${contacto.correo || ''}" /></td>
                <td>
                    <button class="btn-guardar" data-id="${contacto.idContacto}" ><div id="btnAgregar" class="btn-agregar">GUARDAR</div></button>
                    <button class="btn-eliminar" data-id="${contacto.idContacto}"><div class="eliminar-btn-miscuidadores">X</div></button>
                </td>
            `;

            fila.querySelector(".select-container").appendChild(selectRelacion);

            tabla.appendChild(fila);
        });

        // Guardar contacto
        document.querySelectorAll(".btn-guardar").forEach(button => {
            button.addEventListener("click", function () {
                const fila = this.closest("tr");
                const id = this.getAttribute("data-id");
                modificarContactoEnTabla(id, fila);
            });
        });

        // Eliminar contacto
        document.querySelectorAll(".btn-eliminar").forEach(button => {
            button.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                eliminarContacto(id);
            });
        });
    } catch (error) {
        console.error("Error al obtener los contactos de emergencia:", error);
        mensaje.innerText = "Error al cargar los contactos de emergencia.";
    }

    // Función para modificar
    function modificarContactoEnTabla(id, fila) {
        const celdas = fila.querySelectorAll("td");

        const contactoModificado = {
            idContacto: parseInt(id),
            nombre: celdas[0].querySelector("input").value,
            telefono: parseInt(celdas[1].querySelector("input").value),
            relacionEnum: celdas[2].querySelector("select").value,
            relacionEspecifica: celdas[3].querySelector("input").value,
            comentarios: celdas[4].querySelector("input").value,
            correo: celdas[5].querySelector("input").value,
            paciente: {
                idPaciente: parseInt(idPaciente)
            }
        };

        axios.put("http://localhost:9050/pacientes/modificar-contacto-emergencia", contactoModificado)
            .then(() => {
                alert("Contacto actualizado correctamente.");
            })
            .catch(error => {
                console.error("Error al modificar el contacto:", error);
                alert("Error al modificar el contacto.");
            });
    }

    // Función para eliminar
    function eliminarContacto(id) {
        // Primero, obtener el contacto completo
        const contactoAEliminar = {
            idContacto: parseInt(id),
            paciente: {
                idPaciente: parseInt(idPaciente)
            }
        };

        axios.delete("http://localhost:9050/pacientes/eliminar-contacto-emergencia", { data: contactoAEliminar })
            .then(() => {
                alert("Contacto eliminado con éxito.");
                location.reload(); // Recargar para actualizar la tabla
            })
            .catch(error => {
                console.error("Error al eliminar el contacto:", error);
                alert("Error al eliminar el contacto.");
            });
    }
});
