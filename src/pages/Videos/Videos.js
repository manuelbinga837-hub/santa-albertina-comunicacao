import { getVideos, createVideo, deleteVideo } from "../../services/videos.js";

let videosCache = [];
let activeObjectUrl = null;

const esc = (value = "") => String(value).replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

const statusLabel = status => ({
  PUBLISHED: "Publicado", DRAFT: "Rascunho", SCHEDULED: "Agendado"
}[status] || status || "Sem estado");

const visibilityLabel = value => ({
  SITE_ONLY: "Site público", APP_ONLY: "Aplicação",
  SITE_AND_APP: "Site e aplicação", INTERNAL: "Interno"
}[value] || value || "Site e aplicação");

function videoUrl(video) {
  return video.video_url || video.videoUrl || "";
}

function videoTitle(video) {
  return video.title || video.publication_title || "Vídeo sem título";
}

function videoStatus(video) {
  return video.publication_status || video.status || "DRAFT";
}

function dateLabel(video) {
  const raw = video.published_at || video.created_at;
  if (!raw) return "Data não disponível";
  const date = new Date(raw);
  return Number.isNaN(date.getTime())
    ? "Data não disponível"
    : date.toLocaleDateString("pt-PT");
}

function card(video) {
  const url = videoUrl(video);
  const thumbnail = video.thumbnail_url || video.cover_url || video.thumbnailUrl || "";
  const status = videoStatus(video);
  const playable = url && /^https?:\/\//i.test(url);

  return `
    <article class="video-card">
      <div class="video-card__media">
        ${playable
          ? `<video class="video-card__inline-player" controls preload="metadata"
                ${thumbnail ? `poster="${esc(thumbnail)}"` : ""}
                src="${esc(url)}"
                aria-label="Reproduzir ${esc(videoTitle(video))}">
                O teu navegador não suporta a reprodução deste vídeo.
             </video>`
          : thumbnail
            ? `<img src="${esc(thumbnail)}" alt="" loading="lazy">`
            : `<div class="video-card__placeholder"><span>▶</span><small>Vídeo</small></div>`}
        <span class="video-badge video-badge--${esc(status.toLowerCase())}">${esc(statusLabel(status))}</span>
      </div>
      <div class="video-card__body">
        <h3>${esc(videoTitle(video))}</h3>
        <p>${esc(video.description || video.summary || "Sem descrição.")}</p>
        <div class="video-card__meta">
          <span>${esc(dateLabel(video))}</span>
          <span>${esc(visibilityLabel(video.visibility))}</span>
        </div>
        <div class="video-card__actions">
          <button type="button" class="video-button video-button--secondary"
            data-video-preview="${esc(video.id)}">Pré-visualizar</button>
          <button type="button" class="video-button video-button--secondary"
            data-video-edit="${esc(video.id)}">Editar</button>
          <button type="button" class="video-button video-button--danger"
            data-video-delete="${esc(video.id)}">Eliminar</button>
        </div>
        <div class="video-card__player" data-player="${esc(video.id)}" hidden>
          ${playable
            ? `<video controls preload="metadata" src="${esc(url)}"></video>`
            : `<p>Este vídeo não tem um endereço de reprodução válido.</p>`}
        </div>
      </div>
    </article>`;
}

