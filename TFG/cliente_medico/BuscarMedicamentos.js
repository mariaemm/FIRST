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

        // Coincidencia exacta: texto exacto
        const coincidenciasExactas = medicamentosCargados.filter(m =>
            limpiarTexto(m.nombreMedicamento) === nombreLimpio
        );

        // Similares: por distancia de Levenshtein
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

        // Contiene la palabra pero no es similar ni exacto (para subrayar)
        const contienePalabra = medicamentosCargados.filter(m => {
            const nombreMed = limpiarTexto(m.nombreMedicamento);
            const sim = similitud(nombreMed, nombreLimpio);
            return nombreMed.includes(nombreLimpio) &&
                nombreMed !== nombreLimpio &&
                sim < 0.6;
        });

        let html = "";

        // Mostrar coincidencias exactas (palabra exacta)
        if (coincidenciasExactas.length > 0) {
            html += "<p style='color: green;'>✅ Coincidencias exactas encontradas:</p><ul>";
            coincidenciasExactas.forEach(m => {
                html += `<li><strong>${m.nombreMedicamento}</strong> | ${m.cantidadUnidad} unidades</li>`;
            });
            html += "</ul>";

            // Mostrar también los similares si existen
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
