const $ = (id) => document.getElementById(id);

const state = {
  leads: [],
  users: [],
  roles: [],
  followUps: [],
};

function getBaseUrl() {
  return $("baseUrl").value.trim().replace(/\/+$/, "");
}

function getAuthHeader() {
  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;
  return "Basic " + btoa(email + ":" + password);
}

function intOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function asDateTime(value) {
  if (!value) return null;
  return value.length === 16 ? value + ":00" : value;
}

async function api(path, method = "GET", body) {
  const response = await fetch(getBaseUrl() + path, {
    method,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let parsed = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch (_) {}

  return { ok: response.ok, status: response.status, body: parsed };
}

function logAction(label, result) {
  $("responseBox").textContent = JSON.stringify(
    { action: label, status: result.status, ok: result.ok, body: result.body },
    null,
    2
  );
}

async function run(label, action) {
  try {
    const result = await action();
    logAction(label, result);
    return result;
  } catch (error) {
    $("responseBox").textContent = JSON.stringify({ action: label, error: error.message }, null, 2);
    return null;
  }
}

function setAuthStatus(message, isOk = false) {
  $("authStatus").textContent = message;
  $("authStatus").style.color = isOk ? "#166534" : "#1d4ed8";
}

function showView(name) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.dataset.view === name));
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
}

function badge(status) {
  return `<span class="tag">${status || "N/A"}</span>`;
}

function renderDashboard() {
  $("metricLeads").textContent = String(state.leads.length);
  $("metricNew").textContent = String(state.leads.filter((l) => l.status === "NEW").length);
  $("metricConverted").textContent = String(state.leads.filter((l) => l.status === "CONVERTED").length);
  $("metricFollowUps").textContent = String(state.followUps.length);

  const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];
  $("pipeline").innerHTML = statuses.map((s) => {
    const count = state.leads.filter((l) => l.status === s).length;
    return `<div class="stage"><h4>${s}</h4><p>${count}</p></div>`;
  }).join("");
}

function renderLeads() {
  const search = $("leadSearch").value.trim().toLowerCase();
  const statusFilter = $("leadFilterStatus").value;
  const rows = state.leads
    .filter((l) => {
      const hit = [l.name, l.email, l.source].join(" ").toLowerCase().includes(search);
      const statusHit = !statusFilter || l.status === statusFilter;
      return hit && statusHit;
    })
    .map((l) => `
      <tr>
        <td>${l.id ?? ""}</td>
        <td>${l.name ?? ""}</td>
        <td>${badge(l.status)}</td>
        <td>${l.source ?? ""}</td>
        <td>${l.assignedUser?.name || l.assignedUser?.id || "-"}</td>
        <td class="table-actions">
          <button data-action="edit-lead" data-id="${l.id}">Edit</button>
          <button data-action="delete-lead" data-id="${l.id}" class="secondary">Delete</button>
        </td>
      </tr>
    `).join("");
  $("leadsTable").innerHTML = rows || `<tr><td colspan="6">No leads found.</td></tr>`;
}

function renderUsers() {
  const rows = state.users.map((u) => `
    <tr>
      <td>${u.id ?? ""}</td>
      <td>${u.name ?? ""}</td>
      <td>${u.email ?? ""}</td>
      <td>${u.assignedRole?.name || u.assignedRole?.id || "-"}</td>
      <td class="table-actions">
        <button data-action="edit-user" data-id="${u.id}">Edit</button>
        <button data-action="delete-user" data-id="${u.id}" class="secondary">Delete</button>
      </td>
    </tr>
  `).join("");
  $("usersTable").innerHTML = rows || `<tr><td colspan="5">No users found.</td></tr>`;
}

