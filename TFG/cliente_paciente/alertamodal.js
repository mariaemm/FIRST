document.addEventListener("DOMContentLoaded", function () {
    const idPaciente = localStorage.getItem("idUsuario");
    const modal = document.getElementById("modalalerta");
    const modalContent = modal.querySelector("p");
    const openModalBtn = document.getElementById("openModalBtn");
    let ultimaAlerta = null;
    let intervaloActualizacion = null;

    if (!idPaciente) {
        console.error("No se encontró el ID del paciente.");
        return;
    }

    const url = `http://localhost:9050/pacientes/VermisAlertas/${idPaciente}`;

    function mostrarModal(alertaProxima = null) {
        if (!alertaProxima) {
            modalContent.innerHTML = "No hay alertas médicas activas en este momento.";
            modal.style.display = "flex";
            return;
        }

        const fechaProx = new Date(alertaProxima.fechaHoraAlerta);
        const nombreProx = alertaProxima.medicamento?.nombreMedicamento || "No disponible";
        const cantidadUnidad = alertaProxima.medicamento?.cantidadUnidad || "No disponible";
        const esSinConfirmar = alertaProxima.estadoAlerta === "sinConfirmar";
        const { fechaTexto, horaTexto } = obtenerFechaYHoraFormateada(alertaProxima.fechaHoraAlerta);
        const horaConfirmada = alertaProxima.horaConfirmacion ? new Date(alertaProxima.horaConfirmacion).toLocaleTimeString() : null;

        const tiempoRestante = fechaProx - new Date();
        const puedeConfirmar = tiempoRestante <= 10 * 60 * 1000;

        let contenido = `
            <table style="width: 100%; text-align: center; border-collapse: collapse;" class="tabla-alerta-modal">
                <tr>
                    <td colspan="2" style="font-size: 18px; color: #84CBF1; font-weight: bold; padding: 10px; border-bottom: 1px solid rgb(0, 0, 0);">${fechaTexto}</td>
                </tr>
                <tr>
                    <td style="font-weight: normal; padding: 10px; text-align: right;">Medicamento:</td>
                    <td style="font-weight: bold; padding: 10px; text-align: left;">${nombreProx}</td>
                </tr>
                <tr>
                    <td style="font-weight: normal; padding: 10px; text-align: right;">Estado:</td>
                    <td id="estadoAlerta" style="color: ${alertaProxima.estadoAlerta === "Confirmada" ? 'yellow' : (esSinConfirmar ? 'red' : 'green')}; padding: 5px; text-align: left;">${alertaProxima.estadoAlerta}</td>
                </tr>
                <tr>
                    <td style="font-weight: normal; padding: 10px; text-align: right;">Hora de la toma:</td>
                    <td style="padding: 5px; text-align: left;"><strong>${horaTexto}</strong></td>
                </tr>
                ${horaConfirmada ? `
                <tr>
                    <td style="font-weight: normal; padding: 10px; text-align: right;">Hora de confirmación:</td>
                    <td style="padding: 5px; text-align: left;"><strong>${horaConfirmada}</strong></td>
                </tr>` : ''}
                <tr>
                    <td style="font-weight: normal; padding: 10px; text-align: right;">Cantidad por unidad:</td>
                    <td style="padding: 5px; text-align: left;">${cantidadUnidad}</td>
                </tr>

                <tr>
                    <td style="font-weight: normal; padding: 10px; text-align: right;">Acción(mi stock actual):</td>
                    <td id="cantidad-stock" style="padding: 10px; text-align: left;">Cargando...</td>
                </tr>
                <tr>
                    <td colspan="2" style="padding: 20px;">
                        ${esSinConfirmar ? `
                        <button id="confirmarAlertaBtn"
                            style="
                                background-color: ${puedeConfirmar ? 'green' : '#ccc'};
                                color: ${puedeConfirmar ? 'white' : '#666'};
                                border-radius: 5px;
                                padding: 12px 25px;
                                border: none;
                                cursor: ${puedeConfirmar ? 'pointer' : 'not-allowed'};
                            "
                            class="confirmar-alerta-btn"
                            ${!puedeConfirmar ? 'disabled' : ''}
                        >Confirmar Toma</button>
                        ${!puedeConfirmar ? `
                        <p style="color: #999; font-style: italic; margin-top: 10px;">
                            El botón se habilitará cuando queden 10 minutos antes de la hora de la toma.
                        </p>` : ''}
                        ` : `<strong>YA CONFIRMASTE LA TOMA</strong>`}
                    </td>
                </tr>
            </table>
            <p id="mensajeConfirmacion" style="margin-top:10px;"></p>
        `;

        modalContent.innerHTML = contenido;
        modal.style.display = "flex";

        if (esSinConfirmar && puedeConfirmar) {
            const btnConfirmar = document.getElementById("confirmarAlertaBtn");
            const mensaje = document.getElementById("mensajeConfirmacion");

            btnConfirmar.addEventListener("click", function () {
                const urlConfirmar = `http://localhost:9050/pacientes/aceptarToma/${alertaProxima.idAlerta}`;

                axios.post(urlConfirmar)
                    .then(res => {
                        const horaConfirmada = new Date().toLocaleTimeString();
                        mensaje.textContent = `✅ La toma fue confirmada a las ${horaConfirmada}.`;
                        mensaje.style.color = "green";

                        document.getElementById("estadoAlerta").textContent = "Confirmada";
                        btnConfirmar.remove();

                        alertaProxima.estadoAlerta = "Confirmada";
                        alertaProxima.horaConfirmacion = new Date().toISOString();

                        ultimaAlerta.estadoAlerta = "Confirmada";
                        ultimaAlerta.horaConfirmacion = alertaProxima.horaConfirmacion;

                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    })
                    .catch(err => {
                        alert("Hubo un error al confirmar la toma.");
                        console.error(err);
                    });
            });
        }

        if (puedeConfirmar) {
            if (intervaloActualizacion) {
                clearInterval(intervaloActualizacion);
            }

            intervaloActualizacion = setInterval(() => {
                mostrarModal(alertaProxima);
                actualizarCantidadStock(alertaProxima);
            }, 60000);
        } else {
            clearInterval(intervaloActualizacion);
        }

        actualizarCantidadStock(alertaProxima);
    }

    function actualizarCantidadStock(alertaProxima) {
        if (alertaProxima.medicamento && alertaProxima.medicamento.idMedicamento) {
            const urlCantidad = `http://localhost:9050/pacientes/VerCantidadDeMisMedicamentos/pacientes/${idPaciente}/medicamentos/${alertaProxima.medicamento.idMedicamento}`;
            axios.get(urlCantidad)
                .then(response => {
                    const stock = response.data ? response.data.cantidadDisponible : "No disponible";
                    document.getElementById("cantidad-stock").innerHTML = `<span style="font-weight: bold; color: orange;">${stock} unidades disponibles</span>`;
                })
                .catch(error => {
                    console.error("Error al obtener la cantidad:", error);
                    document.getElementById("cantidad-stock").innerHTML = `<span style="color: red; font-weight: bold;">Error al obtener</span>`;
                });
        } else {
            document.getElementById("cantidad-stock").innerHTML = "<span style='color: red;'>ID de medicamento no válido</span>";
        }
    }

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

        return { fechaTexto, horaTexto };
    }

    function verificarAlertas() {
        axios.get(url)
            .then(res => {
                const alertas = res.data;
                console.log(alertas)
                const ahora = new Date();

                const alertasFuturas = alertas.filter(alerta => {
                    const fechaAlerta = new Date(alerta.fechaHoraAlerta);
                    return fechaAlerta > ahora;
                });

                const alertaProxima = alertasFuturas.sort((a, b) =>
                    new Date(a.fechaHoraAlerta) - new Date(b.fechaHoraAlerta)
                )[0];

                if (alertaProxima) {
                    ultimaAlerta = alertaProxima;

                    if (!modal.classList.contains("yaMostrada")) {
                        modal.classList.add("yaMostrada");
                        mostrarModal(alertaProxima);
                    }

                    mostrarModal(alertaProxima);
                }
            })
            .catch(error => {
                console.error("Error al obtener alertas médicas:", error);
            });
    }

    verificarAlertas();
    setInterval(verificarAlertas, 60000);

    openModalBtn.addEventListener("click", function () {
        if (ultimaAlerta) {
            mostrarModal(ultimaAlerta);
        } else {
            modalContent.innerHTML = "No hay alertas médicas activas en este momento.";
            modal.style.display = "flex";
        }
    });

    document.getElementById("closeModalBtn").addEventListener("click", function () {
        modal.style.display = "none";
        clearInterval(intervaloActualizacion);
    });
});
