const routes = {
  "/": "Dashboard",
  "/noticias": "Noticias",
  "/eventos": "Eventos",
  "/galeria": "Galeria",
  "/videos": "Videos",
  "/mensagens": "Mensagens",
  "/configuracoes": "Configuracoes",
  "/conta": "Conta"
};

export function getCurrentRoute() {
  const path = window.location.pathname;

  if (routes[path]) {
    return {
      path,
      page: routes[path]
    };
  }

  return {
    path: "/",
    page: "Dashboard"
  };
}

export function navigate(path) {
  if (!routes[path]) {
    path = "/";
  }

  window.history.pushState({}, "", path);

  window.dispatchEvent(
    new PopStateEvent("popstate")
  );
}

export function startRouter(render) {
  window.addEventListener("popstate", render);

  render();
}

export { routes };