function renderRoles() {
  const rows = state.roles.map((r) => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td class="table-actions">
        <button data-action="delete-role" data-id="${r.id}" class="secondary">Delete</button>
      </td>
    </tr>
  `).join("");
  $("rolesTable").innerHTML = rows || `<tr><td colspan="3">No roles found.</td></tr>`;
}

function renderFollowUps() {
  const leadFilter = intOrNull($("followUpFilterLeadId").value);
  const rows = state.followUps
    .filter((f) => !leadFilter || f.lead?.id === leadFilter)
    .map((f) => `
      <tr>
        <td>${f.id ?? ""}</td>
        <td>${f.lead?.id ?? "-"}</td>
        <td>${f.note ?? ""}</td>
        <td>${f.nextFollowUpDate ?? ""}</td>
        <td class="table-actions">
          <button data-action="delete-followup" data-id="${f.id}" class="secondary">Delete</button>
        </td>
      </tr>
    `).join("");
  $("followUpsTable").innerHTML = rows || `<tr><td colspan="5">No follow-ups found.</td></tr>`;
}

function renderAll() {
  renderDashboard();
  renderLeads();
  renderUsers();
  renderRoles();
  renderFollowUps();
}

async function loadAll() {
  const [leadsRes, usersRes, rolesRes, followRes] = await Promise.all([
    api("/leads"),
    api("/users"),
    api("/roles"),
    api("/followups"),
  ]);
  if (leadsRes.ok) state.leads = Array.isArray(leadsRes.body) ? leadsRes.body : [];
  if (usersRes.ok) state.users = Array.isArray(usersRes.body) ? usersRes.body : [];
  if (rolesRes.ok) state.roles = Array.isArray(rolesRes.body) ? rolesRes.body : [];
  if (followRes.ok) state.followUps = Array.isArray(followRes.body) ? followRes.body : [];
  renderAll();
  return { leadsRes, usersRes, rolesRes, followRes };
}

function fillLeadForm(lead) {
  $("leadId").value = lead.id ?? "";
  $("leadName").value = lead.name ?? "";
  $("leadEmail").value = lead.email ?? "";
  $("leadPhone").value = lead.phone ?? "";
  $("leadSource").value = lead.source ?? "";
  $("leadStatus").value = lead.status ?? "NEW";
  $("leadUserId").value = lead.assignedUser?.id ?? "";
}

function clearLeadForm() {
  $("leadForm").reset();
  $("leadId").value = "";
  $("leadStatus").value = "NEW";
}

function fillUserForm(user) {
  $("userId").value = user.id ?? "";
  $("userName").value = user.name ?? "";
  $("userEmail").value = user.email ?? "";
  $("userPassword").value = "";
  $("userRoleId").value = user.assignedRole?.id ?? "";
}

function clearUserForm() {
  $("userForm").reset();
  $("userId").value = "";
}

function bindNavigation() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });
}

function bindTopbar() {
  $("btnConnect").addEventListener("click", async () => {
    const res = await run("Connect", () => api("/leads"));
    if (!res) return;
    if (!res.ok) {
      setAuthStatus("Connection failed. Check credentials and roles.");
      return;
    }
    await loadAll();
    setAuthStatus("Connected successfully.", true);
  });

  $("btnRefresh").addEventListener("click", async () => {
    const res = await run("Refresh Data", () => loadAll());
    if (res) setAuthStatus("Data refreshed.", true);
  });
}

function bindLeadEvents() {
  $("leadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = intOrNull($("leadId").value);
    const userId = intOrNull($("leadUserId").value);
    const payload = {
      name: $("leadName").value.trim(),
      email: $("leadEmail").value.trim(),
      phone: $("leadPhone").value.trim(),
      source: $("leadSource").value.trim(),
      status: $("leadStatus").value,
      assignedUser: userId ? { id: userId } : null,
    };
    await run(id ? "Update Lead" : "Create Lead", () => api(id ? `/leads/${id}` : "/leads", id ? "PUT" : "POST", payload));
    await loadAll();
    clearLeadForm();
  });

  $("btnLeadClear").addEventListener("click", clearLeadForm);
  $("leadSearch").addEventListener("input", renderLeads);
  $("leadFilterStatus").addEventListener("change", renderLeads);

  $("leadsTable").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "edit-lead") {
      const lead = state.leads.find((l) => l.id === id);
      if (lead) {
        fillLeadForm(lead);
        showView("leads");
      }
    }
    if (btn.dataset.action === "delete-lead") {
      await run("Delete Lead", () => api(`/leads/${id}`, "DELETE"));
      await loadAll();
    }
  });
}

function bindUserEvents() {
  $("userForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = intOrNull($("userId").value);
    const roleId = intOrNull($("userRoleId").value);
    const payload = {
      name: $("userName").value.trim(),
      email: $("userEmail").value.trim(),
      password: $("userPassword").value,
      assignedRole: roleId ? { id: roleId } : null,
    };
    await run(id ? "Update User" : "Create User", () => api(id ? `/users/${id}` : "/users", id ? "PUT" : "POST", payload));
    await loadAll();
    clearUserForm();
  });

  $("usersTable").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "edit-user") {
      const user = state.users.find((u) => u.id === id);
      if (user) {
        fillUserForm(user);
        showView("users");
      }
    }
    if (btn.dataset.action === "delete-user") {
      await run("Delete User", () => api(`/users/${id}`, "DELETE"));
      await loadAll();
    }
  });
}

function bindRoleEvents() {
  $("roleForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("roleName").value.trim();
    if (!name) return;
    await run("Create Role", () => api("/roles", "POST", { name }));
    await loadAll();
    $("roleForm").reset();
  });

  $("rolesTable").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "delete-role") {
      await run("Delete Role", () => api(`/roles/${id}`, "DELETE"));
      await loadAll();
    }
  });
}

function bindFollowUpEvents() {
  $("followUpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      note: $("followUpNote").value.trim(),
      nextFollowUpDate: asDateTime($("followUpDate").value),
      lead: { id: intOrNull($("followUpLeadId").value) },
    };
    await run("Create Follow Up", () => api("/followups", "POST", payload));
    await loadAll();
    $("followUpForm").reset();
  });

  $("followUpFilterLeadId").addEventListener("input", renderFollowUps);
  $("followUpsTable").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === "delete-followup") {
      await run("Delete Follow Up", () => api(`/followups/${id}`, "DELETE"));
      await loadAll();
    }
  });
}

bindNavigation();
bindTopbar();
bindLeadEvents();
bindUserEvents();
bindRoleEvents();
bindFollowUpEvents();
