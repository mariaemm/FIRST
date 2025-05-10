document.addEventListener("DOMContentLoaded", function () {
    // OBTENEMOS EL CONTENEDOR DONDE MOSTRAREMOS EL PERFIL
    const perfilContainer = document.getElementById("mi-perfil");
    const fragment = document.createDocumentFragment();

    // OBTENER EL numeroColegiado DESDE localStorage (aquí se asume que idUsuario es igual a numeroColegiado)
    const numeroColegiado = localStorage.getItem("idUsuario");

    // VALIDAR QUE EL numeroColegiado EXISTA
    if (!numeroColegiado) {
        perfilContainer.innerHTML = "<p>Error: No se encontró el número de colegiado en localStorage.</p>";
        return;
    }

    // CONSTRUIMOS LA URL PARA OBTENER EL PERFIL DEL MEDICO
    const url = `http://localhost:9050/medicos/VerMiPerfilMedico/${numeroColegiado}`;

    // HACEMOS UNA PETICIÓN GET CON AXIOS PARA OBTENER EL PERFIL DEL MEDICO
    axios.get(url)
        .then(res => {
            const medico = res.data; // OBTENEMOS LOS DATOS DEL PERFIL DEL MEDICO
            console.log(medico); // VERIFICAMOS SI LOS DATOS SE RECIBEN CORRECTAMENTE

            // VERIFICAMOS SI SE OBTUVIERON LOS DATOS DEL MEDICO
            if (!medico) {
                perfilContainer.innerHTML = "<p>No se encontró el perfil del médico.</p>";
            } else {
                // CREAMOS UN DIV PARA MOSTRAR LOS DATOS DEL MEDICO
                const div = document.createElement("div");
                div.classList.add("perfil-item");

                // MOSTRAMOS LOS DATOS BÁSICOS DEL MEDICO EN EL DIV
                div.innerHTML = `
                    <h3>Los datos de tu cuenta :</h3>
                    <p>Tipo de Usuario</p>
                        <p class="izq"><strong>${medico.usuario.tipoUsuario}</strong> </p> 
                        <hr>    
                    <p>Número de Colegiado</p>
                         <p class="izq"> <strong>${medico.numeroColegiado}</strong> </p>
                        <hr>
                    <p>Nombre</p>
                           <p class="izq"> <strong>${medico.usuario.nombre}</strong> </p>
                        <hr>              
                    <p>Apellidos </p>
                        <p class="izq"> <strong>${medico.usuario.apellido}</strong> </p>
                        <hr>
                    <p>Correo electrónico</p>
                        <p class="izq"> <strong>${medico.usuario.correo}</strong> </p>
                        <hr>
                    <p>Especialidad</p>
                        <p class="izq"> <strong>${medico.especialidad || "No disponible"}</strong> </p>
                        <hr>
                    <p>Estado</p>
                        <p class="izq"> <strong>${medico.usuario.enabled ? "Activo" : "Inactivo"}</strong> </p>
     
                `;

                // AGREGAMOS EL DIV AL FRAGMENTO PARA OPTIMIZAR EL RENDIMIENTO
                fragment.appendChild(div);
            }

            // AGREGAMOS EL FRAGMENTO AL CONTENEDOR DEL PERFIL
            perfilContainer.appendChild(fragment);
        })
        .catch(err => {
            console.error("Hubo un fallo en la petición: " + err);
            perfilContainer.innerHTML = "<p>Hubo un error al cargar el Perfil Médico</p>";
        });
});
