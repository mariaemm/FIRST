const baseURL = "http://localhost:9050/medicos";
const resultadoDiv = document.getElementById("resultado");

// Función para ver los pacientes de un médico
function verMisPacientes() {
    const numeroColegiado = prompt("Ingrese su número de colegiado:");
    axios.get(`${baseURL}/VerMisPacientes/${numeroColegiado}`)
        .then(response => {
            if (response.data.length === 0) {
                resultadoDiv.innerHTML = "<p>No hay pacientes asociados.</p>";
                return;
            }

            let table = `<table border='1'><tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo</th></tr>`;
            response.data.forEach(paciente => {
                table += `<tr>
                    <td>${paciente.nombre}</td>
                    <td>${paciente.apellido}</td>
                    <td>${paciente.correo}</td>
                </tr>`;
            });
            table += `</table>`;
            resultadoDiv.innerHTML = table;
        })
        .catch(error => {
            resultadoDiv.innerHTML = "<p>Error al obtener los pacientes.</p>";
            console.error(error);
        });
}

// Función para mostrar el pop-up de asociación de paciente
function asociarPaciente() {
    resultadoDiv.innerHTML = `
        <div id="popup" class="popup">
            <h3>Asociar Paciente</h3>
            <label>Número de Colegiado:</label>
            <input type="text" id="numeroColegiado"><br>
            <label>Correo del Paciente:</label>
            <input type="text" id="correoPaciente"><br>
            <button onclick="enviarAsociacion()">Dar de Alta a Paciente</button>
            <button onclick="cerrarPopup()">Cancelar</button>
            <p id="mensajeAsociacion"></p>
        </div>
    `;
}

// Función para enviar la asociación de paciente
function enviarAsociacion() {
    const numeroColegiado = document.getElementById("numeroColegiado").value;
    const correo = document.getElementById("correoPaciente").value;

    axios.post(`${baseURL}/asociarPaciente/${numeroColegiado}?correo=${correo}`)
        .then(response => {
            document.getElementById("mensajeAsociacion").innerHTML = `<p style="color: green;">Éxito: ${response.data}</p>`;
        })
        .catch(error => {
            document.getElementById("mensajeAsociacion").innerHTML = `<p style="color: red;">Error al asociar paciente.</p>`;
            console.error(error);
        });
}

// Función para cerrar el pop-up
function cerrarPopup() {
    document.getElementById("popup").remove();
}

// Función para mostrar el formulario de creación de receta
function crearReceta() {
    resultadoDiv.innerHTML = `
        <div id="crearRecetaDiv">
            <h3>Crear Receta</h3>
            <label>ID Paciente:</label><input type="text" id="id_paciente"><br>
            <label>Número Colegiado:</label><input type="text" id="numero_colegiado"><br>
            <label>ID Medicamento:</label><input type="text" id="id_medicamento"><br>
            <label>Dosis:</label><input type="text" id="dosis"><br>
            <label>Frecuencia (veces al día):</label><input type="text" id="frecuencia"><br>
            <label>Duración del Tratamiento (días):</label><input type="text" id="duracion_tratamiento"><br>
            <label>Estado de la Receta:</label>
            <select id="caducidad">
                <option value="Activa">Activa</option>
                <option value="Caducada">Caducada</option>
            </select><br>
            <button onclick="enviarReceta()">Aceptar</button>
            <p id="mensajeReceta"></p>
        </div>
    `;
}

// Función para enviar la receta
function enviarReceta() {
    const receta = {
        id_paciente: document.getElementById("id_paciente").value,
        numero_colegiado: document.getElementById("numero_colegiado").value,
        id_medicamento: document.getElementById("id_medicamento").value,
        dosis: document.getElementById("dosis").value,
        frecuencia: document.getElementById("frecuencia").value,
        duracion_tratamiento: document.getElementById("duracion_tratamiento").value,
        caducidad: document.getElementById("caducidad").value
    };

    axios.post(`${baseURL}/CrearReceta`, receta)
        .then(response => {
            document.getElementById("mensajeReceta").innerHTML = `<p style="color: green;">Éxito: ${response.data}</p>`;
        })
        .catch(error => {
            document.getElementById("mensajeReceta").innerHTML = `<p style="color: red;">Error al crear la receta.</p>`;
            console.error(error);
        });
}
