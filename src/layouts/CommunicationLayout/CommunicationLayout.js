import { Sidebar } from "../../components/Sidebar/Sidebar.js";
import { Topbar } from "../../components/Topbar/Topbar.js";

const pageTitles = {
  "/": "Visão geral",
  "/noticias": "Notícias",
  "/eventos": "Eventos",
  "/galeria": "Galeria",
  "/videos": "Vídeos",
  "/mensagens": "Mensagens",
  "/configuracoes": "Configurações",
  "/conta": "Minha conta"
};

export function CommunicationLayout(content = "", activePath = "/") {
  const pageTitle = pageTitles[activePath] || "Visão geral";

  return `
    <div class="communication-app">

      ${Sidebar(activePath)}

      <div class="communication-main">

        ${Topbar().replace(
          '<h1 id="topbar-title">Visão geral</h1>',
          `<h1 id="topbar-title">${pageTitle}</h1>`
        )}

        <main
          class="communication-content"
          id="communication-content"
        >
          ${content}
        </main>

      </div>

      <div
        class="communication-overlay"
        id="communication-overlay"
        aria-hidden="true"
      ></div>

    </div>
  `;
}
