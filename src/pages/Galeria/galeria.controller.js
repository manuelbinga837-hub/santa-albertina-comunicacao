import {
  getAlbums,
  createAlbum,
  deleteAlbum,
  getAlbumPhotos,
  addPhoto,
  uploadAlbumPhotos,
  deletePhoto
} from "../../services/gallery.js";

let activeRoot = null;
let albums = [];
let selectedAlbum = null;
let photos = [];
let initialized = false;
let toastTimer;
let pendingDeleteAction = null;

const API_ORIGIN = "http://localhost:3000";

function $(selector) {
  return activeRoot?.querySelector(selector);
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

function getValue(item, ...keys) {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }
  return "";
}

function normalizeAlbum(item = {}) {
  const status = String(getValue(
    item, "status", "publication_status", "publicationStatus"
  ) || "DRAFT").toUpperCase();

  let cover = getValue(item, "coverUrl", "cover_url", "cover");

  if (cover && String(cover).startsWith("/")) {
    cover = `${API_ORIGIN}${cover}`;
  }

  return {
    ...item,
    id: getValue(item, "id", "albumId", "album_id"),
    title: getValue(item, "title") || "Álbum sem título",
    summary: getValue(item, "summary"),
    description: getValue(item, "description", "content"),
    coverUrl: cover,
    status,
    visibility: getValue(item, "visibility") || "SITE_AND_APP",
    createdAt: getValue(item, "createdAt", "created_at"),
    publishedAt: getValue(item, "publishedAt", "published_at"),
    scheduledAt: getValue(item, "scheduledAt", "scheduled_at")
  };
}

function normalizePhoto(item = {}) {
  let url = getValue(item, "url", "photoUrl", "photo_url");

  if (url && String(url).startsWith("/")) {
    url = `${API_ORIGIN}${url}`;
  }

  return {
    ...item,
    id: getValue(item, "id", "photoId", "photo_id"),
    albumId: getValue(item, "albumId", "album_id"),
    url,
    caption: getValue(item, "caption"),
    sortOrder: getValue(item, "sortOrder", "sort_order") || 0
  };
}

function statusLabel(status) {
  return ({
    PUBLISHED: "Publicado",
    SCHEDULED: "Agendado",
    DRAFT: "Rascunho"
  })[status] || status;
}

function formatDate(value) {
  if (!value) return "";

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("pt-PT");
}

function showToast(message, error = false) {
  const toast = $("#gallery-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.hidden = false;
  toast.style.borderColor = error
    ? "rgba(248,113,113,.4)"
    : "rgba(74,222,128,.3)";
  toast.style.background = error ? "#30191c" : "#14251d";
  toast.style.color = error ? "#fecaca" : "#bbf7d0";

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    if (toast.isConnected) toast.hidden = true;
  }, 3500);
}

function showFormError(selector, message = "") {
  const element = $(selector);
  if (!element) return;

  element.textContent = message;
  element.hidden = !message;
}

function setModal(id, open) {
  const modal = $(`#${id}`);
  if (modal) modal.hidden = !open;

  document.body.classList.toggle(
    "gallery-modal-open",
    Boolean(activeRoot?.querySelector(".gallery-modal:not([hidden])"))
  );
}

function requestDeleteConfirmation(type, item, button) {
  pendingDeleteAction = { type, item, button };

  const title = type === "album"
    ? "Eliminar álbum"
    : "Eliminar fotografia";

  const message = type === "album"
    ? `Tens a certeza de que desejas eliminar o álbum "${item.title}"? Esta acção não pode ser desfeita.`
    : "Tens a certeza de que desejas eliminar esta fotografia? Esta acção não pode ser desfeita.";

  $("#gallery-delete-confirm-title").textContent = title;
  $("#gallery-delete-confirm-message").textContent = message;
  setModal("gallery-delete-confirm-modal", true);
}

function updateStats() {
  $("#gallery-stat-total").textContent = albums.length;

  $("#gallery-stat-published").textContent =
    albums.filter(album => album.status === "PUBLISHED").length;

  $("#gallery-stat-scheduled").textContent =
    albums.filter(album => album.status === "SCHEDULED").length;

  $("#gallery-stat-photos").textContent = "…";
}

