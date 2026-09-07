const $ = (id) => document.getElementById(id);

const PAGE_SIZE = 20;
let currentPage = 1;
let allEmails = [];

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

function getFilteredEmails() {
  const q = $("q").value.trim().toLowerCase();
  const status = $("status").value;
  const type = $("type").value;
  return allEmails.filter((e) => matches(e, q, status, type));
}

function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const pagination = $("pagination");
  if (totalItems === 0) {
    pagination.innerHTML = "";
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalItems);

  let pagesHtml = "";

  // Previous button
  pagesHtml += `<button type="button" class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""} aria-label="Previous page">← Prev</button>`;

  // Page numbers (show a sliding window around current page)
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    pagesHtml += `<button type="button" class="page-btn" data-page="1">1</button>`;
    if (startPage > 2) {
      pagesHtml += `<span class="page-ellipsis">…</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const active = i === currentPage ? " active" : "";
    pagesHtml += `<button type="button" class="page-btn${active}" data-page="${i}" ${i === currentPage ? 'aria-current="page"' : ""}>${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pagesHtml += `<span class="page-ellipsis">…</span>`;
    }
    pagesHtml += `<button type="button" class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }

  // Next button
  pagesHtml += `<button type="button" class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""} aria-label="Next page">Next →</button>`;

  pagination.innerHTML = `
    <div class="pagination-info">
      Showing <strong>${start}–${end}</strong> of <strong>${totalItems}</strong>
    </div>
    <div class="pagination-controls">
      ${pagesHtml}
    </div>
  `;

  pagination.querySelectorAll(".page-btn:not([disabled])").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = Number(btn.dataset.page);
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        renderList();
        // Scroll list into view for better UX
        $("list").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function renderList() {
  const rows = getFilteredEmails();
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  if (!totalItems) {
    $("list").innerHTML = `<p class="empty">No emails match the current filters.</p>`;
    renderPagination(0);
    return;
  }

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(startIdx, startIdx + PAGE_SIZE);

  $("list").innerHTML = pageRows
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

  renderPagination(totalItems);
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function onFilterChange() {
  currentPage = 1;
  renderList();
}

async function boot() {
  const [emailsRes, stateRes] = await Promise.all([
    fetch("data/emails.json"),
    fetch("data/state.json"),
  ]);
  const emails = await emailsRes.json();
  const state = await stateRes.json();
  emails.sort((a, b) => String(b.emailDate).localeCompare(String(a.emailDate)));
  allEmails = emails;
  renderStats(emails, state);

  $("q").addEventListener("input", onFilterChange);
  $("status").addEventListener("change", onFilterChange);
  $("type").addEventListener("change", onFilterChange);

  renderList();
}

boot().catch((err) => {
  $("syncMeta").textContent = "Failed to load data";
  $("list").innerHTML = `<p class="empty">${escapeHtml(err.message)}</p>`;
  $("pagination").innerHTML = "";
});
