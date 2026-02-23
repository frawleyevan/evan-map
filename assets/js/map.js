(function () {
  const container = document.getElementById("map-window");
  if (!container) return;

  container.innerHTML = `
    <section class="window map-window" aria-label="Portfolio Highlights">
      <div class="titlebar">
        <span class="dot"></span>
        <span class="window-title">Portfolio Highlights</span>
        <div class="titlebar-buttons" aria-hidden="true">
          <span></span><span></span><span class="close"></span>
        </div>
      </div>
      <div class="mode-tabs" role="tablist" aria-label="Map style selector">
        <button class="mode-tab" data-layer="map" type="button">Map</button>
        <button class="mode-tab active" data-layer="satellite" type="button">Satellite</button>
        <button class="mode-tab" data-layer="hybrid" type="button">Hybrid</button>
      </div>
      <div id="map"></div>
    </section>
  `;

  if (typeof L === "undefined") return;

  const map = L.map("map", {
    attributionControl: true,
    scrollWheelZoom: false,
    zoomControl: true
  });

  const mapLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  });

  const satelliteLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19, attribution: "Tiles &copy; Esri" }
  );

  const hybridLabels = L.tileLayer(
    "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19, attribution: "Labels &copy; Esri" }
  );

  const layers = {
    map: mapLayer,
    satellite: satelliteLayer,
    hybrid: L.layerGroup([satelliteLayer, hybridLabels])
  };

  layers.satellite.addTo(map);

  function setLayer(name) {
    Object.values(layers).forEach((layer) => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    layers[name].addTo(map);

    document.querySelectorAll(".mode-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.layer === name);
    });
  }

  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => setLayer(tab.dataset.layer));
  });

  map.setView([45, -20], 3);

  const coordsEl = document.getElementById("coords");
  const defaultText = "Move over the map…";
  let isLocked = false;
  let lockedText = defaultText;

  function setCoords(text) {
    if (coordsEl) coordsEl.textContent = text;
  }

  map.on("mousemove", (e) => {
    if (isLocked) return;
    setCoords(`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
  });

  map.on("mouseout", () => {
    setCoords(isLocked ? lockedText : defaultText);
  });

  map.on("click", () => {
    isLocked = false;
    lockedText = defaultText;
    setCoords(defaultText);
  });

  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const bounds = [];

  projects.forEach((project) => {
    if (!Number.isFinite(project.lat) || !Number.isFinite(project.lng)) return;

    bounds.push([project.lat, project.lng]);

    const popupHTML = `
      <article class="project-popup">
        <header class="project-popup-header">
          <span>${project.id ? project.id.toUpperCase() : "PROJECT"}</span>
          ${project.page ? `<a href="${project.page}">Open</a>` : ""}
        </header>
        <img src="${project.image || ""}" alt="${project.title || "Project image"}">
        <h3>${project.title || "Untitled Project"}</h3>
        <p>${project.lat.toFixed(6)}, ${project.lng.toFixed(6)}</p>
      </article>
    `;

    const marker = L.marker([project.lat, project.lng]).addTo(map).bindPopup(popupHTML, {
      maxWidth: 340,
      className: "oldmaps-popup"
    });

    marker.on("mouseover", () => {
      if (isLocked) return;
      setCoords(`${project.lat.toFixed(6)}, ${project.lng.toFixed(6)}`);
    });

    marker.on("click", (e) => {
      if (e && e.originalEvent) L.DomEvent.stopPropagation(e);
      isLocked = true;
      lockedText = `${project.lat.toFixed(6)}, ${project.lng.toFixed(6)}`;
      setCoords(lockedText);
    });
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [48, 48] });
  }

  setTimeout(() => map.invalidateSize(), 250);
  setCoords(defaultText);
})();
