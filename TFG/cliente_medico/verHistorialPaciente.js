// VerHistorialPaciente.js
const baseURL = "http://localhost:9050/medicos";
const historialContainer = document.getElementById("historial-pacientes");

function mostrarHistorialDePaciente(idPaciente, nombrePaciente) {
    historialContainer.innerHTML = `<h3>Historial de ${nombrePaciente}</h3><p>Cargando...</p>`;

    axios.get(`${baseURL}/VerHistorialDeMisPacientes/${idPaciente}`)
        .then(response => {
            const historial = response.data;

            if (!historial || historial.length === 0) {
                historialContainer.innerHTML = `<h3>Historial de ${nombrePaciente}</h3><p>No hay historial de tomas disponible.</p>`;
                return;
            }

            historial.sort((a, b) => new Date(b.fechaHoraToma) - new Date(a.fechaHoraToma));

            // Primero pedimos los estados disponibles para el filtro
            axios.get("http://localhost:9050/medicos/estadoBuscador")
                .then(enumResponse => {
                    const estados = enumResponse.data;
                    let opcionesEstado = `<option value="">Todos</option>`;
                    estados.forEach(estado => {
                        opcionesEstado += `<option value="${estado}">${estado.replace("_", " ")}</option>`;
                    });

                    let html = `
                        <h3>Historial de ${nombrePaciente}</h3>
                        <div style="margin-bottom: 1rem;" id="filtros-historial">
                            <label for="filtro-desde">Desde:</label>
                            <input type="date" id="filtro-desde">

                            <label for="filtro-hasta">Hasta:</label>
                            <input type="date" id="filtro-hasta">

                            <label for="filtro-estado">Estado:</label>
                            <select id="filtro-estado">${opcionesEstado}</select>

                            <label for="filtro-medicamento">Medicamento:</label>
                            <input type="text" id="filtro-medicamento" placeholder="Nombre del medicamento...">

                            <button id="btn-filtrar">Filtrar</button>
                        </div>
                        <div id="tabla-historial"></div>
                    `;

                    historialContainer.innerHTML = html;
                    renderTabla(historial);

                    document.getElementById("btn-filtrar").addEventListener("click", () => {
                        aplicarFiltros(historial);
                    });

                })
                .catch(err => {
                    console.error("Error al cargar los estados:", err);
                    historialContainer.innerHTML = "<p>Error al cargar los estados del historial.</p>";
                });

        })
        .catch(error => {
            historialContainer.innerHTML = "<p>Error al cargar el historial.</p>";
            console.error(error);
        });
}

function renderTabla(historial) {
    const tbody = historial.map(toma => {
        const fechaHora = new Date(toma.fechaHoraToma);
        const fecha = fechaHora.toLocaleDateString();
        const hora = fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const estado = toma.alerta?.estadoAlerta || "Sin estado";
        const medicamento = toma.alerta?.medicamento?.nombreMedicamento || "Sin medicamento";

        const estadoHTML = estado === "confirmado"
            ? `<td style="color: green;">${estado}</td>`
            : `<td>${estado}</td>`;

        return `
            <tr>
                <td>${fecha} ${hora}</td>
                ${estadoHTML}
                <td>${medicamento}</td>
            </tr>`;
    }).join("");

    document.getElementById("tabla-historial").innerHTML = `
        <table border="1">
            <thead>
                <tr>
                    <th>Fecha y Hora</th>
                    <th>Estado</th>
                    <th>Medicamento</th>
                </tr>
            </thead>
            <tbody>${tbody}</tbody>
        </table>`;
}

function aplicarFiltros(historial) {
    const desde = document.getElementById("filtro-desde").value;
    const hasta = document.getElementById("filtro-hasta").value;
    const estado = document.getElementById("filtro-estado").value.toLowerCase();
    const medicamento = document.getElementById("filtro-medicamento").value.toLowerCase();

    const filtrado = historial.filter(toma => {
        const fecha = new Date(toma.fechaHoraToma);
        const estadoActual = toma.alerta?.estadoAlerta?.toLowerCase() || "";
        const nombreMedicamento = toma.alerta?.medicamento?.nombreMedicamento?.toLowerCase() || "";

        const cumpleFechaDesde = !desde || fecha >= new Date(desde);
        const cumpleFechaHasta = !hasta || fecha <= new Date(hasta);
        const cumpleEstado = !estado || estadoActual === estado;
        const cumpleMedicamento = !medicamento || nombreMedicamento.includes(medicamento);

        return cumpleFechaDesde && cumpleFechaHasta && cumpleEstado && cumpleMedicamento;
    });

    renderTabla(filtrado);
}
