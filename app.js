const $ = (id) => document.getElementById(id);

function fmt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function count(emails, status) {
  return emails.filter((e) => e.status === status).length;
}

function renderStats(emails, state) {
  const items = [
    ["Total", emails.length],
    ["Approved", count(emails, "Approved")],
    ["Rejected", count(emails, "Rejected")],
    ["Under Review", count(emails, "Review")],
    ["Published", count(emails, "Published")],
    ["Action Required", count(emails, "Action Required")],
  ];
  $("stats").innerHTML = items
    .map(([label, n]) => `<div class="stat"><b>${n}</b><span>${label}</span></div>`)
    .join("");
  $("syncMeta").textContent = state?.lastSuccessfulRun
    ? `Last sync: ${fmt(state.lastSuccessfulRun)}`
    : "No sync yet";
}

function matches(e, q, status, type) {
  if (status && e.status !== status) return false;
  if (type && e.emailType !== type) return false;
  if (!q) return true;
  const hay = [e.bookCode, e.status, e.subject, e.summary, e.emailType]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function statusClass(status) {
  if (!status) return "status-N/A";
  return "status-" + status.replace(/\s+/g, "");
}

function renderList(emails) {
  const q = $("q").value.trim().toLowerCase();
  const status = $("status").value;
  const type = $("type").value;
  const rows = emails.filter((e) => matches(e, q, status, type));

  if (!rows.length) {
    $("list").innerHTML = `<p class="empty">No emails match the current filters.</p>`;
    return;
  }

  $("list").innerHTML = rows
    .map((e) => {
      const cls = (e.status || "").replace(/\s+/g, "");
      const statusBadge = e.status || "N/A";
      return `<article class="card ${cls}">
        <div class="top">
          <div>
            <span class="badge ${statusClass(e.status)}">${statusBadge}</span>
            <span class="badge type">${e.emailType || "Other"}</span>
            <span class="badge code">${e.bookCode || "N/A"}</span>
          </div>
          <time>${fmt(e.emailDate)}</time>
        </div>
        <h2 class="subject">${escapeHtml(e.subject || "")}</h2>
        <p class="summary">${escapeHtml(e.summary || "")}</p>
        <div class="actions">
          ${e.gmailLink ? `<a href="${e.gmailLink}" target="_blank" rel="noopener">Open in Gmail</a>` : ""}
        </div>
      </article>`;
    })
    .join("");
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function boot() {
  const [emailsRes, stateRes] = await Promise.all([
    fetch("data/emails.json"),
    fetch("data/state.json"),
  ]);
  const emails = await emailsRes.json();
  const state = await stateRes.json();
  emails.sort((a, b) => String(b.emailDate).localeCompare(String(a.emailDate)));
  renderStats(emails, state);
  const redraw = () => renderList(emails);
  $("q").addEventListener("input", redraw);
  $("status").addEventListener("change", redraw);
  $("type").addEventListener("change", redraw);
  redraw();
}

boot().catch((err) => {
  $("syncMeta").textContent = "Failed to load data";
  $("list").innerHTML = `<p class="empty">${escapeHtml(err.message)}</p>`;
});
