import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} from "../../services/events.js";

const API_ORIGIN = "http://localhost:3000";

let activeRoot = null;
let allEvents = [];
let selectedEvent = null;
let deleteTarget = null;
let loading = false;
let initialized = false;
let toastTimer = null;

function $(selector, root = activeRoot) {
  return root?.querySelector(selector);
}

function escapeHTML(value = "") {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function valueOf(item, ...keys) {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }
  return "";
}

function normalizeEvent(item = {}) {
  const status = String(valueOf(
    item, "status", "publication_status", "publicationStatus"
  ) || "DRAFT").toUpperCase();

  let cover = valueOf(item, "coverUrl", "cover_url", "cover");
  if (cover && cover.startsWith("/")) {
    cover = `${API_ORIGIN}${cover}`;
  }

  return {
    ...item,
    id: valueOf(item, "id", "eventId", "event_id"),
    title: valueOf(item, "title") || "Evento sem título",
    summary: valueOf(item, "summary"),
    content: valueOf(item, "content", "description"),
    description: valueOf(item, "description"),
    eventDate: valueOf(item, "eventDate", "event_date"),
    startTime: valueOf(item, "startTime", "start_time"),
    endTime: valueOf(item, "endTime", "end_time"),
    location: valueOf(item, "location"),
    coverUrl: cover,
    status,
    visibility: String(valueOf(item, "visibility") || "SITE_AND_APP").toUpperCase(),
    scheduledAt: valueOf(item, "scheduledAt", "scheduled_at"),
    publishedAt: valueOf(item, "publishedAt", "published_at"),
    creator: valueOf(item, "creatorName", "creator_name", "createdBy", "created_by")
  };
}

function formatDate(date) {
  if (!date) return "Data por definir";

  const match = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? String(date)
    : parsed.toLocaleDateString("pt-PT");
}

function formatTime(time) {
  return String(time || "").slice(0, 5);
}

function statusLabel(status) {
  return ({
    PUBLISHED: "Publicado",
    SCHEDULED: "Agendado",
    DRAFT: "Rascunho"
  })[status] || status;
}

function visibilityLabel(visibility) {
  return ({
    SITE_AND_APP: "Site e aplicação",
    SITE_ONLY: "Apenas site",
    APP_ONLY: "Apenas aplicação",
    INTERNAL: "Interno"
  })[visibility] || visibility;
}

function showToast(message, type = "success") {
  const toast = $("#events-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = `events-toast events-toast-${type}`;
  toast.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (toast.isConnected) toast.hidden = true;
  }, 3500);
}

function setModal(id, open) {
  const modal = $(`#${id}`);
  if (!modal) return;

  modal.hidden = !open;
  document.body.classList.toggle(
    "events-modal-open",
    Boolean(activeRoot?.querySelector(".events-modal:not([hidden])"))
  );
}

function updateStats(events) {
  $("#events-stat-total").textContent = events.length;
  $("#events-stat-published").textContent =
    events.filter(item => item.status === "PUBLISHED").length;
  $("#events-stat-scheduled").textContent =
    events.filter(item => item.status === "SCHEDULED").length;
  $("#events-stat-draft").textContent =
    events.filter(item => item.status === "DRAFT").length;
}

function renderCard(event) {
  const time = [formatTime(event.startTime), formatTime(event.endTime)]
    .filter(Boolean).join(" – ");

  const cover = event.coverUrl
    ? `<img src="${escapeHTML(event.coverUrl)}" alt="${escapeHTML(event.title)}" loading="lazy">`
    : `<div class="events-card-cover-placeholder"><span>▦</span><small>Evento escolar</small></div>`;

  return `
    <article class="events-card" data-event-id="${escapeHTML(event.id)}">
      <div class="events-card-cover">
        ${cover}
        <span class="events-status-badge events-status-${event.status.toLowerCase()}">
          ${escapeHTML(statusLabel(event.status))}
        </span>
        <button type="button" class="events-card-menu"
          data-event-action="delete" data-event-id="${escapeHTML(event.id)}"
          aria-label="Eliminar evento">•••</button>
      </div>

      <div class="events-card-body">
        <div class="events-card-date">▦ ${escapeHTML(formatDate(event.eventDate))}</div>
        <h3>${escapeHTML(event.title)}</h3>
        <p class="events-card-summary">
          ${escapeHTML(event.summary || event.content || "Sem descrição disponível.")}
        </p>

        <div class="events-card-meta">
          ${time ? `<span>◷ ${escapeHTML(time)}</span>` : ""}
          ${event.location ? `<span>⌖ ${escapeHTML(event.location)}</span>` : ""}
        </div>

        <div class="events-card-footer">
          <button type="button" class="events-text-button"
            data-event-action="view" data-event-id="${escapeHTML(event.id)}">
            Ver evento
          </button>
          <button type="button" class="events-edit-button"
            data-event-action="edit" data-event-id="${escapeHTML(event.id)}">
            Editar
          </button>
        </div>
      </div>
    </article>
  `;
}

