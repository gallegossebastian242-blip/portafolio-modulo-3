import { OPENWEATHER_KEY } from "./config.js";

const cityInput = document.getElementById("cityInput");
const btnSearch = document.getElementById("btnSearch");
const alertBox = document.getElementById("alertBox");
const cardsContainer = document.getElementById("cardsContainer");

function showAlert(message, type = "danger") {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");
}

function clearAlert() {
  alertBox.classList.add("d-none");
  alertBox.textContent = "";
}

function renderWeather(data) {
  cardsContainer.innerHTML = `
    <div class="col-12 col-md-4">
      <div class="card shadow-sm">
        <div class="card-body text-center">
          <h5 class="card-title mb-1">${data.name}</h5>
          <div class="display-6 fw-bold">${Math.round(data.main.temp)}°C</div>
          <div class="text-muted text-capitalize mb-2">${data.weather[0].description}</div>
          <div>Humedad: <strong>${data.main.humidity}%</strong></div>
        </div>
      </div>
    </div>
  `;
}

async function getWeather() {
  clearAlert();
  cardsContainer.innerHTML = "";

  const city = cityInput.value.trim();
  if (!city) {
    showAlert("Escribe una ciudad. Ej: Renaico");
    return;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},CL&units=metric&lang=es&appid=${OPENWEATHER_KEY}`;
    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Error al consultar clima");
    }

    renderWeather(data);
    showAlert("Clima obtenido correctamente ✅", "success");
    setTimeout(clearAlert, 1800);

  } catch (err) {
    showAlert(`No se pudo obtener clima: ${err.message}`);
  }
}

btnSearch.addEventListener("click", getWeather);
