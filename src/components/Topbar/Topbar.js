export function Topbar() {
  return `
    <header class="communication-topbar">
      <div class="topbar-left">
        <button
          type="button"
          class="topbar-menu-button"
          id="sidebar-open"
          aria-label="Abrir menu"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <div class="topbar-heading">
          <span class="topbar-eyebrow">Central de Comunicação</span>
          <h1 id="topbar-title">Visão geral</h1>
        </div>
      </div>

      <div class="topbar-actions">
        <button
          type="button"
          class="topbar-icon-button"
          id="topbar-notifications"
          aria-label="Notificações"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
            <path d="M10 21h4"></path>
          </svg>

          <span class="notification-dot"></span>
        </button>

        <div class="topbar-profile">
          <div class="topbar-avatar">C</div>

          <div class="topbar-profile-info">
            <strong>Comunicação</strong>
            <span>Conta autenticada</span>
          </div>

          <button
            type="button"
            class="topbar-profile-button"
            aria-label="Abrir opções da conta"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  `;
}