function applyFilters() {
  if (!activeRoot) return;

  const search = ($("#events-search-input")?.value || "").trim().toLowerCase();
  const status = $("#events-status-filter")?.value || "all";
  const date = $("#events-date-filter")?.value || "";

  const filtered = allEvents.filter(event => {
    const searchable = [
      event.title, event.summary, event.location, event.content
    ].join(" ").toLowerCase();

    return (!search || searchable.includes(search)) &&
      (status === "all" || event.status === status) &&
      (!date || String(event.eventDate).slice(0, 10) === date);
  });

  $("#events-grid").innerHTML = filtered.map(renderCard).join("");
  $("#events-results-count").textContent =
    `${filtered.length} ${filtered.length === 1 ? "evento encontrado" : "eventos encontrados"}`;

  $("#events-empty").hidden = allEvents.length !== 0;
  $("#events-no-results").hidden =
    allEvents.length === 0 || filtered.length !== 0;
}

async function loadEvents() {
  if (!activeRoot || loading) return;

  loading = true;
  $("#events-error").hidden = true;
  $("#events-empty").hidden = true;
  $("#events-no-results").hidden = true;
  $("#events-grid").innerHTML = "";
  $("#events-loading").hidden = false;
  $("#events-results-count").textContent = "A carregar eventos...";

  try {
    const result = await getEvents();
    if (!activeRoot?.isConnected) return;

    allEvents = (Array.isArray(result) ? result : []).map(normalizeEvent);
    updateStats(allEvents);
    $("#events-loading").hidden = true;
    applyFilters();
  } catch (error) {
    if (!activeRoot?.isConnected) return;

    $("#events-loading").hidden = true;
    $("#events-error").hidden = false;
    $("#events-error-message").textContent =
      error.message || "Não foi possível comunicar com o servidor.";
    $("#events-results-count").textContent = "Erro ao carregar";
    showToast("Não foi possível carregar os eventos.", "error");
  } finally {
    loading = false;
  }
}

function resetForm() {
  const form = $("#events-form");
  if (!form) return;

  form.reset();
  $("#events-form-id").value = "";
  $("#events-form-title").textContent = "Novo evento";
  $("#events-form-subtitle").textContent =
    "Preenche os dados da actividade escolar.";
  $("#events-submit-button").textContent = "Guardar evento";
  $("#events-submit-button").disabled = false;
  $("#events-form-error").hidden = true;
  $("#events-scheduled-field").hidden = true;
  $("#events-cover-preview").hidden = true;
  $("#events-cover-preview-image").removeAttribute("src");
  $("#events-cover-url").dataset.original = "";
  $("#events-cover-url").value = "";
  selectedEvent = null;
}

function openNewEvent() {
  resetForm();
  setModal("events-form-modal", true);
  $("#events-title")?.focus();
}

async function openEditEvent(id) {
  let event = allEvents.find(item => String(item.id) === String(id));

  try {
    if (id) {
      const result = await getEvent(id);
      if (result) event = normalizeEvent(result);
    }
  } catch {
    // Se o detalhe não estiver disponível, usamos os dados da listagem.
  }

  if (!event) {
    showToast("Não foi possível encontrar este evento.", "error");
    return;
  }

  selectedEvent = event;
  resetForm();

  $("#events-form-id").value = event.id;
  $("#events-form-title").textContent = "Editar evento";
  $("#events-form-subtitle").textContent =
    "Altera os dados necessários e guarda as alterações.";
  $("#events-submit-button").textContent = "Guardar alterações";

  const fields = {
    title: event.title,
    summary: event.summary,
    content: event.content,
    eventDate: String(event.eventDate || "").slice(0, 10),
    startTime: formatTime(event.startTime),
    endTime: formatTime(event.endTime),
    location: event.location,
    status: event.status,
    visibility: event.visibility
  };

  for (const [name, value] of Object.entries(fields)) {
    const field = $(`#events-form [name="${name}"]`);
    if (field) field.value = value || "";
  }

  $("#events-cover-url").value = event.coverUrl || "";
  $("#events-cover-url").dataset.original = event.coverUrl || "";

  if (event.coverUrl) {
    $("#events-cover-preview-image").src = event.coverUrl;
    $("#events-cover-preview").hidden = false;
  }

  if (event.scheduledAt) {
    const parsed = new Date(event.scheduledAt);
    if (!Number.isNaN(parsed.getTime())) {
      const localValue = new Date(
        parsed.getTime() - parsed.getTimezoneOffset() * 60000
      ).toISOString().slice(0, 16);
      $("#events-scheduled-at").value = localValue;
    }
  }

  $("#events-scheduled-field").hidden = event.status !== "SCHEDULED";
  setModal("events-form-modal", true);
}