function renderCard(album) {
  const cover = album.coverUrl
    ? `<img src="${escapeHTML(album.coverUrl)}"
        alt="${escapeHTML(album.title)}" loading="lazy"
        onerror="this.style.display='none'">`
    : `<div class="gallery-card-placeholder">▧</div>`;

  const count = Array.isArray(album.photos) ? album.photos.length : null;

  return `
    <article class="gallery-card">
      <div class="gallery-card-cover">
        ${cover}
        <span class="gallery-status gallery-status-${escapeHTML(album.status.toLowerCase())}">
          ${escapeHTML(statusLabel(album.status))}
        </span>
      </div>

      <div class="gallery-card-body">
        <h3>${escapeHTML(album.title)}</h3>
        <p>${escapeHTML(album.summary || album.description || "Sem descrição.")}</p>

        <div class="gallery-card-footer">
          <span class="gallery-photo-count">
            ${count === null ? "Álbum de fotografias" :
              `${count} fotografia${count === 1 ? "" : "s"}`}
            ${album.createdAt ? ` · ${escapeHTML(formatDate(album.createdAt))}` : ""}
          </span>

          <div class="gallery-card-actions">
            <button type="button" class="gallery-small-button"
              data-gallery-action="open-album"
              data-album-id="${escapeHTML(album.id)}">
              Abrir álbum
            </button>
            <button type="button" class="gallery-small-button danger"
              data-gallery-action="delete-album"
              data-album-id="${escapeHTML(album.id)}">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderAlbums() {
  const grid = $("#gallery-grid");
  const empty = $("#gallery-empty");
  const noResults = $("#gallery-no-results");

  if (!grid) return;

  const search = ($("#gallery-search-input")?.value || "")
    .trim().toLocaleLowerCase("pt");

  const status = $("#gallery-status-filter")?.value || "all";

  const filtered = albums.filter(album => {
    const matchesSearch = `${album.title} ${album.summary} ${album.description}`
      .toLocaleLowerCase("pt").includes(search);

    const matchesStatus = status === "all" || album.status === status;

    return matchesSearch && matchesStatus;
  });

  grid.innerHTML = filtered.map(renderCard).join("");
  grid.hidden = filtered.length === 0;
  empty.hidden = albums.length !== 0;
  noResults.hidden = albums.length === 0 || filtered.length !== 0;

  $("#gallery-results-count").textContent =
    `${filtered.length} álbum${filtered.length === 1 ? "" : "s"}`;
}

async function refreshPhotoCount() {
  let total = 0;

  for (const album of albums) {
    try {
      const items = await getAlbumPhotos(album.id);
      total += items.length;
    } catch {
      // Mantém a listagem de álbuns mesmo que um álbum não possa ser consultado.
    }
  }

  const element = $("#gallery-stat-photos");
  if (element) element.textContent = total;
}

async function loadAlbums() {
  const loading = $("#gallery-loading");
  const error = $("#gallery-error");

  if (loading) loading.hidden = false;
  if (error) error.hidden = true;

  try {
    albums = (await getAlbums()).map(normalizeAlbum);
    updateStats();
    renderAlbums();

    if (loading) loading.hidden = true;

    await refreshPhotoCount();
  } catch (err) {
    if (loading) loading.hidden = true;
    if (error) error.hidden = false;

    $("#gallery-error-message").textContent =
      err.message || "Verifica a ligação ao servidor e tenta novamente.";
  }
}

async function openAlbum(id) {
  const album = albums.find(item => String(item.id) === String(id));
  if (!album) return;

  selectedAlbum = album;

  const detail = $("#gallery-detail");
  detail.hidden = false;

  $("#gallery-detail-title").textContent = album.title;
  $("#gallery-detail-description").textContent =
    album.description || album.summary || "Sem descrição.";

  $("#gallery-photo-error").hidden = true;
  $("#gallery-photos-grid").innerHTML =
    '<p class="gallery-photo-count">A carregar fotografias...</p>';

  detail.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    photos = (await getAlbumPhotos(id)).map(normalizePhoto);
    renderPhotos();
  } catch (err) {
    $("#gallery-photos-grid").innerHTML = "";
    $("#gallery-photo-error").hidden = false;
    $("#gallery-photo-error").textContent =
      err.message || "Não foi possível carregar as fotografias.";
  }
}

function renderPhotos() {
  const grid = $("#gallery-photos-grid");

  if (!photos.length) {
    grid.innerHTML = `
      <div class="gallery-empty">
        <span>▧</span>
        <h3>Este álbum ainda não tem fotografias</h3>
        <p>Adiciona a primeira fotografia para começar a preencher o álbum.</p>
        <button type="button" class="gallery-primary-button"
          data-gallery-action="new-photo">＋ Adicionar fotografia</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = photos.map(photo => `
    <article class="gallery-photo-card">
      <img src="${escapeHTML(photo.url)}"
        alt="${escapeHTML(photo.caption || selectedAlbum.title)}"
        loading="lazy">
      <div class="gallery-photo-info">
        <p>${escapeHTML(photo.caption || "Sem legenda")}</p>
        <button type="button" class="gallery-small-button danger"
          data-gallery-action="delete-photo"
          data-photo-id="${escapeHTML(photo.id)}">
          Eliminar
        </button>
      </div>
    </article>
  `).join("");
}

