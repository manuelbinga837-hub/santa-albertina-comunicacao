const navigationGroups = [
  {
    label: "Principal",
    items: [
      {
        id: "dashboard",
        label: "Visão geral",
        path: "/"
      }
    ]
  },

  {
    label: "Conteúdo",
    items: [
      {
        id: "noticias",
        label: "Notícias",
        path: "/noticias"
      },
      {
        id: "eventos",
        label: "Eventos",
        path: "/eventos"
      },
      {
        id: "galeria",
        label: "Galeria",
        path: "/galeria"
      },
      {
        id: "videos",
        label: "Vídeos",
        path: "/videos"
      }
    ]
  },

  {
    label: "Comunidade",
    items: [
      {
        id: "mensagens",
        label: "Mensagens",
        path: "/mensagens"
      }
    ]
  },

  {
    label: "Sistema",
    items: [
      {
        id: "configuracoes",
        label: "Configurações",
        path: "/configuracoes"
      },
      {
        id: "conta",
        label: "Minha conta",
        path: "/conta"
      }
    ]
  }
];

const icons = {
  dashboard: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
    </svg>
  `,

  noticias: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"></path>
      <path d="M7 8h10M7 12h10M7 16h6"></path>
    </svg>
  `,

  eventos: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2"></rect>
      <path d="M16 3v4M8 3v4M3 10h18"></path>
    </svg>
  `,

  galeria: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2"></rect>
      <circle cx="8.5" cy="9" r="1.5"></circle>
      <path d="m4 17 5-5 3.5 3.5 2.5-2.5L20 18"></path>
    </svg>
  `,

  videos: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
      <path d="m10 9 5 3-5 3V9Z"></path>
    </svg>
  `,

  mensagens: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-3.5-.8L4 20l1.2-3.5A7.4 7.4 0 0 1 4 12a7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 8 7Z"></path>
      <path d="M8 12h.01M12 12h.01M16 12h.01"></path>
    </svg>
  `,

  configuracoes: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"></path>
      <path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a2 2 0 0 0-3.4 1.4v.1a1.8 1.8 0 0 1-3.6 0v-.1a2 2 0 0 0-3.4-1.4l-.1.1A1.8 1.8 0 0 1 4 15.1l.1-.1a2 2 0 0 0-1.4-3.4h-.1a1.8 1.8 0 0 1 0-3.6h.1A2 2 0 0 0 4.1 4.6L4 4.5A1.8 1.8 0 0 1 6.5 2l.1.1A2 2 0 0 0 10 2.5v-.1a1.8 1.8 0 0 1 3.6 0v.1A2 2 0 0 0 17.4 2l.1-.1A1.8 1.8 0 0 1 20 4.5l-.1.1a2 2 0 0 0 1.4 3.4h.1a1.8 1.8 0 0 1 0 3.6h-.1a2 2 0 0 0-1.4 3.4Z"></path>
    </svg>
  `,

  conta: `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3"></circle>
      <path d="M5 20a7 7 0 0 1 14 0"></path>
    </svg>
  `
};

export function Sidebar(activePath = "/") {
  return `
    <aside
      class="communication-sidebar"
      id="communication-sidebar"
      aria-label="Navegação principal"
    >

      <div class="sidebar__top">

        <a
          href="/"
          class="sidebar__brand"
          data-route
          aria-label="Santa Albertina — Visão geral"
        >
          <span class="sidebar__brand-mark">
            SA
          </span>

          <span class="sidebar__brand-text">
            <strong>Santa Albertina</strong>
            <small>Comunicação</small>
          </span>
        </a>

        <button
          type="button"
          class="sidebar__close"
          id="sidebar-close"
          aria-label="Fechar menu"
        >
          <span></span>
          <span></span>
        </button>

      </div>

      <nav class="sidebar__navigation">

        ${navigationGroups.map((group) => `
          <div class="sidebar__group">

            <span class="sidebar__group-label">
              ${group.label}
            </span>

            <div class="sidebar__items">

              ${group.items.map((item) => {
                const active = activePath === item.path;

                return `
                  <a
                    href="${item.path}"
                    data-route="${item.path}"
                    class="sidebar__item${active ? " is-active" : ""}"
                    ${active ? 'aria-current="page"' : ""}
                  >
                    <span class="sidebar__item-icon">
                      ${icons[item.id]}
                    </span>

                    <span class="sidebar__item-label">
                      ${item.label}
                    </span>
                  </a>
                `;
              }).join("")}

            </div>

          </div>
        `).join("")}

      </nav>

      <div class="sidebar__bottom">

        <div class="sidebar__profile">

          <div class="sidebar__avatar">
            C
          </div>

          <div class="sidebar__profile-info">
            <strong>Comunicação</strong>
            <span>Conta autenticada</span>
          </div>

          <button
            type="button"
            class="sidebar__profile-action"
            aria-label="Opções da conta"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

        <button
          type="button"
          class="sidebar__logout"
          id="communication-logout"
        >
          <span class="sidebar__logout-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5"></path>
              <path d="m14 8 4 4-4 4M9 12h9"></path>
            </svg>
          </span>

          <span>Terminar sessão</span>
        </button>

      </div>

    </aside>
  `;
}
