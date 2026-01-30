import { GroqBuddy } from "./GroqCon.js";
const apiKey = "b01c5c31d2d342834c7ab2ee452a5c65";

async function GetCityLanLon(Lcity) {
  try {
    const LangLong = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${Lcity}&count=1&language=en&format=json`,
    );
    const LLData = await LangLong.json();
    console.log(LLData);
    if (!LLData.results) throw new Error("city not found. Try again");
    return LLData.results[0];
  } catch (error) {}
}

const fetchWeather = async (city) => {
  // const cityHeader = document.getElementById("cityName");

  try {
    const LL = await GetCityLanLon(city);
    console.log("LL : ", LL.latitude);

    const latitude = LL.latitude;
    const longitude = LL.longitude;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

    const url2 = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const response = await fetch(url);
    const prediction = await fetch(url2);
    const data = await response.json();
    const P_data = await prediction.json();

    if (!response.ok) throw new Error(data.message);

    const Gdata = await GroqBuddy(data);
    console.log("Data :", data);
    // Destructuring the API response
    const {
      name,
      main: { temp, feels_like, humidity },
      wind: { speed },
      weather,
      sys: { sunrise, sunset },
      clouds: { all },
    } = data;

    // 1. Update Main Section
    document.getElementById("cityName").innerText = name;
    document.getElementById("currentTemp").innerText = `${Math.round(temp)}°`;
    const iconElement = document.getElementById("mainIcon");
    if (weather[0].main === "Clouds") {
      iconElement.className = "fa-solid fa-cloud";
    } else if (weather[0].main === "Rain") {
      iconElement.className = "fa-solid fa-cloud-showers-heavy";
    } else {
      iconElement.className = "fa-solid fa-sun";
    }

    // 3. Update "daily" section
    document.getElementById("realFeel").innerText =
      `${Math.round(feels_like)}°`;
    document.getElementById("windSpeed").innerText =
      `${(speed * 3.6).toFixed(1)} km/h`;
    document.getElementById("rainProb").innerText = `${all}%`;
    document.getElementById("rainChance").innerText = `${all}%`;
    document.getElementById("uvIndex").innerText = `${Math.round(humidity)}%`;
    document.getElementById("sunriseTime").innerText =
      `${formatUnixTime(sunset)}`;
    document.getElementById("sunsetTime").innerText =
      `${formatUnixTime(sunrise)}`;
    updateUI(P_data);
    GupdateUI(Gdata);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    alert(`City not found: ${err.message}`);
  }
};

function updateUI(data) {
  const forecastGrid = document.getElementById("forecastGrid");
  // Update 7-Day Forecast
  forecastGrid.innerHTML = "";

  data.daily.time.forEach((date, i) => {
    const dayName = new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
    });
    const card = document.createElement("div");
    card.className =
      "bg-white/10 hover:bg-white/20 transition-all p-4 rounded-2xl border border-white/10 text-center";
    card.innerHTML = `
            <p class="text-sm font-medium opacity-70 mb-2">${dayName}</p>
            <p class="text-xs mb-3 h-8 flex items-center justify-center">${getWeatherDesc(data.daily.weathercode[i])}</p>
            <div class="font-bold">
                <span class="text-lg">${Math.round(data.daily.temperature_2m_max[i])}°</span>
                <span class="text-xs opacity-60 ml-1">${Math.round(data.daily.temperature_2m_min[i])}°</span>
            </div>
        `;
    forecastGrid.appendChild(card);
  });
}
// ********************************************************

function GupdateUI(Gdata) {
  if (!Gdata || !Gdata.advice) return;
  console.log(Gdata.advice[0]);
  const HourlyGrid = document.getElementById("hourlyGrid");
  // Update 7-Day Forecast
  HourlyGrid.innerHTML = "";

  Gdata.advice.forEach((Gdate, i) => {
    console.log("data :", Gdata.advice[0]);
    const card = document.createElement("div");
    card.className =
      "w-full bg-white/10 hover:bg-white/20 transition-all p-4 rounded-2xl border border-white/10 text-center";
    card.innerHTML = `
            <p class=" text-sm font-medium opacity-70 mb-2">${Gdata.advice[i]}</p>
        `;
    HourlyGrid.appendChild(card);
  });
}
const formatUnixTime = (unixTimestamp) => {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// *************************************************************

function getWeatherDesc(code) {
  const codes = {
    0: "Clear",
    1: "Fair",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    51: "Drizzle",
    61: "Rainy",
    71: "Snowy",
    95: "Stormy",
  };
  return codes[code] || "Cloudy";
}

// --- Event Listeners ---

document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value;
  if (city) fetchWeather(city);
});

document.getElementById("cityInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    fetchWeather(e.target.value);
  }
});

// window.onload = () => {
//   fetchWeather("Lahore");
// };
