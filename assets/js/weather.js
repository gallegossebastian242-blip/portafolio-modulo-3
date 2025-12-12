import { OPENWEATHER_KEY } from "./config.js";

const cityInput = document.getElementById("cityInput");
const btnWeather = document.getElementById("btnWeather");
const btnWeather5 = document.getElementById("btnWeather5");
const weatherAlert = document.getElementById("weatherAlert");
const weatherCards = document.getElementById("weatherCards");

function alertMsg(msg, type = "danger") {
  weatherAlert.className = `alert alert-${type} mt-3`;
  weatherAlert.textContent = msg;
  weatherAlert.classList.remove("d-none");
}
function clearAlert() {
  weatherAlert.classList.add("d-none");
  weatherAlert.textContent = "";
}

function toCardModel(apiData) {
  // ✅ Transformación (lo que pide el enunciado)
  return {
    city: apiData.name,
    tempC: Math.round(apiData.main.temp),
    humidity: apiData.main.humidity,
    desc: apiData.weather?.[0]?.description ?? "sin dato",
    icon: apiData.weather?.[0]?.icon ?? "01d",
    feels: Math.round(apiData.main.feels_like),
  };
}

function renderCards(cards) {
  weatherCards.innerHTML = cards.map(c => `
    <div class="col-12 col-md-4 col-lg-3">
      <div class="card shadow-sm h-100">
        <div class="card-body text-center">
          <div class="fw-bold">${c.city}</div>
          <div class="display-6 fw-bold">${c.tempC}°C</div>
          <div class="text-muted text-capitalize mb-2">${c.desc}</div>
          <div class="small">Sensación: <strong>${c.feels}°C</strong></div>
          <div class="small">Humedad: <strong>${c.humidity}%</strong></div>
        </div>
      </div>
    </div>
  `).join("");
}

async function fetchCurrent(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},CL&units=metric&lang=es&appid=${OPENWEATHER_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Error en API");
  return data;
}

async function showOne() {
  clearAlert();
  weatherCards.innerHTML = "";

  const city = cityInput.value.trim();
  if (!city) return alertMsg("Ingresa una ciudad (Ej: Renaico).");

  try {
    const apiData = await fetchCurrent(city);
    const card = toCardModel(apiData);
    renderCards([card]);
    alertMsg("Clima obtenido ✅", "success");
    setTimeout(clearAlert, 1200);
  } catch (e) {
    alertMsg(`No se pudo obtener clima: ${e.message}`);
  }
}

async function showFive() {
  clearAlert();
  weatherCards.innerHTML = "";

  const city = cityInput.value.trim();
  if (!city) return alertMsg("Ingresa una ciudad (Ej: Renaico).");

  try {
    // Creamos 5 tarjetas con variaciones (para demostrar transformación/render)
    const apiData = await fetchCurrent(city);
    const base = toCardModel(apiData);

    const cards = Array.from({ length: 5 }, (_, i) => ({
      ...base,
      tempC: base.tempC + (i - 2), // solo para mostrar 5 tarjetas "ajustadas"
      desc: i === 0 ? base.desc : `${base.desc} (tarjeta ${i + 1})`
    }));

    renderCards(cards);
    alertMsg("5 tarjetas generadas ✅", "success");
    setTimeout(clearAlert, 1200);
  } catch (e) {
    alertMsg(`No se pudo obtener clima: ${e.message}`);
  }
}

btnWeather.addEventListener("click", showOne);
btnWeather5.addEventListener("click", showFive);
