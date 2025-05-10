document.addEventListener("DOMContentLoaded", function () {
    const idPaciente = localStorage.getItem("idUsuario");
    if (!idPaciente) {
        console.error("Error: No se encontró el ID del paciente en localStorage.");
        return;  // Detener la ejecución si no se encuentra el idPaciente
    }
  
    const tablaBody = document.querySelector("#tablaMedicamentosPaciente tbody");  // Referencia al tbody de la tabla

    // Cargar los medicamentos al cargar la página
    function cargarMisMedicamentos() {
        const url = `http://localhost:9050/pacientes/VerMisMedicamentos/paciente/${idPaciente}`;

        axios.get(url)
            .then(response => {
                const medicamentos = response.data;

                // Limpiar el contenido actual de la tabla
                tablaBody.innerHTML = "";

                if (!medicamentos || medicamentos.length === 0) {
                    const row = document.createElement("tr");
                    const td = document.createElement("td");
                    td.setAttribute("colspan", "4");
                    td.textContent = "No tienes medicamentos registrados.";
                    row.appendChild(td);
                    tablaBody.appendChild(row);
                    return;
                }

                // Crear filas de la tabla para cada medicamento
                medicamentos.forEach(item => {
                    const row = document.createElement("tr");

                    // Columna del nombre del medicamento
                    const nombreTd = document.createElement("td");
                    nombreTd.textContent = item.medicamento.nombreMedicamento;
                    row.appendChild(nombreTd);

                    // Columna de la cantidad disponible
                    const cantidadTd = document.createElement("td");
                    cantidadTd.setAttribute("id", `cantidad-${item.medicamento.idMedicamento}`);
                    cantidadTd.textContent = item.cantidadDisponible;
                    row.appendChild(cantidadTd);

                    // Columna de acciones (para agregar stock)
                    const accionesTd = document.createElement("td");

                    const input = document.createElement("input");
                    input.setAttribute("type", "number");
                    input.setAttribute("min", "1");
                    input.setAttribute("value", "1");
                    input.setAttribute("id", `input-${item.medicamento.idMedicamento}`);
                    input.style.width = "50px";

                    const button = document.createElement("button");
                    button.textContent = "Agregar Stock";
                    button.onclick = function() {
                        agregarStock(idPaciente, item.medicamento.idMedicamento);
                    };

                    accionesTd.appendChild(input);
                    accionesTd.appendChild(button);
                    row.appendChild(accionesTd);

                    // Añadir la fila creada al cuerpo de la tabla
                    tablaBody.appendChild(row);
                });
            })
            .catch(error => {
                tablaBody.innerHTML = "<tr><td colspan='4'>Error al cargar tus medicamentos.</td></tr>";
                console.error("Error al obtener medicamentos del paciente:", error);
            });
    }

    cargarMisMedicamentos();  // Cargar los medicamentos cuando la página se cargue

    // Función para agregar stock de un medicamento
    window.agregarStock = function(idPaciente, idMedicamento) {
        const input = document.getElementById(`input-${idMedicamento}`);
        const cantidadCajas = parseInt(input.value);
    
        if (isNaN(cantidadCajas) || cantidadCajas <= 0) {
            alert("Ingresa una cantidad válida.");
            return;
        }
    
        const url = `http://localhost:9050/pacientes/${idPaciente}/medicamentos/${idMedicamento}/agregar-stock?cantidadCajas=${cantidadCajas}`;
    
        axios.post(url)
            .then(response => {
                alert(response.data);  // Stock agregado correctamente
    
                // Recargar stock actualizado
                return axios.get(`http://localhost:9050/pacientes/vermedicamentos/paciente/${idPaciente}`);
            })
            .then(res => {
                const listaMedicamentos = res.data;
                const actualizado = listaMedicamentos.find(med => med.medicamento.idMedicamento === idMedicamento);
                if (!actualizado) return;
    
                const cantidadCell = document.getElementById(`cantidad-${idMedicamento}`);
                cantidadCell.textContent = actualizado.cantidadDisponible;
                input.value = "1";  // Reset input
            })
            .catch(error => {
                if (error.response && error.response.status === 304) {
                    alert("Ya hay suficiente stock, no es necesario agregar más.");
                } else {
                    alert("Error al agregar stock.");
                    console.error(error);
                }
            });
    };   
    
}); 
