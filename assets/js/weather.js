import { OPENWEATHER_KEY } from "./config.js";

/* =========================
   DOM (IDs que ya tienes)
========================= */
const cityInput = document.getElementById("cityInput");

// soporta ambos nombres por si antes usaste btnClima/btn5
const btnWeather = document.getElementById("btnWeather") || document.getElementById("btnClima");
const btnWeather5 = document.getElementById("btnWeather5") || document.getElementById("btn5");

const weatherAlert = document.getElementById("weatherAlert");
const weatherCards = document.getElementById("weatherCards");

/* =========================
   Helpers UI
========================= */
function showAlert(msg, type = "danger") {
  if (!weatherAlert) return;
  weatherAlert.className = `alert alert-${type} mt-3`;
  weatherAlert.textContent = msg;
  weatherAlert.classList.remove("d-none");
}
function clearAlert() {
  if (!weatherAlert) return;
  weatherAlert.classList.add("d-none");
  weatherAlert.textContent = "";
}

function iconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function formatCLDateTime(dtTxt) {
  // "2025-12-12 15:00:00" -> formato legible
  const d = new Date(dtTxt.replace(" ", "T"));
  return d.toLocaleString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================
   Modelos (transformación)
========================= */
function toCardModelCurrent(apiData) {
  return {
    type: "current",
    title: apiData.name,
    subtitle: "Clima actual",
    tempC: Math.round(apiData.main.temp),
    feels: Math.round(apiData.main.feels_like),
    humidity: apiData.main.humidity,
    desc: apiData.weather?.[0]?.description ?? "sin dato",
    icon: apiData.weather?.[0]?.icon ?? "01d",
  };
}

function toCardModelForecast(item, cityName) {
  return {
    type: "forecast",
    title: cityName,
    subtitle: formatCLDateTime(item.dt_txt),
    tempC: Math.round(item.main.temp),
    feels: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    desc: item.weather?.[0]?.description ?? "sin dato",
    icon: item.weather?.[0]?.icon ?? "01d",
  };
}

/* =========================
   Render
========================= */
function renderCards(cards) {
  if (!weatherCards) return;

  weatherCards.innerHTML = cards
    .map(
      (c) => `
      <div class="col-12 col-md-4 col-lg-3">
        <div class="card shadow-sm h-100">
          <div class="card-body text-center">

            <div class="fw-bold">${c.title}</div>
            <div class="text-muted small mb-2">${c.subtitle}</div>

            <img src="${iconUrl(c.icon)}" alt="${c.desc}" width="64" height="64"/>

            <div class="display-6 fw-bold">${c.tempC}°C</div>
            <div class="text-muted text-capitalize mb-2">${c.desc}</div>

            <div class="small">Sensación: <strong>${c.feels}°C</strong></div>
            <div class="small">Humedad: <strong>${c.humidity}%</strong></div>

            ${
              c.type === "current"
                ? `<span class="badge bg-success mt-3">Clima actual</span>`
                : `<span class="badge bg-primary mt-3">Pronóstico (cada 3 h)</span>`
            }
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

/* =========================
   API
========================= */
async function fetchJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    // mensajes típicos: "city not found" / "Invalid API key"
    throw new Error(data?.message || "Error en la API");
  }
  return data;
}

async function fetchCurrent(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )},CL&units=metric&lang=es&appid=${OPENWEATHER_KEY}`;
  return fetchJson(url);
}

async function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    city
  )},CL&units=metric&lang=es&appid=${OPENWEATHER_KEY}`;
  return fetchJson(url);
}

/* =========================
   Acciones
========================= */
async function showOne() {
  clearAlert();
  if (weatherCards) weatherCards.innerHTML = "";

  const city = cityInput?.value.trim();
  if (!city) return showAlert("Ingresa una ciudad (Ej: Renaico).", "warning");

  try {
    const data = await fetchCurrent(city);
    renderCards([toCardModelCurrent(data)]);
    showAlert("Clima obtenido ✅", "success");
    setTimeout(clearAlert, 1200);
  } catch (e) {
    showAlert(`No se pudo obtener clima: ${e.message}`);
  }
}

async function showFive() {
  clearAlert();
  if (weatherCards) weatherCards.innerHTML = "";

  const city = cityInput?.value.trim();
  if (!city) return showAlert("Ingresa una ciudad (Ej: Renaico).", "warning");

  try {
    const data = await fetchForecast(city);
    const cityName = data.city?.name || city;

    // 5 intervalos REALES (aprox. cada 3 horas) => ~15 horas
    const items = (data.list || []).slice(0, 5);
    if (!items.length) return showAlert("No hay datos de pronóstico disponibles.");

    const cards = items.map((it) => toCardModelForecast(it, cityName));
    renderCards(cards);

    showAlert("Pronóstico (15 h) obtenido ✅", "success");
    setTimeout(clearAlert, 1200);
  } catch (e) {
    showAlert(`No se pudo obtener pronóstico: ${e.message}`);
  }
}

/* =========================
   Eventos (IMPORTANTE)
========================= */
if (btnWeather) btnWeather.addEventListener("click", showOne);
if (btnWeather5) btnWeather5.addEventListener("click", showFive);

// Enter en el input también ejecuta clima actual
if (cityInput) {
  cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") showOne();
  });
}
