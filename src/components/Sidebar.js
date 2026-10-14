export function Sidebar() {
  return `
    <aside class="sidebar" id="sidebar">

      <div class="sidebar-brand">

        <div class="brand-mark">SA</div>

        <div>
          <strong>Santa Albertina</strong>
          <span>Comunicação</span>
        </div>

        <button
          class="sidebar-close"
          id="sidebarClose"
          type="button"
          aria-label="Fechar menu"
        >
          ×
        </button>

      </div>

      <nav class="sidebar-nav" aria-label="Navegação principal">

        <a
          href="/"
          class="nav-item"
          data-route="/"
        >
          <span class="nav-icon">⌂</span>
          <span>Dashboard</span>
        </a>

        <div class="nav-section">
          <span>CONTEÚDO</span>
        </div>

        <a
          href="/noticias"
          class="nav-item"
          data-route="/noticias"
        >
          <span class="nav-icon">▤</span>
          <span>Notícias</span>
        </a>

        <a
          href="/eventos"
          class="nav-item"
          data-route="/eventos"
        >
          <span class="nav-icon">▣</span>
          <span>Eventos</span>
        </a>

        <a
          href="/galeria"
          class="nav-item"
          data-route="/galeria"
        >
          <span class="nav-icon">▧</span>
          <span>Galeria</span>
        </a>

        <a
          href="/videos"
          class="nav-item"
          data-route="/videos"
        >
          <span class="nav-icon">▶</span>
          <span>Vídeos</span>
        </a>

        <div class="nav-section">
          <span>COMUNICAÇÃO</span>
        </div>

        <a
          href="/mensagens"
          class="nav-item"
          data-route="/mensagens"
        >
          <span class="nav-icon">✉</span>
          <span>Mensagens</span>
          <span class="nav-badge">3</span>
        </a>

        <div class="nav-section">
          <span>SISTEMA</span>
        </div>

        <a
          href="/configuracoes"
          class="nav-item"
          data-route="/configuracoes"
        >
          <span class="nav-icon">⚙</span>
          <span>Configurações</span>
        </a>

        <a
          href="/conta"
          class="nav-item"
          data-route="/conta"
        >
          <span class="nav-icon">●</span>
          <span>Minha conta</span>
        </a>

      </nav>

      <div class="sidebar-bottom">

        <button
          class="logout-button"
          type="button"
        >
          <span>↪</span>
          Sair
        </button>

      </div>

    </aside>
  `;
}
