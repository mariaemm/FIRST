// obtenerMedicamentoPorCodigo.js
document.addEventListener("DOMContentLoaded", function () {
    const medicamentoContainer = document.getElementById("informacionMedicamento");

    document.getElementById("btnBuscarMedicamento").addEventListener("click", function () {
        const codigoMedicamento = document.getElementById("codigoMedicamento").value;

        axios.get(`http://localhost:9050/medicos/BuscarUnMedicamento/${codigoMedicamento}`)
            .then(response => {
                if (response.data) {
                    medicamentoContainer.innerHTML = `
                        <h3>Medicamento encontrado:</h3>
                        <p>Nombre: ${response.data.nombreMedicamento}</p>
                        <p>Descripción: ${response.data.descripcion}</p>
                    `;
                } else {
                    medicamentoContainer.innerHTML = "<p>No se encontró el medicamento.</p>";
                }
            })
            .catch(error => {
                medicamentoContainer.innerHTML = "<p>Error al obtener el medicamento.</p>";
                console.error(error);
            });
    });
});