function openViewEvent(id) {
  const event = allEvents.find(item => String(item.id) === String(id));
  if (!event) return;

  selectedEvent = event;

  const cover = event.coverUrl
    ? `<img class="events-view-cover" src="${escapeHTML(event.coverUrl)}" alt="${escapeHTML(event.title)}">`
    : "";

  const time = [formatTime(event.startTime), formatTime(event.endTime)]
    .filter(Boolean).join(" – ");

  $("#events-view-title").textContent = event.title;
  $("#events-view-content").innerHTML = `
    ${cover}
    <div class="events-view-badges">
      <span class="events-status-badge events-status-${event.status.toLowerCase()}">
        ${escapeHTML(statusLabel(event.status))}
      </span>
      <span class="events-visibility-badge">
        ${escapeHTML(visibilityLabel(event.visibility))}
      </span>
    </div>
    <div class="events-view-details">
      <div><span>Data</span><strong>${escapeHTML(formatDate(event.eventDate))}</strong></div>
      <div><span>Horário</span><strong>${escapeHTML(time || "Por definir")}</strong></div>
      <div><span>Local</span><strong>${escapeHTML(event.location || "Por definir")}</strong></div>
      <div><span>Criado por</span><strong>${escapeHTML(event.creator || "Não indicado")}</strong></div>
    </div>
    ${event.summary ? `<div class="events-view-section"><h3>Resumo</h3><p>${escapeHTML(event.summary)}</p></div>` : ""}
    <div class="events-view-section"><h3>Descrição</h3><p>${escapeHTML(event.content || event.description || "Sem descrição disponível.")}</p></div>
  `;

  setModal("events-view-modal", true);
}

function openDeleteConfirmation(id) {
  const event = allEvents.find(item => String(item.id) === String(id));
  if (!event) return;

  deleteTarget = event;
  $("#events-delete-message").textContent =
    `Tens a certeza de que pretendes eliminar "${event.title}"? Esta acção não pode ser desfeita.`;

  setModal("events-delete-modal", true);
}

function showCoverPreview(source) {
  const preview = $("#events-cover-preview");
  const image = $("#events-cover-preview-image");

  if (!source) {
    preview.hidden = true;
    image.removeAttribute("src");
    return;
  }

  image.src = source;
  preview.hidden = false;
}