function closeAlbum() {
  selectedAlbum = null;
  photos = [];
  $("#gallery-detail").hidden = true;
  $("#gallery-list-section");
}

function toISODateTime(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

async function submitAlbum(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const status = String(data.get("status") || "DRAFT");

  const payload = {
    title,
    summary: String(data.get("summary") || "").trim(),
    description: String(data.get("description") || "").trim(),
    coverUrl: String(data.get("coverUrl") || "").trim(),
    visibility: String(data.get("visibility") || "SITE_AND_APP"),
    status
  };

  if (!title || title.length < 2) {
    showFormError("#gallery-album-form-error", "Introduz um título com pelo menos 2 caracteres.");
    return;
  }

  if (status === "SCHEDULED") {
    const scheduledAt = toISODateTime(data.get("scheduledAt"));

    if (!scheduledAt) {
      showFormError("#gallery-album-form-error", "Escolhe a data e hora da publicação.");
      return;
    }

    payload.scheduledAt = scheduledAt;
  }

  if (status === "PUBLISHED") {
    payload.publishedAt = new Date().toISOString();
  }

  const button = $("#gallery-album-submit");
  button.disabled = true;
  button.textContent = "A criar...";

  showFormError("#gallery-album-form-error");

  try {
    await createAlbum(payload);

    setModal("gallery-album-modal", false);
    form.reset();

    showToast("Álbum criado com sucesso.");
    await loadAlbums();
  } catch (err) {
    showFormError(
      "#gallery-album-form-error",
      err.message || "Não foi possível criar o álbum."
    );
  } finally {
    button.disabled = false;
    button.textContent = "Criar álbum";
  }
}

async function submitPhoto(event) {
  event.preventDefault();

  if (!selectedAlbum) {
    showFormError(
      "#gallery-photo-form-error",
      "Abre um álbum antes de adicionar fotografias."
    );
    return;
  }

  const form = event.currentTarget;
  const fileInput = form.elements.namedItem("photoFiles");
  const files = Array.from(fileInput?.files || []);
  const data = new FormData(form);

  const url = String(data.get("url") || "").trim();
  const caption = String(data.get("caption") || "").trim();
  const sortOrder = Number(data.get("sortOrder") || 0);

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  if (files.length > 10) {
    showFormError(
      "#gallery-photo-form-error",
      "Podes enviar no máximo 10 fotografias de cada vez."
    );
    return;
  }

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      showFormError(
        "#gallery-photo-form-error",
        `O ficheiro "${file.name}" não tem um formato de imagem permitido.`
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showFormError(
        "#gallery-photo-form-error",
        `A fotografia "${file.name}" ultrapassa o limite de 5 MB.`
      );
      return;
    }
  }

  if (files.length === 0) {
    try {
      const parsedUrl = new URL(url);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("URL inválido");
      }
    } catch {
      showFormError(
        "#gallery-photo-form-error",
        "Escolhe pelo menos uma fotografia ou introduz um URL válido."
      );
      return;
    }
  }

  const button = $("#gallery-photo-submit");
  button.disabled = true;
  button.textContent = files.length ? "A enviar fotografias..." : "A adicionar...";
  showFormError("#gallery-photo-form-error");

  try {
    if (files.length > 0) {
      const payload = new FormData();

      payload.append("albumId", String(selectedAlbum.id));
      payload.append("caption", caption);
      payload.append("sortOrder", String(sortOrder));

      for (const file of files) {
        payload.append("photoFiles", file);
      }

      await uploadAlbumPhotos(payload);
    } else {
      await addPhoto({
        albumId: Number(selectedAlbum.id),
        url,
        caption,
        sortOrder
      });
    }

    const albumId = selectedAlbum.id;

    setModal("gallery-photo-modal", false);
    form.reset();

    const urlPreview = $("#gallery-photo-preview");
    const urlPreviewImage = $("#gallery-photo-preview-image");
    const localPreviews = $("#gallery-local-previews");

    if (urlPreview) {
      urlPreview.hidden = true;
    }

    if (urlPreviewImage) {
      urlPreviewImage.removeAttribute("src");
    }

    if (localPreviews) {
      localPreviews.querySelectorAll("img[data-object-url]").forEach(img => {
        URL.revokeObjectURL(img.dataset.objectUrl);
      });

      localPreviews.replaceChildren();
      localPreviews.hidden = true;
    }

    showToast(
      files.length > 1
        ? "Fotografias adicionadas com sucesso."
        : "Fotografia adicionada com sucesso."
    );

    await openAlbum(albumId);
    await refreshPhotoCount();
  } catch (err) {
    showFormError(
      "#gallery-photo-form-error",
      err.message || "Não foi possível adicionar as fotografias."
    );
  } finally {
    button.disabled = false;
    button.textContent = "Adicionar fotografia";
  }
}

