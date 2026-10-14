export function Topbar() {
  return `
    <header class="topbar">

      <button
        class="menu-button"
        id="menuButton"
        type="button"
        aria-label="Abrir menu"
      >
        ☰
      </button>

      <div class="topbar-title">
        <span>Painel de Comunicação</span>
      </div>

      <div class="topbar-actions">

        <button
          class="notification-button"
          type="button"
          aria-label="Notificações"
        >
          ♧
          <span></span>
        </button>

        <button
          class="user-profile"
          type="button"
          data-route="/conta"
          aria-label="Abrir minha conta"
        >
          <div class="user-avatar">C</div>

          <div class="user-info">
            <strong>Comunicação</strong>
            <small>Administrador</small>
          </div>
        </button>

      </div>

    </header>
  `;
}
