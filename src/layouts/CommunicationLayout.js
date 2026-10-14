import { Sidebar } from "../components/Sidebar.js";
import { Topbar } from "../components/Topbar.js";

export function CommunicationLayout(content = "") {
  return `
    <div class="communication-app">

      ${Sidebar()}

      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <main class="main-area">

        ${Topbar()}

        <section class="communication-content">
          ${content}
        </section>

      </main>

    </div>
  `;
}