async function handleAction(button) {
  const action = button.dataset.galleryAction;

  if (action === "cancel-delete") {
    pendingDeleteAction = null;
    setModal("gallery-delete-confirm-modal", false);
    return;
  }

  if (action === "new-album") {
    showFormError("#gallery-album-form-error");
    setModal("gallery-album-modal", true);
  }

  if (action === "close-album-modal") {
    setModal("gallery-album-modal", false);
  }

  if (action === "close-photo-modal") {
    setModal("gallery-photo-modal", false);
  }

  if (action === "retry") {
    await loadAlbums();
  }

  if (action === "clear-filters") {
    $("#gallery-search-input").value = "";
    $("#gallery-status-filter").value = "all";
    renderAlbums();
  }

  if (action === "open-album") {
    await openAlbum(button.dataset.albumId);
  }

  if (action === "close-album") {
    closeAlbum();
  }

  if (action === "new-photo") {
    if (!selectedAlbum) return;

    showFormError("#gallery-photo-form-error");
    setModal("gallery-photo-modal", true);
  }

  if (action === "delete-album") {
    const album = albums.find(item =>
      String(item.id) === String(button.dataset.albumId)
    );

    if (!album) return;
    requestDeleteConfirmation("album", album, button);
    return;
  }

  if (action === "delete-photo") {
    const photo = photos.find(item =>
      String(item.id) === String(button.dataset.photoId)
    );

    if (!photo) return;
    requestDeleteConfirmation("photo", photo, button);
    return;
  }
}

