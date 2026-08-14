const baseUrl = (process.env.TEST_API_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const origin = process.env.TEST_ORIGIN || "http://localhost:3000";
const email = `migration-smoke-${Date.now()}@example.com`;
const password = "A9!VioletHarbor2026";
const cookies = new Map();
let csrfToken = "";

const updateCookies = (response) => {
  for (const value of response.headers.getSetCookie()) {
    const [pair] = value.split(";");
    const separator = pair.indexOf("=");
    const name = pair.slice(0, separator);
    const cookieValue = pair.slice(separator + 1);
    if (cookieValue) cookies.set(name, cookieValue);
    else cookies.delete(name);
  }
};

const request = async (path, options = {}) => {
  const method = options.method || "GET";
  const headers = new Headers(options.headers);
  headers.set("Origin", origin);
  if (cookies.size) headers.set("Cookie", [...cookies].map(([name, value]) => `${name}=${value}`).join("; "));
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) headers.set("X-CSRF-Token", csrfToken);
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    method,
    headers,
    redirect: "manual",
    signal: options.signal || AbortSignal.timeout(30_000),
  });
  updateCookies(response);
  const body = await response.json().catch(() => ({}));
  return { response, body };
};

const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

const csrf = await request("/api/auth/csrf");
expect(csrf.response.status === 200 && csrf.body.csrfToken, "CSRF initialization failed");
csrfToken = csrf.body.csrfToken;

const registration = new FormData();
registration.set("name", "Runtime Check");
registration.set("email", email);
registration.set("password", password);
registration.set("role", "patient");
registration.set("acceptedTerms", "true");
registration.set("policyVersion", "2026-08-03");

const registered = await request("/api/auth/register", { method: "POST", body: registration });
expect(
  registered.response.status === 201 && registered.body.data?.user?.email === email,
  `Registration failed (${registered.response.status}): ${registered.body.error || "unknown error"}`,
);

const me = await request("/api/auth/me");
expect(me.response.status === 200 && me.body.data?.user?.email === email, "Session lookup failed after registration");

const loggedOut = await request("/api/auth/logout", { method: "POST" });
expect(loggedOut.response.status === 200, "Logout failed");
const afterLogout = await request("/api/auth/me");
expect(afterLogout.response.status === 401, "Revoked session remained active");

const loggedIn = await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, remember: false }),
});
expect(loggedIn.response.status === 200 && loggedIn.body.data?.user?.email === email, "Login failed after logout");

const removed = await request("/api/auth/account", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ confirmEmail: email, password }),
});
expect(removed.response.status === 200, `Smoke-account cleanup failed (${removed.response.status})`);
const afterRemoval = await request("/api/auth/me");
expect(afterRemoval.response.status === 401, "Deleted account session remained active");

console.log("Auth smoke passed: csrf → register → me → logout → login → account cleanup");
