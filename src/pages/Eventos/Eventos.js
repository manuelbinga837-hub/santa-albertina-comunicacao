import "./Eventos.css";

export function Eventos() {
  return `
    <main class="events-page">

      <!-- CABEÇALHO PRINCIPAL -->
      <section class="events-hero">
        <div class="events-hero-content">
          <span class="events-eyebrow">PAINEL DE COMUNICAÇÃO</span>
          <h1>Eventos</h1>
          <p>
            Organize as actividades escolares, acompanhe os próximos
            acontecimentos e mantenha a comunidade informada.
          </p>

          <button type="button" class="events-primary-button"
            data-event-action="new">
            <span aria-hidden="true">＋</span>
            Novo evento
          </button>
        </div>

        <div class="events-hero-image">
          <img
            src="https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1000"
            alt="Actividade escolar com alunos e professores"
          >
          <div class="events-image-caption">
            <span class="events-image-dot"></span>
            Gestão de actividades escolares
          </div>
        </div>
      </section>

      <!-- INDICADORES -->
      <section class="events-stats" aria-label="Resumo dos eventos">

        <article class="events-stat-card">
          <div class="events-stat-top">
            <span class="events-stat-label">Total de eventos</span>
            <span class="events-stat-icon events-icon-blue">▦</span>
          </div>
          <strong id="events-stat-total">—</strong>
          <span class="events-stat-description">Todos os eventos registados</span>
        </article>

        <article class="events-stat-card">
          <div class="events-stat-top">
            <span class="events-stat-label">Publicados</span>
            <span class="events-stat-icon events-icon-green">✓</span>
          </div>
          <strong id="events-stat-published">—</strong>
          <span class="events-stat-description">Visíveis conforme a publicação</span>
        </article>

        <article class="events-stat-card">
          <div class="events-stat-top">
            <span class="events-stat-label">Agendados</span>
            <span class="events-stat-icon events-icon-purple">◷</span>
          </div>
          <strong id="events-stat-scheduled">—</strong>
          <span class="events-stat-description">Publicações programadas</span>
        </article>

        <article class="events-stat-card">
          <div class="events-stat-top">
            <span class="events-stat-label">Rascunhos</span>
            <span class="events-stat-icon events-icon-orange">✎</span>
          </div>
          <strong id="events-stat-draft">—</strong>
          <span class="events-stat-description">Eventos ainda não publicados</span>
        </article>

      </section>

      <!-- LISTAGEM -->
      <section class="events-list-section">

        <div class="events-section-heading">
          <div>
            <span class="events-eyebrow">ORGANIZAÇÃO ESCOLAR</span>
            <h2>Todos os eventos</h2>
            <p>Consulta e gere as actividades da escola.</p>
          </div>

          <span id="events-results-count" class="events-results-count">
            A carregar eventos...
          </span>
        </div>

        <div class="events-toolbar">

          <label class="events-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              id="events-search-input"
              placeholder="Pesquisar por título, local..."
              autocomplete="off"
            >
          </label>

          <label class="events-filter">
            <span class="events-filter-label">Estado</span>
            <select id="events-status-filter">
              <option value="all">Todos os estados</option>
              <option value="PUBLISHED">Publicados</option>
              <option value="SCHEDULED">Agendados</option>
              <option value="DRAFT">Rascunhos</option>
            </select>
          </label>

          <label class="events-filter">
            <span class="events-filter-label">Data</span>
            <input type="date" id="events-date-filter">
          </label>

          <button type="button" class="events-reset-button"
            data-event-action="clear-filters">
            Limpar filtros
          </button>

        </div>

        <div id="events-error" class="events-error" hidden>
          <div class="events-message-icon">!</div>
          <h3>Não foi possível carregar os eventos</h3>
          <p id="events-error-message">
            Verifica a ligação ao servidor e tenta novamente.
          </p>
          <button type="button" class="events-secondary-button"
            data-event-action="retry">
            Tentar novamente
          </button>
        </div>

        <div id="events-loading" class="events-grid" aria-label="A carregar">
          <div class="events-skeleton"></div>
          <div class="events-skeleton"></div>
          <div class="events-skeleton"></div>
        </div>

        <div id="events-empty" class="events-empty" hidden>
          <div class="events-empty-icon">▦</div>
          <h3>Ainda não existem eventos</h3>
          <p>Cria o primeiro evento para começar a organizar as actividades escolares.</p>
          <button type="button" class="events-primary-button"
            data-event-action="new">
            ＋ Criar primeiro evento
          </button>
        </div>

        <div id="events-no-results" class="events-empty" hidden>
          <div class="events-empty-icon">⌕</div>
          <h3>Nenhum resultado encontrado</h3>
          <p>Tenta alterar os termos de pesquisa ou os filtros seleccionados.</p>
          <button type="button" class="events-secondary-button"
            data-event-action="clear-filters">
            Limpar filtros
          </button>
        </div>

        <div id="events-grid" class="events-grid" aria-live="polite"></div>

      </section>

      <!-- MODAL: CRIAR / EDITAR -->
      <div id="events-form-modal" class="events-modal" hidden>
        <div class="events-modal-backdrop" data-event-close="form"></div>

        <section class="events-modal-dialog events-form-dialog"
          role="dialog" aria-modal="true" aria-labelledby="events-form-title">

          <header class="events-modal-header">
            <div>
              <span class="events-eyebrow">GESTÃO DE EVENTOS</span>
              <h2 id="events-form-title">Novo evento</h2>
              <p id="events-form-subtitle">
                Preenche os dados da actividade escolar.
              </p>
            </div>

            <button type="button" class="events-modal-close"
              data-event-close="form" aria-label="Fechar">×</button>
          </header>

          <form id="events-form" enctype="multipart/form-data">

            <input type="hidden" name="eventId" id="events-form-id">

            <div class="events-form-body">

              <div class="events-form-section">
                <h3>Informações principais</h3>

                <label class="events-field">
                  <span>Título do evento <b>*</b></span>
                  <input type="text" name="title" id="events-title"
                    placeholder="Ex.: Feira de Ciências 2026"
                    maxlength="180" required>
                </label>

                <label class="events-field">
                  <span>Resumo</span>
                  <textarea name="summary" id="events-summary"
                    rows="2" maxlength="500"
                    placeholder="Apresenta brevemente o evento..."></textarea>
                </label>

                <label class="events-field">
                  <span>Descrição / conteúdo</span>
                  <textarea name="content" id="events-content"
                    rows="5" placeholder="Explica os detalhes da actividade..."></textarea>
                </label>
              </div>

              <div class="events-form-section">
                <h3>Data e localização</h3>

                <label class="events-field">
                  <span>Data do evento <b>*</b></span>
                  <input type="date" name="eventDate"
                    id="events-date" required>
                </label>

                <div class="events-form-row">
                  <label class="events-field">
                    <span>Hora de início</span>
                    <input type="time" name="startTime"
                      id="events-start-time">
                  </label>

                  <label class="events-field">
                    <span>Hora de término</span>
                    <input type="time" name="endTime"
                      id="events-end-time">
                  </label>
                </div>

                <label class="events-field">
                  <span>Local</span>
                  <input type="text" name="location"
                    id="events-location" maxlength="250"
                    placeholder="Ex.: Pátio principal da escola">
                </label>
              </div>

              <div class="events-form-section">
                <h3>Imagem de capa</h3>
                <p class="events-field-help">
                  Envia uma imagem do dispositivo ou indica um endereço de imagem.
                  Se seleccionares um ficheiro, este terá prioridade.
                </p>

                <label class="events-field">
                  <span>Escolher imagem</span>
                  <input type="file" name="coverFile"
                    id="events-cover-file"
                    accept="image/jpeg,image/png,image/webp,image/gif">
                </label>

                <label class="events-field">
                  <span>Ou endereço da imagem (URL)</span>
                  <input type="url" name="coverUrl"
                    id="events-cover-url"
                    placeholder="https://exemplo.com/imagem.jpg">
                </label>

                <div id="events-cover-preview" class="events-cover-preview" hidden>
                  <img id="events-cover-preview-image" src="" alt="Pré-visualização da capa">
                  <button type="button" class="events-secondary-button"
                    data-event-action="remove-preview">
                    Remover pré-visualização
                  </button>
                </div>

                <p class="events-field-help">
                  Formatos aceites: JPG, PNG, WEBP e GIF. Limite de 5 MB.
                </p>
              </div>

              <div class="events-form-section">
                <h3>Publicação</h3>

                <div class="events-form-row">
                  <label class="events-field">
                    <span>Estado <b>*</b></span>
                    <select name="status" id="events-status" required>
                      <option value="DRAFT">Rascunho</option>
                      <option value="PUBLISHED">Publicado</option>
                      <option value="SCHEDULED">Agendado</option>
                    </select>
                  </label>

                  <label class="events-field">
                    <span>Visibilidade <b>*</b></span>
                    <select name="visibility" id="events-visibility" required>
                      <option value="SITE_AND_APP">Site e aplicação</option>
                      <option value="SITE_ONLY">Apenas site</option>
                      <option value="APP_ONLY">Apenas aplicação</option>
                      <option value="INTERNAL">Interno</option>
                    </select>
                  </label>
                </div>

                <label class="events-field" id="events-scheduled-field" hidden>
                  <span>Data e hora da publicação</span>
                  <input type="datetime-local" name="scheduledAt"
                    id="events-scheduled-at">
                </label>

              </div>

              <div id="events-form-error" class="events-inline-error" hidden></div>

            </div>

            <footer class="events-modal-footer">
              <button type="button" class="events-secondary-button"
                data-event-close="form">Cancelar</button>

              <button type="submit" id="events-submit-button"
                class="events-primary-button">
                Guardar evento
              </button>
            </footer>

          </form>
        </section>
      </div>

      <!-- MODAL: VISUALIZAR -->
      <div id="events-view-modal" class="events-modal" hidden>
        <div class="events-modal-backdrop" data-event-close="view"></div>

        <section class="events-modal-dialog events-view-dialog"
          role="dialog" aria-modal="true" aria-labelledby="events-view-title">

          <header class="events-modal-header">
            <div>
              <span class="events-eyebrow">DETALHES DO EVENTO</span>
              <h2 id="events-view-title">Evento</h2>
            </div>
            <button type="button" class="events-modal-close"
              data-event-close="view" aria-label="Fechar">×</button>
          </header>

          <div id="events-view-content" class="events-view-content"></div>

          <footer class="events-modal-footer">
            <button type="button" class="events-secondary-button"
              data-event-close="view">Fechar</button>
            <button type="button" class="events-danger-button"
              data-event-action="delete-viewed">Eliminar</button>
            <button type="button" class="events-primary-button"
              data-event-action="edit-viewed">Editar evento</button>
          </footer>

        </section>
      </div>

      <!-- MODAL: CONFIRMAR ELIMINAÇÃO -->
      <div id="events-delete-modal" class="events-modal" hidden>
        <div class="events-modal-backdrop" data-event-close="delete"></div>

        <section class="events-modal-dialog events-delete-dialog"
          role="alertdialog" aria-modal="true"
          aria-labelledby="events-delete-title">

          <div class="events-delete-icon">!</div>
          <h2 id="events-delete-title">Eliminar evento?</h2>
          <p id="events-delete-message">
            Esta acção não pode ser desfeita.
          </p>

          <footer class="events-modal-footer">
            <button type="button" class="events-secondary-button"
              data-event-close="delete">Cancelar</button>
            <button type="button" id="events-confirm-delete"
              class="events-danger-button">
              Sim, eliminar
            </button>
          </footer>

        </section>
      </div>

      <!-- NOTIFICAÇÕES DA PÁGINA -->
      <div id="events-toast" class="events-toast"
        role="status" aria-live="polite" hidden></div>

    </main>
  `;
}