function initGallery(root) {
  if (initialized && activeRoot === root) return;

  activeRoot = root;
  initialized = true;

  root.addEventListener("click", event => {
    const button = event.target.closest("[data-gallery-action]");

    if (button && root.contains(button)) {
      handleAction(button);
    }
  });

  $("#gallery-search-input").addEventListener("input", renderAlbums);
  $("#gallery-status-filter").addEventListener("change", renderAlbums);
  $("#gallery-album-form").addEventListener("submit", submitAlbum);
  $("#gallery-photo-form").addEventListener("submit", submitPhoto);

  $("#gallery-delete-confirm-button")?.addEventListener("click", async () => {
    const pending = pendingDeleteAction;
    if (!pending) {
      setModal("gallery-delete-confirm-modal", false);
      return;
    }

    const confirmButton = $("#gallery-delete-confirm-button");
    const originalText = confirmButton.textContent;

    confirmButton.disabled = true;
    confirmButton.textContent = "A eliminar...";

    if (pending.button) pending.button.disabled = true;

    try {
      if (pending.type === "album") {
        await deleteAlbum(pending.item.id);

        if (
          selectedAlbum &&
          String(selectedAlbum.id) === String(pending.item.id)
        ) {
          closeAlbum();
        }

        pendingDeleteAction = null;
        setModal("gallery-delete-confirm-modal", false);
        showToast("Álbum eliminado.");
        await loadAlbums();
      } else if (pending.type === "photo") {
        await deletePhoto(pending.item.id);

        pendingDeleteAction = null;
        setModal("gallery-delete-confirm-modal", false);
        showToast("Fotografia eliminada.");

        if (selectedAlbum) {
          await openAlbum(selectedAlbum.id);
          await refreshPhotoCount();
        }
      }
    } catch (err) {
      showToast(err.message || "Não foi possível eliminar o item.", true);

      if (pending.button) pending.button.disabled = false;
    } finally {
      confirmButton.disabled = false;
      confirmButton.textContent = originalText;
    }
  });

  $("#gallery-album-status").addEventListener("change", event => {
    $("#gallery-schedule-field").hidden = event.target.value !== "SCHEDULED";
  });

  const photoUrlInput = $("#gallery-photo-form").elements.namedItem("url");
const photoFileInput = $("#gallery-photo-form").elements.namedItem("photoFiles");

  const choosePhotosButton = document.querySelector("#gallery-choose-photos");
  const selectedPhotosLabel = document.querySelector("#gallery-selected-photos");

  choosePhotosButton?.addEventListener("click", () => {
    photoFileInput.click();
  });

  photoFileInput.addEventListener("change", () => {
    const count = photoFileInput.files?.length || 0;

    if (selectedPhotosLabel) {
      selectedPhotosLabel.textContent = count
        ? count + (count === 1
            ? " fotografia seleccionada."
            : " fotografias seleccionadas.")
        : "Nenhuma fotografia seleccionada.";
    }
  });


photoUrlInput.addEventListener("input", event => {
  const url = event.target.value.trim();
  const hasLocalFiles = Boolean(photoFileInput.files?.length);
  const preview = $("#gallery-photo-preview");
  const image = $("#gallery-photo-preview-image");

  if (!url || hasLocalFiles) {
    preview.hidden = true;
    image.removeAttribute("src");
    return;
  }

  image.src = url;
  preview.hidden = false;
});

photoFileInput.addEventListener("change", event => {
  const files = Array.from(event.target.files || []);
  const container = $("#gallery-local-previews");
  const urlPreview = $("#gallery-photo-preview");
  const urlPreviewImage = $("#gallery-photo-preview-image");

  container.querySelectorAll("img[data-object-url]").forEach(img => {
    URL.revokeObjectURL(img.dataset.objectUrl);
  });

  container.replaceChildren();
  container.hidden = true;
  showFormError("#gallery-photo-form-error");

  if (files.length > 10) {
    event.target.value = "";
    showFormError(
      "#gallery-photo-form-error",
      "Podes escolher no máximo 10 fotografias de cada vez."
    );
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];

  const invalidFile = files.find(file =>
    !allowedTypes.includes(file.type) ||
    file.size > 5 * 1024 * 1024
  );

  if (invalidFile) {
    event.target.value = "";

    showFormError(
      "#gallery-photo-form-error",
      !allowedTypes.includes(invalidFile.type)
        ? `O ficheiro "${invalidFile.name}" não é um formato de imagem permitido.`
        : `A fotografia "${invalidFile.name}" ultrapassa o limite de 5 MB.`
    );

    return;
  }

  if (files.length > 0) {
    urlPreview.hidden = true;
    urlPreviewImage.removeAttribute("src");

    for (const file of files) {
      const objectUrl = URL.createObjectURL(file);
      const item = document.createElement("div");
      item.className = "gallery-local-preview-item";

      const image = document.createElement("img");
      image.src = objectUrl;
      image.alt = file.name;
      image.dataset.objectUrl = objectUrl;

      const name = document.createElement("span");
      name.textContent = file.name;

      item.append(image, name);
      container.appendChild(item);
    }

    container.hidden = false;
  } else {
    const url = photoUrlInput.value.trim();

    if (url) {
      photoUrlInput.dispatchEvent(new Event("input"));
    }
  }
});

$("#gallery-photo-preview-image").addEventListener("error", () => {
  $("#gallery-photo-preview").hidden = true;
});

  loadAlbums();
}

const observer = new MutationObserver(() => {
  const root = document.querySelector(".gallery-page");

  if (root && root !== activeRoot) {
    initialized = false;
    initGallery(root);
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
