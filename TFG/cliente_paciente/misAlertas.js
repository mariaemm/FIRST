
document.addEventListener("DOMContentLoaded", function () {
    const alertasContainer = document.getElementById("mis-alertas-medicas");

    // ---------- INICIO TRANSFORMACIÓN DE FECHA ----------
    function obtenerFechaYHoraFormateada(fechaStr) {
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

        const fecha = new Date(fechaStr);
        const diaSemana = dias[fecha.getDay()];
        const dia = fecha.getDate();
        const mes = meses[fecha.getMonth()];
        const año = fecha.getFullYear();
        const hora = fecha.getHours().toString().padStart(2, '0');
        const minutos = fecha.getMinutes().toString().padStart(2, '0');

        const fechaTexto = `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} ${dia} de ${mes} de ${año}`;
        const horaTexto = `${hora}:${minutos}`;

        const claveAgrupacion = `${año}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

        return {
            fechaTexto,
            horaTexto,
            claveAgrupacion
        };
    }
    // ---------- FIN TRANSFORMACIÓN DE FECHA ----------

    const idPaciente = localStorage.getItem("idUsuario");

    if (!idPaciente) {
        alertasContainer.innerHTML = "<p>Error: No se encontró el ID del paciente en localStorage.</p>";
        return;
    }

    const url = `http://localhost:9050/pacientes/VermisAlertas/${idPaciente}`;

    axios.get(url)
        .then(res => {

            //const alertas = res.data; // DATOS DE LAS ALERTAS
            //console.log("data", res.data);
           // console.log("alertas",alertas); // Verifica los datos que estás recibiendo

            let alertas = res.data;


            if (!alertas || alertas.length === 0) {
                alertasContainer.innerHTML = "<p>No hay alertas disponibles.</p>";
                return;
            }

            // Filtrar solo alertas futuras
            const ahora = new Date();
            alertas = alertas
                .map(alerta => ({
                    ...alerta,
                    fechaHoraDate: new Date(alerta.fechaHoraAlerta)
                }))
                .filter(alerta => alerta.fechaHoraDate >= ahora)
                .sort((a, b) => a.fechaHoraDate - b.fechaHoraDate); // Ordenar por fecha ascendente

            if (alertas.length === 0) {
                alertasContainer.innerHTML = "<p>No hay próximas alertas médicas.</p>";
                return;
            }

            const alertasAgrupadas = {};

            alertas.forEach(alerta => {
                const { fechaTexto, horaTexto, claveAgrupacion } = obtenerFechaYHoraFormateada(alerta.fechaHoraAlerta);
                if (!alertasAgrupadas[claveAgrupacion]) {
                    alertasAgrupadas[claveAgrupacion] = {
                        fechaTexto,
                        alertas: []
                    };
                }
                alertasAgrupadas[claveAgrupacion].alertas.push({
                    ...alerta,
                    horaTexto
                });
            });

            const tabla = document.createElement("table");
            tabla.innerHTML = `
                <thead>
                    <tr>
                        <th>Fecha y Hora</th>
                        <th>Estado</th>
                        <th>Tipo de Alerta</th>
                        <th>Medicamento</th>
                        <th>Cantidad por Unidad de cada caja/blister/frasco</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            const cuerpoTabla = tabla.querySelector("tbody");

            for (const clave in alertasAgrupadas) {
                const grupo = alertasAgrupadas[clave];

                // Fila de fecha
                const filaTitulo = document.createElement("tr");
                filaTitulo.innerHTML = `<td colspan="6" style="background-color: white; font-weight: bold; padding: 10px;">${grupo.fechaTexto}</td>`;
                cuerpoTabla.appendChild(filaTitulo);

                grupo.alertas.forEach(alerta => {
                    const fila = document.createElement("tr");

                    const nombreMedicamento = alerta.medicamento ? alerta.medicamento.nombreMedicamento : 'No disponible';
                    const cantidadUnidad = alerta.medicamento ? alerta.medicamento.cantidadUnidad : 'No disponible';
                    const idMedicamento = alerta.medicamento ? alerta.medicamento.idMedicamento : null;

                    const estadoAlerta = alerta.estadoAlerta === 'sinConfirmar'
                        ? `<span style="color: red; font-weight: bold;">Sin Confirmar</span>`
                        : alerta.estadoAlerta === 'confirmado'
                        ? `<span style="color: green; font-weight: bold;">Confirmado</span>`
                        : `<span>${alerta.estadoAlerta}</span>`;

                    fila.innerHTML = `
                        <td><strong>${alerta.horaTexto}</strong></td>
                        <td>${estadoAlerta}</td>
                        <td>${alerta.tipoAlerta}</td>
                        <td><strong>${nombreMedicamento}</strong></td>
                        <td>${cantidadUnidad === 20 ? '20' : cantidadUnidad}</td>
                    `;

                    const celdaAccion = document.createElement("td");
                    if (idMedicamento) {
                        const urlCantidad = `http://localhost:9050/pacientes/VerCantidadDeMisMedicamentos/pacientes/${idPaciente}/medicamentos/${idMedicamento}`;

                        axios.get(urlCantidad)
                            .then(response => {
                                const stock = response.data ? response.data.cantidadDisponible : "No disponible";
                                celdaAccion.innerHTML = `<span style="font-weight: bold; color: orange;">${stock} unidades</span>`;
                            })
                            .catch(error => {
                                console.error("Error al obtener la cantidad:", error);
                                celdaAccion.innerHTML = `<span style="color: red; font-weight: bold;">Error al obtener</span>`;
                            });
                    } else {
                        celdaAccion.innerHTML = `<span style="color: red; font-weight: bold;">ID inválido</span>`;
                    }

                    fila.appendChild(celdaAccion);
                    cuerpoTabla.appendChild(fila);
                });
            }

            alertasContainer.appendChild(tabla);
        })
        .catch(err => {
            console.error("Hubo un fallo en la petición: " + err);
            alertasContainer.innerHTML = "<p>Error al cargar las alertas.</p>";
        });
});

