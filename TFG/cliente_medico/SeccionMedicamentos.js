// -------------------------------------
// SECCIÓN: Alta de Medicamentos
// -------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const mensajeAlta = document.getElementById("mensajeAlta");
    const nombreInput = document.getElementById("nombreMedicamento");
    const unidadSelect = document.getElementById("unidadMedicamento");
    const cantidadInput = document.getElementById("cantidadUnidad");
    const nombreRender = document.getElementById("nombreRenderizado");

    let medicamentosExistentes = [];
    let medicamentoExiste = false;

    function cargarMedicamentos() {
        axios.get("http://localhost:9050/medicos/BuscarTodosLosMedicamentos")
            .then(response => {
                medicamentosExistentes = response.data || [];
            })
            .catch(error => {
                console.error("Error al cargar medicamentos existentes:", error);
            });
    }

    cargarMedicamentos();

    function limpiarTexto(texto) {
        return texto
            .toLowerCase()
            .replace(/\b(mg|ml|mg\/ml|g|%|mcg\/dosis)\b/g, "")
            .replace(/[0-9]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function palabras(texto) {
        return limpiarTexto(texto).split(" ").filter(p => p.length > 0);
    }

    function actualizarRenderNombre() {
        const nombre = nombreInput.value.trim();
        const unidad = unidadSelect.value.trim();

        if (nombre && unidad) {
            const nombreSinUnidad = nombre.replace(/\s?(mg|ml|mg\/ml|g|%|mcg\/dosis)$/i, "");
            nombreRender.innerHTML = `El medicamento que vas a dar de alta se registrará como: <strong>${nombreSinUnidad} <span style="color:green;">${unidad}</span></strong>`;
        } else {
            nombreRender.innerHTML = "";
        }
    }

    function verificarExistenciaYSimilares() {
        const nombreOriginal = nombreInput.value.trim();
        const unidad = unidadSelect.value.trim();

        const nombreFinal = nombreOriginal.replace(/\s?(mg|ml|mg\/ml|g|%|mcg\/dosis)$/i, "") + " " + unidad;
        const nombreLimpio = limpiarTexto(nombreFinal);
        const palabrasNombre = palabras(nombreFinal);

        if (!nombreLimpio || !unidad) {
            mensajeAlta.innerHTML = "";
            medicamentoExiste = false;
            return;
        }

        const existeExacto = medicamentosExistentes.find(m =>
            m.nombreMedicamento.toLowerCase() === nombreFinal.toLowerCase()
        );

        const similares = medicamentosExistentes.filter(m => {
            const palabrasExistente = palabras(m.nombreMedicamento);
            return palabrasNombre.some(p => palabrasExistente.includes(p));
        });

        if (existeExacto) {
            mensajeAlta.innerHTML = `
                <p style="color: red;">
                    ⚠️ <strong>Este medicamento ya existe:</strong> 
                    <br>➡️ <strong>${existeExacto.nombreMedicamento}</strong> | 
                    <span>${existeExacto.cantidadUnidad} Cantidad Total por Caja</span>
                </p>`;
            medicamentoExiste = true;
        } else if (similares.length > 0) {
            const lista = similares.map(m => `<li><strong>${m.nombreMedicamento}</strong> | ${m.cantidadUnidad} Cantidad Total por Caja</li>`).join("");
            mensajeAlta.innerHTML = `
                <p style="color: orange;">
                     <strong>Medicamentos con nombre parecido:</strong>
                </p>
                <ul style="color: orange;">${lista}</ul>`;
            medicamentoExiste = false;
        } else {
            mensajeAlta.innerHTML = "";
            medicamentoExiste = false;
        }
    }

    unidadSelect.addEventListener("change", function () {
        const unidad = unidadSelect.value.trim();
        let nombre = nombreInput.value.trim();
        nombre = nombre.replace(/\s?(mg|ml|mg\/ml|g|%|mcg\/dosis)$/i, "");

        if (unidad) {
            nombreInput.value = `${nombre} ${unidad}`;
        }

        actualizarRenderNombre();
        verificarExistenciaYSimilares();
    });

    nombreInput.addEventListener("input", function () {
        actualizarRenderNombre();
        verificarExistenciaYSimilares();
    });

    document.getElementById("btnAltaMedicamento").addEventListener("click", function () {
        mensajeAlta.innerHTML = "";

        const nombreMedicamento = nombreInput.value.trim();
        const unidad = unidadSelect.value.trim();
        const cantidadUnidad = cantidadInput.value.trim();

        let errores = [];

        if (!nombreMedicamento) errores.push("el nombre del medicamento");
        if (!unidad) errores.push("una unidad de medida");
        if (!cantidadUnidad || isNaN(cantidadUnidad) || cantidadUnidad <= 0) errores.push("una cantidad válida");

        if (errores.length > 0) {
            mensajeAlta.innerHTML = `<p style='color:red;'>FALTA: ${errores.join(", ")}</p>`;
            return;
        }

        const nombreFinal = nombreMedicamento.replace(/\s?(mg|ml|mg\/ml|g|%|mcg\/dosis)$/i, "") + " " + unidad;

        if (medicamentoExiste) {
            mensajeAlta.innerHTML += `<p style="color:red;">❌ No puedes registrar este medicamento porque ya existe.</p>`;
            return;
        }

        const medicamento = {
            nombreMedicamento: nombreFinal,
            cantidadUnidad: parseInt(cantidadUnidad)
        };

        axios.post("http://localhost:9050/medicos/AltaMedicamentos", medicamento)
            .then(response => {
                mensajeAlta.innerHTML = `<p style="color: green;">✅ Medicamento creado: ${response.data.nombreMedicamento}</p>`;
                setTimeout(() => location.reload(), 1000);
            })
            .catch(error => {
                mensajeAlta.innerHTML = "<p style='color: red;'>❌ Error al crear el medicamento. Intenta nuevamente.</p>";
                console.error(error);
            });
    });
});

