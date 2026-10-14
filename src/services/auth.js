import { apiRequest } from "./api.js";

const TOKEN_KEY = "sa_communication_token";
const USER_KEY = "sa_communication_user";

export async function login(identifier, password) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: {
      identifier,
      password
    }
  });

  const user = data?.data?.user;

  if (!data?.data?.token || !user) {
    throw new Error("Resposta de autenticação inválida.");
  }

  if (Number(user.role) !== 5) {
    throw new Error(
      "Esta conta não tem acesso à Central de Comunicação."
    );
  }

  sessionStorage.setItem(TOKEN_KEY, data.data.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));

  return user;
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const user = sessionStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

export async function getCurrentUser() {
  const response = await apiRequest("/auth/me");
  const user = response?.data;

  if (!user) {
    throw new Error(
      "Não foi possível validar a sessão."
    );
  }

  if (Number(user.role) !== 5) {
    throw new Error(
      "Esta conta não tem acesso à Central de Comunicação."
    );
  }

  sessionStorage.setItem(USER_KEY, JSON.stringify(user));

  return user;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export { TOKEN_KEY, USER_KEY };
