// seccionpacientes.js
document.addEventListener("DOMContentLoaded", function () {
    const baseURL = "http://localhost:9050/medicos";
    const pacientesContainer = document.getElementById("pacientes");

    function verMisPacientes() {
        const numeroColegiado = localStorage.getItem("idUsuario");

        if (!numeroColegiado) {
            pacientesContainer.innerHTML = "<p>No se encontró el número de colegiado. Asegúrate de iniciar sesión.</p>";
            return;
        }

        axios.get(`${baseURL}/VerMisPacientes/${numeroColegiado}`)
            .then(response => {
                if (response.data.length === 0) {
                    pacientesContainer.innerHTML = "<p>No hay pacientes asociados.</p>";
                    return;
                }

                let table = `<table border='1'>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Correo</th>
                        <th>ID</th>
                        <th>Historial</th>
                        <th>Recetas</th>
                    </tr>`;

                response.data.forEach(paciente => {
                    table += `
                    <tr>
                        <td>${paciente.usuario.nombre}</td>
                        <td>${paciente.usuario.apellido}</td>
                        <td>${paciente.usuario.correo}</td>
                        <td style="background-color: #D3D3D3;">${paciente.idPaciente}</td>
                        <td>
                            <button class="verHistorial" data-id="${paciente.idPaciente}" data-nombre="${paciente.usuario.nombre}">
                                Ver Historial
                            </button>
                        </td>
                        <td>
                            <button class="verRecetas" data-id="${paciente.idPaciente}" data-nombre="${paciente.usuario.nombre}">
                                Ver Recetas
                            </button>
                        </td>
                    </tr>`;
                });

                table += `</table>`;
                pacientesContainer.innerHTML = table;

                // Redirigir a seccionpacientesverlistas.html con datos en localStorage
                document.querySelectorAll(".verHistorial").forEach(button => {
                    button.addEventListener("click", function () {
                        const idPaciente = this.getAttribute("data-id");
                        const nombrePaciente = this.getAttribute("data-nombre");
                        localStorage.setItem("idPacienteSeleccionado", idPaciente);
                        localStorage.setItem("nombrePacienteSeleccionado", nombrePaciente);
                        localStorage.setItem("tipoVista", "historial");
                        window.location.href = "seccionpacientesverlistas.html";
                    });
                });

                document.querySelectorAll(".verRecetas").forEach(button => {
                    button.addEventListener("click", function () {
                        const idPaciente = this.getAttribute("data-id");
                        const nombrePaciente = this.getAttribute("data-nombre");
                        localStorage.setItem("idPacienteSeleccionado", idPaciente);
                        localStorage.setItem("nombrePacienteSeleccionado", nombrePaciente);
                        localStorage.setItem("tipoVista", "recetas");
                        window.location.href = "seccionpacientesverlistas.html";
                    });
                });
            })
            .catch(error => {
                pacientesContainer.innerHTML = "<p>Error al obtener los pacientes.</p>";
                console.error(error);
            });
    }

    verMisPacientes();
});