// -------------------------------------
// SECCIÓN: Búsqueda
// -------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const tablaBody = document.querySelector("#tablaMedicamentos tbody");

    function cargarTodosLosMedicamentos() {
        axios.get("http://localhost:9050/medicos/BuscarTodosLosMedicamentos")
            .then(response => {
                const medicamentos = response.data;
                tablaBody.innerHTML = "";

                medicamentos.forEach(med => {
                    const row = `
                        <tr>
                            <td>${med.nombreMedicamento}</td>
                            <td>${med.cantidadUnidad}</td>
                        </tr>
                    `;
                    tablaBody.innerHTML += row;
                });
            })
            .catch(error => {
                tablaBody.innerHTML = "<tr><td colspan='2'>Error al cargar medicamentos.</td></tr>";
                console.error(error);
            });
    }

    cargarTodosLosMedicamentos();
});

document.addEventListener("DOMContentLoaded", function () {
    const inputNombre = document.getElementById("nombreMedicamentoBusqueda");
    const btnBuscar = document.getElementById("btnBuscarMedicamento");
    const resultadoBusqueda = document.getElementById("resultadoBusqueda");
    const tablaBody = document.querySelector("#tablaMedicamentos tbody");
    let medicamentosCargados = [];

    function limpiarTexto(texto) {
        return texto
            .toLowerCase()
            .replace(/[0-9]/g, "")
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function distanciaLevenshtein(a, b) {
        const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
            Array(a.length + 1).fill(0)
        );

        for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const costo = b[i - 1] === a[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + costo
                );
            }
        }

        return matrix[b.length][a.length];
    }

    function similitud(a, b) {
        const str1 = limpiarTexto(a);
        const str2 = limpiarTexto(b);
        const dist = distanciaLevenshtein(str1, str2);
        const maxLen = Math.max(str1.length, str2.length);
        return maxLen === 0 ? 1 : 1 - dist / maxLen;
    }

    function resaltarCoincidencia(texto, palabra) {
        const regex = new RegExp(`(${palabra})`, "gi");
        return texto.replace(regex, "<span style='text-decoration: underline;'>$1</span>");
    }

    function cargarTodosLosMedicamentos() {
        axios.get("http://localhost:9050/medicos/BuscarTodosLosMedicamentos")
            .then(response => {
                medicamentosCargados = response.data || [];
                tablaBody.innerHTML = "";

                medicamentosCargados.forEach(med => {
                    const row = `
                        <tr>
                            <td>${med.nombreMedicamento}</td>
                            <td>${med.cantidadUnidad}</td>
                        </tr>
                    `;
                    tablaBody.innerHTML += row;
                });
            })
            .catch(error => {
                tablaBody.innerHTML = "<tr><td colspan='2'>Error al cargar medicamentos.</td></tr>";
                console.error(error);
            });
    }

    btnBuscar.addEventListener("click", function () {
        const nombreInput = inputNombre.value.trim();
        if (!nombreInput) {
            resultadoBusqueda.innerHTML = "<p style='color: red;'>❌ Por favor, ingresa un nombre para buscar.</p>";
            return;
        }

        const nombreLimpio = limpiarTexto(nombreInput);

        const coincidenciasExactas = medicamentosCargados.filter(m =>
            limpiarTexto(m.nombreMedicamento) === nombreLimpio
        );

        const similares = medicamentosCargados
            .map(m => ({
                med: m,
                score: similitud(m.nombreMedicamento, nombreInput)
            }))
            .filter(obj =>
                obj.score >= 0.6 &&
                limpiarTexto(obj.med.nombreMedicamento) !== nombreLimpio
            )
            .sort((a, b) => b.score - a.score);

        const contienePalabra = medicamentosCargados.filter(m => {
            const nombreMed = limpiarTexto(m.nombreMedicamento);
            const sim = similitud(nombreMed, nombreLimpio);
            return nombreMed.includes(nombreLimpio) &&
                nombreMed !== nombreLimpio &&
                sim < 0.6;
        });

        let html = "";

        if (coincidenciasExactas.length > 0) {
            html += "<p style='color: green;'>✅ Coincidencias exactas encontradas:</p><ul>";
            coincidenciasExactas.forEach(m => {
                html += `<li><strong>${m.nombreMedicamento}</strong> | ${m.cantidadUnidad} unidades</li>`;
            });
            html += "</ul>";

            if (similares.length > 0) {
                html += `<p style='color: orange;'>⚠️ Medicamentos con nombres similares:</p><ul>`;
                similares.forEach(obj => {
                    html += `<li><strong>${obj.med.nombreMedicamento}</strong> | ${obj.med.cantidadUnidad} unidades</li>`;
                });
                html += "</ul>";
            }

        } else if (similares.length > 0) {
            const sugerido = similares[0].med.nombreMedicamento;
            html += `<p style='color: orange;'>🔎 Quizás quisiste decir: <strong>${sugerido}</strong></p>`;
            html += `<p style='color: orange;'>⚠️ Medicamentos con nombres similares:</p><ul>`;
            similares.forEach(obj => {
                html += `<li><strong>${obj.med.nombreMedicamento}</strong> | ${obj.med.cantidadUnidad} unidades</li>`;
            });
            html += "</ul>";
        } else if (contienePalabra.length > 0) {
            html += `<p style='color: blue;'>🔍 Palabras que contienen: <strong>${nombreInput}</strong></p><ul>`;
            contienePalabra.forEach(m => {
                const nombreResaltado = resaltarCoincidencia(m.nombreMedicamento, nombreInput);
                html += `<li><strong>${nombreResaltado}</strong> | ${m.cantidadUnidad} unidades</li>`;
            });
            html += "</ul>";
        } else {
            html = "<p style='color: red;'>❌ No se encontraron coincidencias ni medicamentos similares.</p>";
        }

        resultadoBusqueda.innerHTML = html;
    });

    cargarTodosLosMedicamentos();
});
