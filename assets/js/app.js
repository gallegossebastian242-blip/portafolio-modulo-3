// assets/js/app.js
(() => {
  // ======= DOM =======
  const cityInput = document.getElementById("cityInput");
  const btnNow = document.getElementById("btnNow");
  const btn5 = document.getElementById("btn5");
  const msgBox = document.getElementById("weatherMsg");
  const cardsBox = document.getElementById("weatherCards");
  const recentBox = document.getElementById("recentCities");

  // ======= Helpers UI =======
  function setMsg(type, text) {
    // type: "info" | "success" | "warning" | "danger"
    if (!msgBox) return;
    msgBox.className = `alert alert-${type} mt-3`;
    msgBox.textContent = text;
    msgBox.style.display = "block";
  }

  function clearMsg() {
    if (!msgBox) return;
    msgBox.style.display = "none";
    msgBox.textContent = "";
  }

  function setLoading(isLoading) {
    if (btnNow) btnNow.disabled = isLoading;
    if (btn5) btn5.disabled = isLoading;

    if (isLoading) setMsg("info", "Cargando clima...");
  }

  function clearCards() {
    if (cardsBox) cardsBox.innerHTML = "";
  }

  // ======= Transformaciones =======
  function mpsToKmh(mps) {
    if (typeof mps !== "number") return 0;
    return Math.round(mps * 3.6);
  }

  function degToDir(deg) {
    if (typeof deg !== "number") return "—";
    const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
    const idx = Math.round(deg / 45) % 8;
    return dirs[idx];
  }

  function formatLocalTime(unixSeconds, timezoneSeconds) {
    // timezoneSeconds = offset en segundos desde UTC (lo trae OpenWeather)
    const ms = (unixSeconds + timezoneSeconds) * 1000;
    const d = new Date(ms);
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function iconUrl(icon) {
    // icon ejemplo: "10d"
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  // ======= API =======
  async function fetchJson(url) {
    const r = await fetch(url);
    const data = await r.json();

    // OpenWeather a veces responde 200 con "cod" string/number distinto
    const cod = data?.cod;
    const ok =
      r.ok &&
      (cod === undefined || cod === 200 || cod === "200");

    if (!ok) {
      const msg = data?.message || "Error consultando API";
      const status = r.status || cod || 0;
      const err = new Error(msg);
      err.status = status;
      throw err;
    }
    return data;
  }

  function buildUrl(endpoint, params) {
    const u = new URL(`${OPENWEATHER_BASE}/${endpoint}`);
    Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
  }

  async function getCurrent(city) {
    const url = buildUrl("weather", {
      q: city,
      appid: OPENWEATHER_API_KEY,
      units: "metric",
      lang: "es",
    });
    return fetchJson(url);
  }

  async function getForecast(city) {
    // /forecast = cada 3 horas (ideal para 5 tarjetas)
    const url = buildUrl("forecast", {
      q: city,
      appid: OPENWEATHER_API_KEY,
      units: "metric",
      lang: "es",
    });
    return fetchJson(url);
  }

  // ======= Render =======
  function renderCardFromCurrent(w) {
    const name = w?.name ?? "—";
    const temp = Math.round(w?.main?.temp ?? 0);
    const feels = Math.round(w?.main?.feels_like ?? 0);
    const tmin = Math.round(w?.main?.temp_min ?? 0);
    const tmax = Math.round(w?.main?.temp_max ?? 0);
    const hum = Math.round(w?.main?.humidity ?? 0);
    const clouds = Math.round(w?.clouds?.all ?? 0);
    const windKmh = mpsToKmh(w?.wind?.speed ?? 0);
    const windDir = degToDir(w?.wind?.deg ?? 0);
    const desc = w?.weather?.[0]?.description ?? "—";
    const icon = w?.weather?.[0]?.icon ?? "01d";
    const localTime = formatLocalTime(w?.dt ?? 0, w?.timezone ?? 0);

    return `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <div class="d-flex justify-content-center align-items-center gap-2">
              <img src="${iconUrl(icon)}" alt="icono" width="58" height="58" />
              <div class="text-start">
                <div class="fw-semibold">${name}</div>
                <div class="text-muted small">Hora local: ${localTime}</div>
              </div>
            </div>

            <div class="display-5 fw-bold mb-1">${temp}°C</div>
            <div class="text-capitalize mb-3">${desc}</div>

            <div class="row g-2 text-start small">
              <div class="col-6"><b>Sensación:</b> ${feels}°C</div>
              <div class="col-6"><b>Humedad:</b> ${hum}%</div>
              <div class="col-6"><b>Min/Max:</b> ${tmin}/${tmax}°C</div>
              <div class="col-6"><b>Nubosidad:</b> ${clouds}%</div>
              <div class="col-12"><b>Viento:</b> ${windKmh} km/h (${windDir})</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCardFromForecast(item, cityName, timezoneSeconds, label) {
    // item: elemento de list[] del forecast (cada 3 horas)
    const temp = Math.round(item?.main?.temp ?? 0);
    const feels = Math.round(item?.main?.feels_like ?? 0);
    const hum = Math.round(item?.main?.humidity ?? 0);
    const clouds = Math.round(item?.clouds?.all ?? 0);
    const windKmh = mpsToKmh(item?.wind?.speed ?? 0);
    const windDir = degToDir(item?.wind?.deg ?? 0);
    const desc = item?.weather?.[0]?.description ?? "—";
    const icon = item?.weather?.[0]?.icon ?? "01d";

    const unix = item?.dt ?? 0;
    const localTime = formatLocalTime(unix, timezoneSeconds);

    return `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <div class="fw-semibold mb-1">${cityName}</div>
            <div class="text-muted small mb-2">${label} · ${localTime}</div>

            <img src="${iconUrl(icon)}" alt="icono" width="58" height="58" />
            <div class="display-6 fw-bold">${temp}°C</div>
            <div class="text-capitalize mb-3">${desc}</div>

            <div class="row g-2 text-start small">
              <div class="col-6"><b>Sensación:</b> ${feels}°C</div>
              <div class="col-6"><b>Humedad:</b> ${hum}%</div>
              <div class="col-6"><b>Nubosidad:</b> ${clouds}%</div>
              <div class="col-6"><b>Viento:</b> ${windKmh} km/h</div>
              <div class="col-12"><b>Dirección:</b> ${windDir}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ======= Historial ciudades =======
  const RECENT_KEY = "recentCitiesCL";

  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY)) ?? [];
    } catch {
      return [];
    }
  }

  function saveRecent(city) {
    const c = city.trim();
    if (!c) return;
    const list = getRecent()
      .filter(x => x.toLowerCase() !== c.toLowerCase());
    list.unshift(c);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
    paintRecent();
  }

  function paintRecent() {
    if (!recentBox) return;
    const list = getRecent();
    if (list.length === 0) {
      recentBox.innerHTML = `<div class="text-muted small">Sin historial aún.</div>`;
      return;
    }

    recentBox.innerHTML = list.map(c => `
      <button type="button" class="btn btn-sm btn-outline-secondary me-2 mb-2" data-city="${c}">
        ${c}
      </button>
    `).join("");

    // Delegación simple:
    recentBox.querySelectorAll("button[data-city]").forEach(btn => {
      btn.addEventListener("click", () => {
        cityInput.value = btn.getAttribute("data-city");
        handleNow();
      });
    });
  }

  // ======= Control principal =======
  function normalizeCity() {
    return (cityInput?.value ?? "").trim();
  }

  function handleApiError(err) {
    const s = err?.status;

    if (s === 401) {
      setMsg("danger", "API Key inválida (401). Revisa tu OPENWEATHER_API_KEY en config.js.");
      return;
    }
    if (s === 404) {
      setMsg("warning", "Ciudad no encontrada (404). Prueba con: 'Renaico', 'Tijeral', 'Santiago', etc.");
      return;
    }
    setMsg("danger", `No se pudo obtener clima: ${err?.message ?? "Error desconocido"}`);
  }

  async function handleNow() {
    const city = normalizeCity();
    clearMsg();

    if (!city) {
      setMsg("warning", "Ingresa una ciudad.");
      return;
    }

    setLoading(true);
    clearCards();

    try {
      const w = await getCurrent(city);
      saveRecent(city);

      cardsBox.innerHTML = renderCardFromCurrent(w);
      setMsg("success", "Clima actualizado correctamente ✅");
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }

  async function handle5() {
    const city = normalizeCity();
    clearMsg();

    if (!city) {
      setMsg("warning", "Ingresa una ciudad.");
      return;
    }

    setLoading(true);
    clearCards();

    try {
      const data = await getForecast(city);
      saveRecent(city);

      const cityName = data?.city?.name ?? city;
      const tz = data?.city?.timezone ?? 0;
      const list = data?.list ?? [];

      // Tomamos 5 puntos distintos (cada 3 horas)
      const picks = list.slice(0, 5);

      const labels = ["Ahora", "+3h", "+6h", "+9h", "+12h"];

      cardsBox.innerHTML = picks.map((it, i) =>
        renderCardFromForecast(it, cityName, tz, labels[i] ?? `Tarjeta ${i + 1}`)
      ).join("");

      setMsg("success", "Mostrando 5 tarjetas (forecast) ✅");
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }

  // ======= Eventos =======
  if (btnNow) btnNow.addEventListener("click", handleNow);
  if (btn5) btn5.addEventListener("click", handle5);

  if (cityInput) {
    cityInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleNow();
    });
  }

  // Init
  paintRecent();
})();