export function Videos() {
  return `
    <section class="videos-page">
      <header class="videos-hero">
        <div class="videos-hero__pattern" aria-hidden="true"></div>
        <div class="videos-hero__content">
          <span class="videos-eyebrow">SANTA ALBERTINA · COMUNICAÇÃO</span>
          <h1>Central de Vídeos</h1>
          <p>Organize os vídeos da escola e prepare conteúdos para o site público e a aplicação.</p>
          <button type="button" class="video-button video-button--light" data-open-video-modal>+ Adicionar vídeo</button>
        </div>
        <div class="videos-hero__icon" aria-hidden="true">▶</div>
      </header>

      <section class="videos-stats" aria-label="Resumo dos vídeos">
        <article><span>Total de vídeos</span><strong id="videos-total">—</strong><small>Na biblioteca</small></article>
        <article><span>Publicados</span><strong id="videos-published">—</strong><small>Disponíveis conforme a visibilidade</small></article>
        <article><span>Rascunhos</span><strong id="videos-drafts">—</strong><small>Por finalizar</small></article>
        <article><span>Agendados</span><strong id="videos-scheduled">—</strong><small>Com publicação programada</small></article>
      </section>

      <section class="video-modal" id="video-editor" aria-hidden="true" hidden>
        <div class="video-modal__backdrop" data-close-video-modal></div>
        <div class="video-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="video-modal-title">
        <div class="videos-section-heading">
          <div><span class="videos-eyebrow">NOVO CONTEÚDO</span><h2 id="video-modal-title">Adicionar vídeo</h2>
            <p>Carregue um ficheiro ou indique o endereço de um vídeo online.</p></div>
          <button type="button" class="video-modal__close" data-close-video-modal aria-label="Fechar">×</button>
        </div>

        <div class="video-feedback" id="video-feedback" role="status" aria-live="polite" hidden></div>

        <form id="video-form" class="video-form">
          <div class="video-form__fields">
            <label class="video-field video-field--wide">Título do vídeo *
              <input name="title" required minlength="2" maxlength="200" placeholder="Ex.: Actividades escolares">
            </label>
            <label class="video-field video-field--wide">Descrição
              <textarea name="description" maxlength="1000" rows="3" placeholder="Descreva brevemente o vídeo"></textarea>
            </label>

            <fieldset class="video-source video-field--wide">
              <legend>Origem do vídeo *</legend>
              <label class="video-source__option">
                <input type="radio" name="sourceType" value="file" checked>
                <span><strong>Carregar ficheiro</strong><small>MP4, WebM, OGG ou MOV</small></span>
              </label>
              <label class="video-source__option">
                <input type="radio" name="sourceType" value="url">
                <span><strong>Usar endereço URL</strong><small>Link directo para o vídeo</small></span>
              </label>
            </fieldset>

            <label class="video-field video-field--wide" id="video-file-field">Ficheiro de vídeo *
              <input type="file" id="video-file" name="videoFile" accept="video/mp4,video/webm,video/ogg,video/quicktime">
              <small>Limite do servidor: 200 MB. A reprodução depende do formato e do navegador.</small>
            </label>
            <label class="video-field video-field--wide" id="video-url-field" hidden>Endereço do vídeo *
              <input type="url" name="videoUrl" placeholder="https://...">
              <small>Utilize um URL directo para um ficheiro de vídeo. Links de páginas do YouTube não são URLs directos de ficheiro.</small>
            </label>

            <label class="video-field video-field--wide">URL da miniatura (opcional)
              <input type="url" name="thumbnailUrl" placeholder="https://...">
            </label>
            <label class="video-field">Onde mostrar?
              <select name="visibility">
                <option value="SITE_AND_APP">Site e aplicação</option>
                <option value="SITE_ONLY">Apenas site público</option>
                <option value="APP_ONLY">Apenas aplicação</option>
                <option value="INTERNAL">Interno</option>
              </select>
            </label>
            <label class="video-field">Estado
              <select name="status" id="video-status">
                <option value="DRAFT">Guardar como rascunho</option>
                <option value="PUBLISHED">Publicar agora</option>
                <option value="SCHEDULED">Agendar publicação</option>
              </select>
            </label>
            <label class="video-field video-field--wide" id="video-schedule-field" hidden>Data e hora da publicação
              <input type="datetime-local" name="scheduledAt" id="video-scheduled-at">
            </label>
          </div>

          <section class="video-preview" id="video-preview">
            <div class="video-preview__empty"><span>▶</span><strong>Pré-visualização</strong>
              <p>Escolha um ficheiro para o pré-visualizar antes de publicar.</p></div>
          </section>

          <div class="video-form__footer">
            <span>* Campos obrigatórios</span>
            <div>
              <button type="reset" class="video-button video-button--secondary" id="video-cancel">Limpar</button>
              <button type="submit" class="video-button video-button--primary" data-submit-status="DRAFT">Guardar rascunho</button>
              <button type="submit" class="video-button video-button--publish" data-submit-status="PUBLISHED">Publicar vídeo</button>
            </div>
          </div>
        </form>
        </div>
      </section>

      <div class="video-confirm-modal" id="video-delete-modal" hidden aria-hidden="true">
        <div class="video-confirm-modal__backdrop" data-close-delete-modal></div>
        <div class="video-confirm-modal__dialog"
             role="dialog"
             aria-modal="true"
             aria-labelledby="video-delete-title">
          <div class="video-confirm-modal__icon">!</div>
          <h2 id="video-delete-title">Eliminar vídeo?</h2>
          <p id="video-delete-message">
            Tens a certeza que queres eliminar este vídeo? Esta ação não pode ser desfeita.
          </p>
          <div class="video-confirm-modal__actions">
            <button type="button"
                    class="video-button video-button--secondary"
                    data-close-delete-modal>
              Cancelar
            </button>
            <button type="button"
                    class="video-button video-button--danger"
                    id="confirm-video-delete">
              Eliminar vídeo
            </button>
          </div>
        </div>
      </div>

      <section class="video-library" id="video-library">
        <div class="videos-section-heading">
          <div><span class="videos-eyebrow">CONTEÚDO GUARDADO</span><h2>Biblioteca de vídeos</h2>
            <p>Consulte e organize as publicações existentes.</p></div>
          <button type="button" id="videos-refresh" class="video-button video-button--secondary">Actualizar</button>
        </div>
        <div class="video-library__filters">
          <label class="video-field">Pesquisar
            <input type="search" id="videos-search" placeholder="Pesquisar por título...">
          </label>
          <label class="video-field">Filtrar por estado
            <select id="videos-filter">
              <option value="ALL">Todos os estados</option>
              <option value="PUBLISHED">Publicados</option>
              <option value="DRAFT">Rascunhos</option>
              <option value="SCHEDULED">Agendados</option>
            </select>
          </label>
          <span id="videos-results-count" aria-live="polite"></span>
        </div>
        <div class="videos-grid" id="videos-grid">
          <div class="videos-empty">A carregar vídeos...</div>
        </div>
      </section>
    </section>`;
}

