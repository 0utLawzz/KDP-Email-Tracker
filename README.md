# KDP Email Dashboard

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub%20Pages-222?logo=github)
![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/Status-Active-success)

> Personal Amazon KDP / Kindle Content Review email tracker for **Bright Mindful Pages**.  
> Static GitHub Pages dashboard that displays curated inbound KDP mail with status, book code, and filters.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation / Local Preview](#installation--local-preview)
- [Data Format](#data-format)
- [Deployment (GitHub Pages)](#deployment-github-pages)
- [Suggested Improvements](#suggested-improvements)
- [License](#license)
- [Author](#author)

---

## Overview

This repository hosts a lightweight, zero-build dashboard that visualises official Amazon KDP / Kindle Content Review inbound emails. Data is stored as static JSON files updated by an external automation; the browser simply fetches and filters them.

Only official KDP / Kindle Content Review messages are included. Replies and shopping mail are excluded by design.

---

## Features

| Feature | Description |
|---------|-------------|
| Status stats | Total, Approved, Rejected, Under Review, Published, Action Required |
| Search | Subject, summary, book code, status, email type |
| Filters | Status + Email type dropdowns |
| Gmail deep links | Open original message in Gmail |
| Last sync indicator | Shows `lastSuccessfulRun` from `state.json` |
| Zero build | Pure HTML / CSS / vanilla JS — ideal for GitHub Pages |

---

## Project Structure

```text
.
├── index.html          # Dashboard shell
├── app.js              # Fetch, filter, render logic
├── styles.css          # Layout & card styles
├── data/
│   ├── emails.json     # Permanent history (Gmail message ID = unique key)
│   └── state.json      # Last successful automation checkpoint
└── README.md
```

---

## Installation / Local Preview

No build step is required.

```bash
git clone https://github.com/0utLawzz/kdp-email-dashboard.git
cd kdp-email-dashboard

# Option A — simple static server
npx serve .

# Option B — Python
python -m http.server 8080
```

Open the printed local URL. The dashboard loads `data/emails.json` and `data/state.json` relative to the page.

---

## Data Format

**emails.json** — array of objects. Typical fields used by the UI:

| Field | Purpose |
|-------|---------|
| `status` | Approved / Rejected / Review / Published / Action Required / … |
| `emailType` | Alert / Notification / Review / Publishing / … |
| `bookCode` | Internal book identifier |
| `subject` | Email subject |
| `summary` | Short summary text |
| `emailDate` | ISO date string |
| `gmailLink` | Deep link to the message in Gmail |

**state.json** — contains at least `lastSuccessfulRun` (ISO timestamp of the last successful automation run).

Gmail message ID is the unique key for permanent history.

---

## Deployment (GitHub Pages)

1. Enable GitHub Pages for this repository (Settings → Pages → Deploy from branch `main` / root).
2. After each automation update of the JSON files, the live dashboard refreshes automatically.

Suggested live URL once Pages is enabled:  
`https://0utlawzz.github.io/kdp-email-dashboard/`

---

## Suggested Improvements

| Priority | Item |
|----------|------|
| High | Add MIT LICENSE and community standard files |
| Medium | Dark-mode toggle / improved mobile spacing |
| Medium | Persist filter state in URL query params |
| Low | Optional client-side pagination for very large histories |
| Info | Ensure automation that writes `emails.json` never commits secrets |

---

## License

MIT (to be added).

---

## Author

**Nadeem (OutLawZ)** — Bright Mindful Pages / KDP tooling  
GitHub: [0utLawzz](https://github.com/0utLawzz)  
Contact: net2outlawzz@gmail.com
