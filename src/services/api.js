const API_BASE_URL =
"https://sistema-escolar-santa-albertina-1.onrender.com/api/v1";

const TOKEN_KEY = "sa_communication_token";

function getToken() {
return sessionStorage.getItem(TOKEN_KEY);
}

export async function apiRequest(
path,
{
method = "GET",
body = null,
headers = {},
} = {}
) {
const token = getToken();

const requestHeaders = {
Accept: "application/json",
...headers,
};

if (body !== null && !(body instanceof FormData)) {
requestHeaders["Content-Type"] = "application/json";
}

if (token) {
requestHeaders.Authorization = "Bearer ${token}";
}

let response;

try {
response = await fetch("${API_BASE_URL}${path}", {
method,
headers: requestHeaders,
body:
body === null
? null
: body instanceof FormData
? body
: JSON.stringify(body),
});
} catch (error) {
const networkError = new Error(
"Não foi possível comunicar com o servidor. Verifique a ligação à Internet ou a configuração CORS."
);

networkError.cause = error;
networkError.code = "NETWORK_ERROR";

throw networkError;

}

let data = null;

try {
data = await response.json();
} catch {
data = null;
}

if (!response.ok) {
const error = new Error(
data?.message ||
data?.error ||
"Erro do servidor (HTTP ${response.status})."
);

error.status = response.status;
error.data = data;

throw error;

}

return data;
}

export { API_BASE_URL };