export function setupVideosPage() {
  const form = document.querySelector("#video-form");
  const fileInput = document.querySelector("#video-file");
  const preview = document.querySelector("#video-preview");
  const feedback = document.querySelector("#video-feedback");
  if (!form || form.dataset.initialized === "true") return;
  form.dataset.initialized = "true";

  const modal = document.querySelector("#video-editor");
  const openModalButton = document.querySelector("[data-open-video-modal]");
  const closeModalButtons = modal.querySelectorAll("[data-close-video-modal]");

  function openVideoModal() {
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector("input[name='title']")?.focus();
  }

  function closeVideoModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openModalButton?.addEventListener("click", openVideoModal);
  closeModalButtons.forEach(button =>
    button.addEventListener("click", closeVideoModal)
  );

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) closeVideoModal();
  });


  const showMessage = (message, type = "info") => {
    feedback.textContent = message;
    feedback.className = `video-feedback video-feedback--${type}`;
    feedback.hidden = false;
  };

  const sourceType = () => form.querySelector('input[name="sourceType"]:checked')?.value || "file";

  function updateSourceFields() {
    const isFile = sourceType() === "file";
    document.querySelector("#video-file-field").hidden = !isFile;
    document.querySelector("#video-url-field").hidden = isFile;
    fileInput.required = isFile;
    form.elements.videoUrl.required = !isFile;
    updatePreview();
  }

  function updatePreview() {
    if (activeObjectUrl) {
      URL.revokeObjectURL(activeObjectUrl);
      activeObjectUrl = null;
    }
    const file = fileInput.files?.[0];
    const url = sourceType() === "url" ? form.elements.videoUrl.value.trim() : "";
    if (sourceType() === "file" && file) {
      activeObjectUrl = URL.createObjectURL(file);
      preview.innerHTML = `<video controls preload="metadata" src="${activeObjectUrl}"></video>
        <p>${esc(file.name)} · ${(file.size / (1024 * 1024)).toFixed(1)} MB</p>`;
    } else if (url && /^https?:\/\//i.test(url)) {
      preview.innerHTML = `<video controls preload="metadata" src="${esc(url)}"></video>
        <p>Pré-visualização do endereço indicado. Alguns sites não permitem reprodução directa.</p>`;
    } else {
      preview.innerHTML = `<div class="video-preview__empty"><span>▶</span><strong>Pré-visualização</strong>
        <p>Escolha um ficheiro ou introduza um URL directo para o vídeo.</p></div>`;
    }
  }

  function renderLibrary(items = videosCache) {
    const grid = document.querySelector("#videos-grid");
    const query = document.querySelector("#videos-search").value.trim().toLowerCase();
    const status = document.querySelector("#videos-filter").value;
    const filtered = items.filter(v =>
      videoTitle(v).toLowerCase().includes(query) &&
      (status === "ALL" || videoStatus(v) === status)
    );
    document.querySelector("#videos-results-count").textContent =
      `${filtered.length} ${filtered.length === 1 ? "vídeo" : "vídeos"}`;

    grid.innerHTML = filtered.length
      ? filtered.map(card).join("")
      : `<div class="videos-empty">Não foram encontrados vídeos com estes critérios.</div>`;

    grid.querySelectorAll("[data-video-preview]").forEach(button => {
      button.addEventListener("click", () => {
        const player = grid.querySelector(`[data-player="${CSS.escape(button.dataset.videoPreview)}"]`);
        if (!player) return;
        player.hidden = !player.hidden;
        if (!player.hidden) player.querySelector("video")?.play().catch(() => {});
        else player.querySelector("video")?.pause();
      });
    });

    grid.querySelectorAll("[data-video-edit]").forEach(button => {
      button.addEventListener("click", () => {
        const item = videosCache.find(v => String(v.id) === button.dataset.videoEdit);
        if (!item) return;

        form.elements.title.value = videoTitle(item);
        form.elements.description.value = item.description || item.summary || "";
        form.elements.thumbnailUrl.value =
          item.thumbnail_url || item.cover_url || item.thumbnailUrl || "";
        form.elements.visibility.value = item.visibility || "SITE_AND_APP";
        document.querySelector("#video-status").value = videoStatus(item);

        const scheduled = videoStatus(item) === "SCHEDULED";
        document.querySelector("#video-schedule-field").hidden = !scheduled;

        modal.dataset.editingId = String(item.id);

        document.querySelector("#video-modal-title").textContent = "Editar vídeo";
        modal.querySelector(".videos-eyebrow").textContent = "EDITAR CONTEÚDO";

        openVideoModal();
      });
    });

    grid.querySelectorAll("[data-video-delete]").forEach(button => {
      button.addEventListener("click", () => {
        const item = videosCache.find(v => String(v.id) === button.dataset.videoDelete);
        if (!item) return;

        const deleteModal = document.querySelector("#video-delete-modal");
        const message = document.querySelector("#video-delete-message");

        message.textContent =
          `Tens a certeza que queres eliminar "${videoTitle(item)}"? Esta ação não pode ser desfeita.`;

        deleteModal.dataset.videoId = String(item.id);
        deleteModal.hidden = false;
        deleteModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });
    });
  }

  const deleteModal = document.querySelector("#video-delete-modal");
  const confirmDeleteButton = document.querySelector("#confirm-video-delete");

  function closeDeleteModal() {
    deleteModal.hidden = true;
    deleteModal.setAttribute("aria-hidden", "true");
    deleteModal.dataset.videoId = "";
    document.body.style.overflow = "";
  }

  deleteModal?.querySelectorAll("[data-close-delete-modal]").forEach(button => {
    button.addEventListener("click", closeDeleteModal);
  });

  confirmDeleteButton?.addEventListener("click", async () => {
    const id = deleteModal.dataset.videoId;
    const item = videosCache.find(v => String(v.id) === String(id));

    if (!item) {
      closeDeleteModal();
      return;
    }

    confirmDeleteButton.disabled = true;

    try {
      await deleteVideo(item.id);
      closeDeleteModal();
      showMessage("Vídeo eliminado com sucesso.", "success");
      await loadLibrary();
    } catch (error) {
      showMessage(
        error.message || "Não foi possível eliminar o vídeo.",
        "error"
      );
    } finally {
      confirmDeleteButton.disabled = false;
    }
  });


  async function loadLibrary() {
    const grid = document.querySelector("#videos-grid");
    grid.innerHTML = `<div class="videos-empty">A carregar biblioteca...</div>`;
    try {
      videosCache = await getVideos();
      document.querySelector("#videos-total").textContent = videosCache.length;
      document.querySelector("#videos-published").textContent =
        videosCache.filter(v => videoStatus(v) === "PUBLISHED").length;
      document.querySelector("#videos-drafts").textContent =
        videosCache.filter(v => videoStatus(v) === "DRAFT").length;
      document.querySelector("#videos-scheduled").textContent =
        videosCache.filter(v => videoStatus(v) === "SCHEDULED").length;
      renderLibrary();
    } catch (error) {
      grid.innerHTML = `<div class="videos-empty videos-empty--error">
        <strong>Não foi possível carregar os vídeos.</strong>
        <p>${esc(error.message || "Confirme se o backend está ligado e se a sessão continua válida.")}</p>
        </div>`;
      showMessage(error.message || "Erro ao carregar a biblioteca.", "error");
      ["videos-total", "videos-published", "videos-drafts", "videos-scheduled"]
        .forEach(id => document.getElementById(id).textContent = "—");
    }
  }

  form.querySelectorAll('input[name="sourceType"]').forEach(input =>
    input.addEventListener("change", updateSourceFields)
  );
  fileInput.addEventListener("change", updatePreview);
  form.elements.videoUrl.addEventListener("input", updatePreview);
  document.querySelector("#video-status").addEventListener("change", () => {
    const scheduled = document.querySelector("#video-status").value === "SCHEDULED";
    document.querySelector("#video-schedule-field").hidden = !scheduled;
    form.elements.scheduledAt.required = scheduled;
  });

  form.addEventListener("reset", () => {
    setTimeout(() => {
      updateSourceFields();
      document.querySelector("#video-schedule-field").hidden = true;
      feedback.hidden = true;
    }, 0);
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const submitter = event.submitter;
    const status = submitter?.dataset.submitStatus ||
      document.querySelector("#video-status").value;
    const source = sourceType();
    const file = source === "file" ? fileInput.files?.[0] : null;
    const url = form.elements.videoUrl.value.trim();

    if (source === "file" && !file) {
      showMessage("Escolha um ficheiro de vídeo.", "error");
      return;
    }
    if (source === "url" && !url) {
      showMessage("Introduza o endereço do vídeo.", "error");
      return;
    }
    if (file && file.size > 200 * 1024 * 1024) {
      showMessage("O ficheiro excede o limite de 200 MB.", "error");
      return;
    }

    const scheduledAt = form.elements.scheduledAt.value;
    if (status === "SCHEDULED" && !scheduledAt) {
      showMessage("Escolha a data e a hora de publicação.", "error");
      return;
    }

    const data = {
      title: form.elements.title.value.trim(),
      description: form.elements.description.value.trim(),
      thumbnailUrl: form.elements.thumbnailUrl.value.trim(),
      visibility: form.elements.visibility.value,
      status,
      ...(source === "url" ? { videoUrl: url } : {}),
      ...(status === "SCHEDULED" ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}),
      ...(status === "PUBLISHED" ? { publishedAt: new Date().toISOString() } : {})
    };

    const buttons = [...form.querySelectorAll('button[type="submit"]')];
    buttons.forEach(button => button.disabled = true);
    showMessage(file ? "A enviar o vídeo. Aguarde a conclusão do carregamento..." : "A guardar vídeo...", "info");

    try {
      await createVideo(data, file);
      showMessage(
        status === "PUBLISHED" ? "Vídeo publicado com sucesso." :
        status === "SCHEDULED" ? "Vídeo agendado com sucesso." :
        "Rascunho guardado com sucesso.",
        "success"
      );
      form.reset();
      closeVideoModal();
      await loadLibrary();
    } catch (error) {
      showMessage(error.message || "Não foi possível guardar o vídeo.", "error");
    } finally {
      buttons.forEach(button => button.disabled = false);
    }
  });

  document.querySelector("#videos-search").addEventListener("input", () => renderLibrary());
  document.querySelector("#videos-filter").addEventListener("change", () => renderLibrary());
  document.querySelector("#videos-refresh").addEventListener("click", loadLibrary);

  updateSourceFields();
  loadLibrary();
}