async function submitEvent(event) {
  event.preventDefault();

  const form = $("#events-form");
  const errorBox = $("#events-form-error");
  const submitButton = $("#events-submit-button");

  errorBox.hidden = true;

  const start = $("#events-start-time").value;
  const end = $("#events-end-time").value;

  if (start && end && end < start) {
    errorBox.textContent = "A hora de término não pode ser anterior à hora de início.";
    errorBox.hidden = false;
    return;
  }

  const status = $("#events-status").value;
  const scheduledAt = $("#events-scheduled-at").value;

  if (status === "SCHEDULED" && !scheduledAt) {
    errorBox.textContent = "Indica a data e a hora em que o evento deve ser publicado.";
    errorBox.hidden = false;
    return;
  }

  const file = $("#events-cover-file").files[0];

  if (file && file.size > 5 * 1024 * 1024) {
    errorBox.textContent = "A imagem não pode ultrapassar 5 MB.";
    errorBox.hidden = false;
    return;
  }

  const formData = new FormData(form);
  const id = $("#events-form-id").value;

  // O identificador é usado na rota, não no corpo da requisição.
  formData.delete("eventId");

  // Se não houver nova imagem nem nova URL, não enviamos coverUrl.
  const coverUrl = $("#events-cover-url").value.trim();
  const originalCover = $("#events-cover-url").dataset.original || "";

  if (!file && (!coverUrl || coverUrl === originalCover)) {
    formData.delete("coverUrl");
  } else if (coverUrl) {
    formData.set("coverUrl", coverUrl);
  } else {
    formData.delete("coverUrl");
  }

  if (scheduledAt) {
    formData.set("scheduledAt", new Date(scheduledAt).toISOString());
  } else {
    formData.delete("scheduledAt");
  }

  submitButton.disabled = true;
  submitButton.textContent = id ? "A guardar alterações..." : "A guardar...";

  try {
    if (id) {
      await updateEvent(id, formData);
      showToast("Evento actualizado com sucesso.");
    } else {
      await createEvent(formData);
      showToast("Evento criado com sucesso.");
    }

    setModal("events-form-modal", false);
    await loadEvents();
  } catch (error) {
    errorBox.textContent =
      error.message || "Não foi possível guardar o evento.";
    errorBox.hidden = false;
    showToast("Não foi possível guardar o evento.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = id ? "Guardar alterações" : "Guardar evento";
  }
}

async function confirmDelete() {
  if (!deleteTarget) return;

  const button = $("#events-confirm-delete");
  button.disabled = true;
  button.textContent = "A eliminar...";

  try {
    await deleteEvent(deleteTarget.id);
    setModal("events-delete-modal", false);
    setModal("events-view-modal", false);
    showToast("Evento eliminado com sucesso.");
    deleteTarget = null;
    selectedEvent = null;
    await loadEvents();
  } catch (error) {
    showToast(error.message || "Não foi possível eliminar o evento.", "error");
  } finally {
    button.disabled = false;
    button.textContent = "Sim, eliminar";
  }
}

function handleClick(event) {
  const closeButton = event.target.closest("[data-event-close]");
  if (closeButton) {
    setModal(`events-${closeButton.dataset.eventClose}-modal`, false);
    return;
  }

  const button = event.target.closest("[data-event-action]");
  if (!button || !activeRoot?.contains(button)) return;

  const action = button.dataset.eventAction;
  const id = button.dataset.eventId;

  if (action === "new") openNewEvent();
  if (action === "retry") loadEvents();

  if (action === "clear-filters") {
    $("#events-search-input").value = "";
    $("#events-status-filter").value = "all";
    $("#events-date-filter").value = "";
    applyFilters();
  }

  if (action === "view") openViewEvent(id);
  if (action === "edit") openEditEvent(id);
  if (action === "delete") openDeleteConfirmation(id);
  if (action === "delete-viewed" && selectedEvent) {
    openDeleteConfirmation(selectedEvent.id);
  }
  if (action === "edit-viewed" && selectedEvent) {
    const idToEdit = selectedEvent.id;
    setModal("events-view-modal", false);
    openEditEvent(idToEdit);
  }

  if (action === "remove-preview") {
    $("#events-cover-file").value = "";
    $("#events-cover-url").value = "";
    $("#events-cover-url").dataset.original = "";
    showCoverPreview("");
  }
}

function initPage(root) {
  if (!root || root.dataset.eventsReady === "true") return;

  root.dataset.eventsReady = "true";
  activeRoot = root;

  root.addEventListener("click", handleClick);
  root.addEventListener("input", event => {
    if (event.target.matches("#events-search-input")) applyFilters();
  });

  root.addEventListener("change", event => {
    if (event.target.matches(
      "#events-status-filter, #events-date-filter"
    )) {
      applyFilters();
    }

    if (event.target.matches("#events-status")) {
      $("#events-scheduled-field").hidden =
        event.target.value !== "SCHEDULED";
    }

    if (event.target.matches("#events-cover-file")) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => showCoverPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }

    if (event.target.matches("#events-cover-url")) {
      const url = event.target.value.trim();
      if (url) showCoverPreview(url);
    }
  });

  root.addEventListener("submit", event => {
    if (event.target.matches("#events-form")) {
      submitEvent(event);
    }
  });

  $("#events-confirm-delete").addEventListener("click", confirmDelete);

  loadEvents();
}

function observePage() {
  const root = document.querySelector(".events-page");

  if (root && root !== activeRoot) {
    activeRoot = root;
    initPage(root);
    return;
  }

  if (!root && activeRoot && !activeRoot.isConnected) {
    activeRoot = null;
    allEvents = [];
    selectedEvent = null;
  }
}

function startController() {
  if (initialized) return;
  initialized = true;

  observePage();

  const observer = new MutationObserver(observePage);
  observer.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !activeRoot) return;

    for (const id of [
      "events-form-modal",
      "events-view-modal",
      "events-delete-modal"
    ]) {
      const modal = $(`#${id}`);
      if (modal && !modal.hidden) {
        setModal(id.replace("events-", "").replace("-modal", ""), false);
        break;
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startController, { once: true });
} else {
  startController();
}
