document.addEventListener("DOMContentLoaded", function () {
    // OBTENEMOS EL CONTENEDOR DONDE MOSTRAREMOS EL PERFIL
    const perfilContainer = document.getElementById("mi-perfil");
    const fragment = document.createDocumentFragment();

    // OBTENER EL idPaciente DESDE localStorage
    const idPaciente = localStorage.getItem("idUsuario");

    // VALIDAR QUE EL idPaciente EXISTA
    if (!idPaciente) {
        perfilContainer.innerHTML = "<p>Error: No se encontró el ID del paciente en localStorage.</p>";
        return;
    }

    // Construir la URL con el idPaciente
    const url = `http://localhost:9050/pacientes/VerMiPerfilPaciente/${idPaciente}`;

    // HACEMOS UNA PETICIÓN GET CON AXIOS PARA OBTENER EL PERFIL DEL PACIENTE
    axios.get(url)
        .then(res => {
            const paciente = res.data; // OBTENEMOS LOS DATOS DEL PERFIL DEL PACIENTE
            console.log(paciente); // VERIFICAMOS SI LOS DATOS SE RECIBEN CORRECTAMENTE

            // VERIFICAMOS SI SE OBTUVIERON LOS DATOS DEL PACIENTE
            if (!paciente) {
                perfilContainer.innerHTML = "<p>No se encontró el perfil del paciente.</p>";
            } else {
                // CREAMOS UN DIV PARA MOSTRAR LOS DATOS DEL PACIENTE
                const div = document.createElement("div");
                div.classList.add("perfil-item");

                // MOSTRAMOS LOS DATOS BÁSICOS DEL PACIENTE EN EL DIV
                //                          <p>ID del Usuario  <strong> ${paciente.usuario.idUsuario}</strong></p> 
                //                          <p>ID del PACIENTE <strong> ${paciente.idPaciente}</strong> </p>
                  
                div.innerHTML = `

                    <h3>Los datos de tu cuenta :</h3>
                    
                    <p >Nombre </p>
                    <p class="izq"><strong>${paciente.usuario.nombre}</strong> </p>
                        <hr>  
                    <p>Apellidos </p>
                    <p class="izq">    <strong>${paciente.usuario.apellido}</strong> </p>
                         <hr>  
                    <p>Correo electrónico</p>
                    <p class="izq">    <strong>${paciente.usuario.correo}</strong> </p>
                         <hr>  
                    <p>DNI</p>
                    <p class="izq">    <strong>${paciente.usuario.dni} </strong> </p>
                         <hr>  
                    <p>Estado</p>
                    <p class="izq">    <strong>${paciente.usuario.enabled ? "Activo" : "Inactivo"}</strong> </p>  
                        <hr>  
                    <p>Tipo de Usuario</p>
                    <p class="izq">    <strong>${paciente.usuario.tipoUsuario}</strong> </p>
                        <hr>    
                    <p>Diagnóstico</p>
                    <p class="izq">    <strong>${paciente.diagnostico || "No disponible"}</strong> </p>  

                `;

                // AGREGAMOS EL DIV AL FRAGMENTO PARA OPTIMIZAR EL RENDIMIENTO
                fragment.appendChild(div);
            }

            // AGREGAMOS EL FRAGMENTO AL CONTENEDOR DEL PERFIL
            perfilContainer.appendChild(fragment);
        })
        .catch(err => {
            console.error("Hubo un fallo en la petición: " + err);
            perfilContainer.innerHTML = "<p>Hubo un error al cargar el perfil.</p>";
        });
});
