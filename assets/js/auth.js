const usersKey = "usuarios";
const sessionKey = "sesionActiva";

function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey)) || [];
}

function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

function setSession(email) {
  localStorage.setItem(sessionKey, email);
  pintarSesion();
}

function clearSession() {
  localStorage.removeItem(sessionKey);
  pintarSesion();
}

function pintarSesion() {
  const estado = document.getElementById("estadoSesion");
  const email = localStorage.getItem(sessionKey);

  estado.textContent = email ? email : "Sin sesión";
}

// Registro
function registrar() {
  const nombre = document.getElementById("regNombre").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const pass = document.getElementById("regPass").value;

  if (!nombre || !email || !pass) {
    alert("Completa todos los campos");
    return;
  }

  const users = getUsers();

  if (users.some(u => u.email === email)) {
    alert("El usuario ya existe");
    return;
  }

  users.push({ nombre, email, pass });
  saveUsers(users);

  alert("Usuario registrado correctamente");
}

// Login
function ingresar() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass = document.getElementById("loginPass").value;

  const user = getUsers().find(u => u.email === email && u.pass === pass);

  if (!user) {
    alert("Credenciales incorrectas");
    return;
  }

  setSession(user.email);
  alert(`Bienvenido ${user.nombre}`);
}

// Eventos
document.getElementById("btnRegistro")?.addEventListener("click", registrar);
document.getElementById("btnLogin")?.addEventListener("click", ingresar);
document.getElementById("btnLogout")?.addEventListener("click", clearSession);

pintarSesion();
