import { load, save } from "./storage.js";

const registerForm = document.getElementById("registerForm");
const regName = document.getElementById("regName");
const regEmail = document.getElementById("regEmail");
const regPass = document.getElementById("regPass");
const regAlert = document.getElementById("regAlert");

const loginForm = document.getElementById("loginForm");
const logEmail = document.getElementById("logEmail");
const logPass = document.getElementById("logPass");
const logAlert = document.getElementById("logAlert");

const sessionBox = document.getElementById("sessionBox");
const btnLogout = document.getElementById("btnLogout");

const USERS_KEY = "m3_users";
const SESSION_KEY = "m3_session";

function show(el, msg, type="danger") {
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.classList.remove("d-none");
}
function hide(el){ el.classList.add("d-none"); el.textContent=""; }

function setSession(user) {
  save(SESSION_KEY, { email: user.email, name: user.name, at: new Date().toISOString() });
  renderSession();
}

function renderSession() {
  const session = load(SESSION_KEY, null);
  sessionBox.textContent = session ? JSON.stringify(session, null, 2) : "Sin sesión";
}

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hide(regAlert);

  const name = regName.value.trim();
  const email = regEmail.value.trim().toLowerCase();
  const pass = regPass.value;

  const users = load(USERS_KEY, []);
  const exists = users.some(u => u.email === email);
  if (exists) return show(regAlert, "Ese email ya está registrado.", "warning");

  users.push({ name, email, pass });
  save(USERS_KEY, users);

  show(regAlert, "Usuario registrado ✅", "success");
  registerForm.reset();
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  hide(logAlert);

  const email = logEmail.value.trim().toLowerCase();
  const pass = logPass.value;

  const users = load(USERS_KEY, []);
  const user = users.find(u => u.email === email && u.pass === pass);

  if (!user) return show(logAlert, "Credenciales incorrectas.", "danger");

  show(logAlert, `Bienvenido, ${user.name} ✅`, "success");
  setSession(user);
  loginForm.reset();
});

btnLogout.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  renderSession();
  show(logAlert, "Sesión cerrada.", "secondary");
  setTimeout(()=>hide(logAlert), 1200);
});

renderSession();
