
            document.addEventListener("DOMContentLoaded", () => {
                // Datos: única fuente para textos y cuadrículas
                const datos = {
                    universidades: { total: 1504, origen: 185, destino: 84 },
                    escuelas: { total: 303, origen: 155, destino: 74 },
                };

                document.querySelectorAll("[data-dato]").forEach((el) => {
                    const [grupo, campo] = el.dataset.dato.split(".");
                    el.textContent = datos[grupo][campo];
                });

                // Cuadrículas de ranking
                const ranking = (id, { total, origen, destino }) => {
                    const min = Math.min(origen, destino);
                    const max = Math.max(origen, destino);
                    const celdas = Array.from({ length: total }, (_, i) => {
                        const n = i + 1;
                        const clase =
                            n === destino ? "destino" : n === origen ? "origen" : n > min && n < max ? "entre" : "";
                        return `<span class="${clase}">${n}</span>`;
                    });
                    document.getElementById(id).innerHTML = celdas.join("");
                };

                ranking("universidades", datos.universidades);
                ranking("escuelas", datos.escuelas);

                // Gráficos de radar
                const radar = (id, { labels, origen, destino }) =>
                    new Chart(document.getElementById(id), {
                        type: "radar",
                        data: {
                            labels: labels,
                            datasets: [
                                {
                                    label: "Origen (U.Chile)",
                                    data: origen,
                                    borderColor: "rgb(23, 23, 125)",
                                    backgroundColor: "rgba(54, 88, 235, 0.2)",
                                },
                                {
                                    label: "Destino (UBA)",
                                    data: destino,
                                    borderColor: "rgb(248, 167, 0)",
                                    backgroundColor: "rgba(255, 215, 99, 0.29)",
                                },
                            ],
                        },
                    });

                // 1. Gráfico de Universidades (QS World University Rankings)
                radar("comparaUniversidades", {
                    labels: [
                        "Academic Reputation",
                        "Employer Reputation",
                        "Faculty Student Ratio",
                        "Citations per Faculty",
                        "International Faculty",
                        "International Students",
                        "International Research Network",
                    ],
                    origen: [92.0, 85.1, 9.9, 16.0, 10.6, 8.2, 76.8],
                    destino: [98.1, 91.7, 85.3, 2.1, 71.1, 81.8, 75.0],
                });

                // 2. Gráfico de Escuelas (QS by Subject: Art & Design)
                radar("comparaEscuelas", {
                    labels: ["Overall Score", "Academic Reputation", "Employer Reputation"],
                    origen: [55.1, 52.5, 78.5],
                    destino: [65.7, 63.9, 81.6],
                });

                // Mapa
                const map = L.map("map").setView([-34.54125, -58.443944], 3);

                L.tileLayer(
                    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
                    { maxZoom: 16, attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ" }
                ).addTo(map);

                L.marker([-34.54125, -58.443944])
                    .addTo(map)
                    .bindPopup("<b>Universidad de Buenos Aires</b><br />Facultad de Arquitectura, Diseño y Urbanismo.")
                    .openPopup();

                // Infografía interactiva FAU
                (function () {
                    const svg = document.getElementById("info");
                    const opts = Array.from(svg.querySelectorAll(".opt"));
                    const hubTop = document.getElementById("hubTop");
                    const hubMain = document.getElementById("hubMain");
                    const orbit = document.getElementById("orbit");
                    const flown = document.getElementById("flown");
                    let locked = -1;

                    function fly(i) {
                        const deg = i < 0 ? 0 : 15 + 30 * i;
                        orbit.style.transform = "rotate(" + deg + "deg)";
                        flown.style.strokeDashoffset = 100 - (deg / 180) * 100;
                    }

                    function show(i) {
                        opts.forEach((o, k) => o.classList.toggle("on", k === i));
                        svg.classList.toggle("has-on", i >= 0);
                        fly(i);
                        if (i < 0) {
                            hubTop.textContent = "Intercambio FAU";
                            hubMain.textContent = "6 etapas";
                            return;
                        }
                        const o = opts[i];
                        hubTop.textContent = "Etapa " + o.dataset.n;
                        hubMain.textContent = o.dataset.name;
                    }

                    function fit() {
                        opts.forEach((o) => {
                            const r = o.querySelector(".lbl rect");
                            const texts = Array.from(o.querySelectorAll(".lbl text"));
                            let x0 = Infinity,
                                y0 = Infinity,
                                x1 = -Infinity,
                                y1 = -Infinity;
                            try {
                                texts.forEach((e) => {
                                    const b = e.getBBox();
                                    x0 = Math.min(x0, b.x);
                                    y0 = Math.min(y0, b.y);
                                    x1 = Math.max(x1, b.x + b.width);
                                    y1 = Math.max(y1, b.y + b.height);
                                });
                                r.setAttribute("x", (x0 - 18).toFixed(1));
                                r.setAttribute("y", (y0 - 10).toFixed(1));
                                r.setAttribute("width", (x1 - x0 + 36).toFixed(1));
                                r.setAttribute("height", (y1 - y0 + 20).toFixed(1));
                            } catch (err) {}
                        });
                    }

                    fit();
                    if (document.fonts && document.fonts.ready) {
                        document.fonts.ready.then(fit);
                    }
                    window.addEventListener("load", fit);

                    opts.forEach((o, i) => {
                        o.addEventListener("mouseenter", () => show(i));
                        o.addEventListener("mouseleave", () => show(locked));
                        o.addEventListener("focus", () => show(i));
                        o.addEventListener("blur", () => show(locked));
                        o.addEventListener("click", () => {
                            locked = locked === i ? -1 : i;
                            show(locked);
                        });
                        o.addEventListener("keydown", (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                locked = locked === i ? -1 : i;
                                show(locked);
                            }
                        });
                    });
                })();
            });
       
