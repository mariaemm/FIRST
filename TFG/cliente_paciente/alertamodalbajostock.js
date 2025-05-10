document.addEventListener("DOMContentLoaded", () => {
    const idPaciente = localStorage.getItem("idUsuario");

    if (!idPaciente) {
        console.error("Error: No se encontró el ID del paciente en localStorage.");
        return;
    }

    const modalBajoStock = document.getElementById("modalBajoStock");
    const contenidoBajoStock = document.getElementById("contenidoBajoStock");

    let huboAlerta = false;
    let mostrarMensajeFin = false;

    // Primera verificación
    verificarMedicamentosCliente();
    iniciarTemporizadorConsola(180); // Inicia el temporizador desde 180s

    // Verificar cada 3 minutos
    setInterval(() => {
        verificarMedicamentosCliente();
        iniciarTemporizadorConsola(180); // Reinicia cada 3 min
    }, 180000);

    function verificarMedicamentosCliente() {
        axios.get(`http://localhost:9050/pacientes/vermedicamentos/paciente/${idPaciente}`)
            .then(response => {
                const listaMedicamentos = response.data;
                if (!listaMedicamentos || listaMedicamentos.length === 0) return;

                let total = listaMedicamentos.length;
                let procesados = 0;
                huboAlerta = false;

                listaMedicamentos.forEach(med => {
                    verificarStockMedicamento(med.medicamento.idMedicamento, ++procesados === total);
                });
            })
            .catch(err => {
                console.error("Error al obtener medicamentos:", err);
            });
    }

    function verificarStockMedicamento(idMedicamento, esUltimo) {
        axios.post(`http://localhost:9050/pacientes/verificar-stock/${idPaciente}/${idMedicamento}`)
            .then(response => {
                const mensaje = response.data;

                if (mensaje.includes("alerta de bajostock")) {
                    huboAlerta = true;
                    mostrarModalBajoStock(idMedicamento, "El stock se ha comprobado correctamente. Tienes bajo stock. NECESITAS AGREGAR STOCK.");
                } else if (esUltimo && !huboAlerta) {
                    if (!mostrarMensajeFin) {
                        mostrarMensajeFin = true;
                        mostrarModalSinAlerta();
                    } else {
                        modalBajoStock.classList.remove("show");
                    }
                }
            })
            .catch(err => {
                console.error("Error al verificar stock:", err);
            });
    }

    function mostrarModalBajoStock(idMedicamento, mensaje) {
        const idAlerta = idMedicamento;

        contenidoBajoStock.innerHTML = `
            <p>${mensaje}</p>
            <button onclick="confirmarAlertaBajoStock(${idAlerta})" style="background-color: green; color: white; margin-right: 10px;">Ir</button>
            <button onclick="posponerAlertaBajoStock(${idAlerta})" style="background-color: orange; color: white;">Posponer</button>
        `;

        modalBajoStock.classList.add("show");
        mostrarMensajeFin = false; // Reinicia si hay alerta activa
    }

    function mostrarModalSinAlerta() {
        contenidoBajoStock.innerHTML = `
            <p>Ya no hay bajo stock en ningún medicamento.</p>
        `;
        modalBajoStock.classList.add("show");
        setTimeout(() => {
            modalBajoStock.classList.remove("show");
        }, 5000); // Oculta automáticamente después de 5 segundos
    }

    window.confirmarAlertaBajoStock = function(idAlerta) {
        axios.post(`http://localhost:9050/pacientes/confirmarAlertaBajoStock/${idAlerta}`)
            .then(() => {
                window.location.href = "mismedicamentos.html";
            });
    };

    window.posponerAlertaBajoStock = function(idAlerta) {
        axios.post(`http://localhost:9050/pacientes/posponerAlertaBajoStock/${idAlerta}`, {})
            .then(res => {
                alert(res.data);
                modalBajoStock.classList.remove("show");
            })
            .catch(err => {
                alert(err.response?.data || "Error al posponer");
                console.error(err);
            });
    };

    // ⏳ TEMPORIZADOR EN CONSOLA
    function iniciarTemporizadorConsola(segundos) {
        let tiempoRestante = segundos;

        const intervalId = setInterval(() => {
            console.log(`⏳ Tiempo restante para la próxima verificación: ${tiempoRestante} segundos`);
            tiempoRestante--;

            if (tiempoRestante < 0) {
                clearInterval(intervalId);
                console.log("🔄 Ejecutando nueva verificación de stock...");
            }
        }, 1000);
    }
});
