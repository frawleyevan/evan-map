// assets/js/render-projects.js
(function () {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;

  const data = window.PROJECTS;

  if (!Array.isArray(data)) {
    grid.innerHTML = `
      <p style="margin:0; font-family: Arial, Helvetica, sans-serif; color: rgba(0,0,0,.75);">
        Projects data not found.
        <br><br>
        Check that your file is named <b>projects-data.js</b> and is located at:
        <br><b>assets/js/projects-data.js</b>
      </p>
    `;
    return;
  }

  // Filter: only maps projects
  const mapsProjects = data.filter(p => {
    const page = (p.page || "").toLowerCase();
    const cat = (p.category || "").toLowerCase();
    return cat === "maps" || page.includes("maps.html") || page.includes("projects/");
  });

  if (!mapsProjects.length) {
    grid.innerHTML = `
      <p style="margin:0; font-family: Arial, Helvetica, sans-serif; color: rgba(0,0,0,.75);">
        No map projects yet.
        <br><br>
        Add <b>category: "maps"</b> to map projects in <b>assets/js/projects-data.js</b>,
        or set their <b>page</b> to a maps/project URL.
      </p>
    `;
    return;
  }

  grid.innerHTML = mapsProjects.map(p => `
    <article class="project-card">
      <img src="${p.image || ""}" alt="${p.title || "Project"}" loading="lazy">
      <div class="project-body">
        <h3 class="project-title">${p.title || "Untitled Project"}</h3>
        ${p.caption ? `<p class="project-caption">${p.caption}</p>` : ``}
        ${p.page ? `<a class="project-link" href="${p.page}">View</a>` : ``}
      </div>
    </article>
  `).join("");
})();
