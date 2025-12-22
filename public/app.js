const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");
const content = document.getElementById("content");

function formatDate(iso) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleString();
}

function rateLine(base, val, to) {
  if (!base || val == null) return `No rate for ${to}`;
  return `1 ${base} = ${val} ${to}`;
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

btn.addEventListener("click", async () => {
  btn.disabled = true;
  statusEl.textContent = "Loading...";
  content.innerHTML = "";

  try {
    const resp = await fetch("/api/profile");
    const data = await resp.json();

    if (!resp.ok) {
      statusEl.textContent = "Error";
      content.innerHTML = `<div class="card">${escapeHtml(data.error || "Unknown error")}</div>`;
      btn.disabled = false;
      return;
    }

    const u = data.user;
    const c = data.countryInfo;
    const ex = data.exchange;
    const news = data.news || [];

    statusEl.textContent = "";

    content.innerHTML = `
      <div class="card">
        <h2>User</h2>
        <div class="row">
          <img class="avatar" src="${escapeHtml(u.picture)}" alt="profile"/>
          <div>
            <div><b>${escapeHtml(u.firstName)} ${escapeHtml(u.lastName)}</b></div>
            <div class="small">${escapeHtml(u.gender)} • Age: ${escapeHtml(u.age)}</div>
            <div class="small">DOB: ${escapeHtml(formatDate(u.dob))}</div>
            <div class="small">City: ${escapeHtml(u.city)}</div>
            <div class="small">Country: ${escapeHtml(u.country)}</div>
            <div class="small">Address: ${escapeHtml(u.fullAddress)}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Country Info</h2>
        <div class="grid">
          <div>
            <div><b>Name:</b> ${escapeHtml(c.name)}</div>
            <div><b>Capital:</b> ${escapeHtml(c.capital)}</div>
            <div><b>Languages:</b> ${escapeHtml((c.languages || []).join(", "))}</div>
            <div><b>Currency:</b> ${escapeHtml(c.currency?.code || "N/A")} ${escapeHtml(c.currency?.name || "")}</div>
          </div>
          <div>
            ${c.flag ? `<img class="flag" src="${escapeHtml(c.flag)}" alt="flag"/>` : `<div class="small">No flag</div>`}
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Exchange Rates</h2>
        <div>${escapeHtml(rateLine(ex.base, ex.USD, "USD"))}</div>
        <div>${escapeHtml(rateLine(ex.base, ex.KZT, "KZT"))}</div>
      </div>

      <div class="card">
        <h2>News (5 headlines)</h2>
        ${news.length === 0 ? `<div class="small">No news found or API key missing.</div>` : `
          <div class="news-grid">
            ${news.map(n => `
              <div class="card">
                ${n.image ? `<img class="news-img" src="${escapeHtml(n.image)}" alt="news"/>` : `<div class="small">No image</div>`}
                <div style="margin-top:10px"><b>${escapeHtml(n.title)}</b></div>
                <div class="small">${escapeHtml(n.description)}</div>
                <div class="small">Source: ${escapeHtml(n.source)}</div>
                ${n.url ? `<a href="${escapeHtml(n.url)}" target="_blank">Open article</a>` : ""}
              </div>
            `).join("")}
          </div>
        `}
      </div>
    `;
  } catch (e) {
    statusEl.textContent = "Error";
    content.innerHTML = `<div class="card">${escapeHtml(e.message)}</div>`;
  } finally {
    btn.disabled = false;
  }
});
