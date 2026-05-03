const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const gpsBtn = document.getElementById('gps-btn');
const suggestionsList = document.getElementById('suggestions-list');
const errorMessage = document.getElementById('error-message');
const unitToggle = document.getElementById('unit-toggle');

const weatherContent = document.getElementById('weather-content');
const initialState = document.getElementById('initial-state');
const loadingSkeleton = document.getElementById('loading-skeleton');

const hourlyTitle = document.getElementById('hourly-title');
const hourlyForecastContainer = document.getElementById('hourly-forecast-container');
const forecastContainer = document.getElementById('forecast-container');

const mapLoading = document.getElementById('map-loading');
const windyMap = document.getElementById('windy-map');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalIcon = document.getElementById('modal-icon');
const modalBody = document.getElementById('modal-body');
const detailCards = document.querySelectorAll('.detail-card.interactive');

// Background Elements
const skyBg = document.getElementById('sky-bg');
const cloudLayer = document.getElementById('cloud-layer');
const weatherAnimationsContainer = document.getElementById('weather-animations');
const lightningFlash = document.getElementById('lightning-flash');

// Elements to update
const cityNameEl = document.getElementById('city-name');
const currentDateEl = document.getElementById('current-date');
const weatherIconEl = document.getElementById('weather-icon');
const tempValueEl = document.getElementById('temp-value');
const tempUnitEls = document.querySelectorAll('.temp-unit');
const weatherDescEl = document.getElementById('weather-description');
const humidityValueEl = document.getElementById('humidity-value');
const windValueEl = document.getElementById('wind-value');
const feelsLikeValueEl = document.getElementById('feels-like-value');

// State
let currentWeatherData = null;
let currentUnit = localStorage.getItem('weatherUnit') || 'C';
let currentLat = null;
let currentLon = null;
let currentCityName = null;
let lightningInterval = null;

// Initialization
function init() {
    unitToggle.textContent = '°' + (currentUnit === 'C' ? 'F' : 'C'); // Toggle shows the OTHER option
    
    // Check local storage for last city
    const lastCity = localStorage.getItem('lastCity');
    const lastLat = localStorage.getItem('lastLat');
    const lastLon = localStorage.getItem('lastLon');

    if (lastCity && lastLat && lastLon) {
        fetchWeatherForCoords(lastLat, lastLon, lastCity);
    }
}

// Map styles based on time and weather
const skyGradients = {
    clearDay: 'linear-gradient(180deg, #4da0eb 0%, #87ceeb 100%)',
    clearNight: 'linear-gradient(180deg, #0b1021 0%, #1b2745 100%)',
    cloudyDay: 'linear-gradient(180deg, #7a8b99 0%, #aab7c4 100%)',
    cloudyNight: 'linear-gradient(180deg, #121722 0%, #2c3e50 100%)',
    stormDay: 'linear-gradient(180deg, #2c3e50 0%, #4ca1af 100%)',
    stormNight: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    sunset: 'linear-gradient(180deg, #2c1b4d 0%, #e96f5e 100%)',
    sunrise: 'linear-gradient(180deg, #1e3a5f 0%, #ff7e5f 100%)'
};

const weatherCodes = {
    0: { desc: 'Sunny', icon: 'fa-sun', type: 'clear' },
    1: { desc: 'Mostly Sunny', icon: 'fa-cloud-sun', type: 'clear' },
    2: { desc: 'Partly Cloudy', icon: 'fa-cloud-sun', type: 'cloudy' },
    3: { desc: 'Cloudy', icon: 'fa-cloud', type: 'cloudy' },
    45: { desc: 'Fog', icon: 'fa-smog', type: 'fog' },
    48: { desc: 'Smog', icon: 'fa-smog', type: 'fog' },
    51: { desc: 'Light Drizzle', icon: 'fa-cloud-rain', type: 'rain' },
    53: { desc: 'Drizzle', icon: 'fa-cloud-rain', type: 'rain' },
    55: { desc: 'Heavy Drizzle', icon: 'fa-cloud-rain', type: 'heavyRain' },
    61: { desc: 'Slight Rain', icon: 'fa-cloud-showers-heavy', type: 'rain' },
    63: { desc: 'Rain', icon: 'fa-cloud-showers-heavy', type: 'rain' },
    65: { desc: 'Heavy Rain', icon: 'fa-cloud-showers-heavy', type: 'heavyRain' },
    71: { desc: 'Light Snow', icon: 'fa-snowflake', type: 'snow' },
    73: { desc: 'Snow', icon: 'fa-snowflake', type: 'snow' },
    75: { desc: 'Snow Storm', icon: 'fa-snowflake', type: 'heavySnow' },
    77: { desc: 'Snow Grains', icon: 'fa-snowflake', type: 'snow' },
    80: { desc: 'Rain Showers', icon: 'fa-cloud-showers-water', type: 'rain' },
    81: { desc: 'Heavy Showers', icon: 'fa-cloud-showers-water', type: 'heavyRain' },
    82: { desc: 'Violent Showers', icon: 'fa-cloud-showers-water', type: 'heavyRain' },
    95: { desc: 'Thunderstorm', icon: 'fa-bolt', type: 'storm' },
    96: { desc: 'Thunderstorm & Hail', icon: 'fa-bolt', type: 'storm' },
    99: { desc: 'Severe Thunderstorm', icon: 'fa-bolt', type: 'storm' },
};
const defaultWeather = { desc: 'Unknown', icon: 'fa-cloud', type: 'cloudy' };

// Debounce Utility
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

const handleInput = debounce(async (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) { suggestionsList.classList.add('hidden'); return; }

    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
        if (!response.ok) throw new Error('Geocoding API error');
        const data = await response.json();
        if (data.results && data.results.length > 0) { renderSuggestions(data.results); } 
        else { suggestionsList.classList.add('hidden'); }
    } catch (error) { console.error('Error:', error); }
}, 300);

cityInput.addEventListener('input', handleInput);

const triggerSearch = async () => {
    suggestionsList.classList.add('hidden');
    const query = cityInput.value.trim();
    if (query) { fetchWeatherForQuery(query); }
};

cityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') triggerSearch(); });
searchBtn.addEventListener('click', triggerSearch);

// GPS Button
gpsBtn.addEventListener('click', () => {
    if ("geolocation" in navigator) {
        showLoading();
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                // Reverse geocode to get city name
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                let cityName = 'Current Location';
                if(response.ok) {
                    const data = await response.json();
                    cityName = data.city || data.locality || data.principalSubdivision || 'Current Location';
                }
                fetchWeatherForCoords(lat, lon, cityName);
            } catch (e) {
                fetchWeatherForCoords(lat, lon, 'Current Location');
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            showError();
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
});

// Unit Toggle
unitToggle.addEventListener('click', () => {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    unitToggle.textContent = '°' + (currentUnit === 'C' ? 'F' : 'C');
    localStorage.setItem('weatherUnit', currentUnit);
    
    if (currentLat && currentLon && currentCityName) {
        fetchWeatherForCoords(currentLat, currentLon, currentCityName);
    }
});


document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !searchBtn.contains(e.target) && !gpsBtn.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.classList.add('hidden');
    }
});

// Escape to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
        modalOverlay.classList.add('hidden');
    }
});

function renderSuggestions(results) {
    suggestionsList.innerHTML = '';
    results.forEach(location => {
        const li = document.createElement('li');
        const region = [location.admin1, location.country].filter(Boolean).join(', ');
        li.innerHTML = `<i class="fas fa-location-dot"></i><span class="suggestion-name">${location.name}</span><span class="suggestion-region">${region}</span>`;
        li.addEventListener('click', () => {
            cityInput.value = location.name;
            suggestionsList.classList.add('hidden');
            fetchWeatherForCoords(location.latitude, location.longitude, location.name);
        });
        suggestionsList.appendChild(li);
    });
    suggestionsList.classList.remove('hidden');
}

async function fetchWeatherForQuery(query) {
    showLoading();
    try {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
        if(!geoResponse.ok) throw new Error('Network response was not ok');
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) throw new Error('City not found');
        fetchWeatherForCoords(geoData.results[0].latitude, geoData.results[0].longitude, geoData.results[0].name);
    } catch (error) { showError(); }
}

async function fetchWeatherForCoords(lat, lon, cityName) {
    showLoading();
    currentLat = lat;
    currentLon = lon;
    currentCityName = cityName;
    
    // Cache last city
    localStorage.setItem('lastCity', cityName);
    localStorage.setItem('lastLat', lat);
    localStorage.setItem('lastLon', lon);

    const tempUnitParam = currentUnit === 'F' ? '&temperature_unit=fahrenheit' : '';
    const windUnitParam = currentUnit === 'F' ? '&wind_speed_unit=mph' : '';

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto${tempUnitParam}${windUnitParam}`;
        const weatherResponse = await fetch(url);
        if(!weatherResponse.ok) throw new Error('Weather API error');
        const weatherData = await weatherResponse.json();
        currentWeatherData = weatherData.current;
        updateUI(cityName, weatherData.current, weatherData.hourly, weatherData.daily, lat, lon);
    } catch (error) { showError(); }
}

function updateUI(cityName, current, hourly, daily, lat, lon) {
    loadingSkeleton.classList.add('hidden');
    initialState.classList.add('hidden');
    weatherContent.classList.remove('hidden');
    errorMessage.classList.add('hidden');

    const date = new Date();
    currentDateEl.textContent = date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
    cityNameEl.textContent = cityName;
    tempValueEl.textContent = Math.round(current.temperature_2m);
    
    // Update unit displays
    tempUnitEls.forEach(el => el.textContent = `°${currentUnit}`);
    
    humidityValueEl.textContent = `${current.relative_humidity_2m}%`;
    const speedUnit = currentUnit === 'F' ? 'mph' : 'km/h';
    windValueEl.textContent = `${Math.round(current.wind_speed_10m)} ${speedUnit}`;
    feelsLikeValueEl.textContent = `${Math.round(current.apparent_temperature)}°`;

    const isDay = current.is_day;
    let codeInfo = weatherCodes[current.weather_code] || defaultWeather;
    
    let iconClass = codeInfo.icon;
    if (!isDay && iconClass === 'fa-sun') iconClass = 'fa-moon';
    if (!isDay && iconClass === 'fa-cloud-sun') iconClass = 'fa-cloud-moon';

    weatherDescEl.textContent = codeInfo.desc;
    weatherIconEl.className = `fas ${iconClass} weather-icon-large`;
    
    // Render dynamic background
    renderLiveBackground(codeInfo.type, isDay, current.weather_code);

    // Find the closest future hour index for "Today"
    let startIndex = 0;
    const now = new Date();
    for (let i = 0; i < hourly.time.length; i++) {
        const hourTime = new Date(hourly.time[i]);
        if (hourTime >= now) {
            startIndex = i;
            break;
        }
    }
    
    renderHourlyForecast(hourly, startIndex, 'Today', 0);
    renderForecast(daily, hourly);
    
    // Setup Interactive Map using Windy iframe embed
    const zoomLevel = 5;
    const metricTemp = currentUnit === 'C' ? 'c' : 'f';
    const metricWind = currentUnit === 'C' ? 'km/h' : 'mph';
    const metricRain = currentUnit === 'C' ? 'mm' : 'in';
    const windySrc = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=${metricRain}&metricTemp=${metricTemp}&metricWind=${metricWind}&zoom=${zoomLevel}&overlay=clouds&product=ecmwf&level=surface&lat=${lat}&lon=${lon}`;
    
    mapLoading.classList.remove('hidden');
    windyMap.onload = () => { mapLoading.classList.add('hidden'); };
    windyMap.onerror = () => { mapLoading.innerHTML = '<span>Map failed to load.</span>'; };
    windyMap.src = windySrc;
}

function renderHourlyForecast(hourly, startIndex, titleText, dayIndex) {
    hourlyTitle.textContent = titleText;
    hourlyForecastContainer.innerHTML = '';
    
    for (let i = startIndex; i < startIndex + 24; i++) {
        if (!hourly.time[i]) break;
        
        const dateObj = new Date(hourly.time[i]);
        let hours = dateObj.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        
        // Fix "Now" logic: only show "Now" if it's actually the current day (dayIndex === 0) AND the first item
        const timeStr = (i === startIndex && dayIndex === 0) ? 'Now' : `${hours} ${ampm}`;

        const codeInfo = weatherCodes[hourly.weather_code[i]] || defaultWeather;
        const temp = Math.round(hourly.temperature_2m[i]);
        
        let iconClass = codeInfo.icon;
        const isNightHour = dateObj.getHours() < 6 || dateObj.getHours() > 19; // Rough day/night for hourly
        if (isNightHour && iconClass === 'fa-sun') iconClass = 'fa-moon';
        if (isNightHour && iconClass === 'fa-cloud-sun') iconClass = 'fa-cloud-moon';

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <div class="forecast-time">${timeStr}</div>
            <i class="fas ${iconClass} forecast-icon"></i>
            <div class="forecast-temps">
                <span class="temp-single">${temp}°</span>
            </div>
        `;
        hourlyForecastContainer.appendChild(item);
    }
}

function renderForecast(daily, hourly) {
    forecastContainer.innerHTML = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
        if (!daily.time[i]) continue;
        
        const dateObj = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : days[dateObj.getUTCDay()];
        const codeInfo = weatherCodes[daily.weather_code[i]] || defaultWeather;
        
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);

        const item = document.createElement('div');
        item.className = 'forecast-item clickable';
        if (i === 0) item.classList.add('active');
        
        item.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <i class="fas ${codeInfo.icon} forecast-icon"></i>
            <div class="forecast-temps">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
        `;
        
        item.addEventListener('click', () => {
            document.querySelectorAll('#forecast-container .forecast-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            const targetStartIndex = i * 24;
            const fullDayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            
            renderHourlyForecast(hourly, targetStartIndex, fullDayName, i);
            hourlyForecastContainer.scrollTo({ left: 0, behavior: 'smooth' });
        });
        
        forecastContainer.appendChild(item);
    }
}

function renderLiveBackground(type, isDay, code) {
    // 1. Sky Gradient & Glass Tint
    if (type === 'clear') {
        skyBg.style.background = isDay ? skyGradients.clearDay : skyGradients.clearNight;
        document.documentElement.style.setProperty('--glass-tint', isDay ? 'rgba(255, 200, 100, 0.05)' : 'rgba(50, 100, 255, 0.05)');
    } else if (type === 'cloudy') {
        skyBg.style.background = isDay ? skyGradients.cloudyDay : skyGradients.cloudyNight;
        document.documentElement.style.setProperty('--glass-tint', 'rgba(200, 200, 220, 0.05)');
    } else if (type === 'rain' || type === 'heavyRain') {
        skyBg.style.background = isDay ? skyGradients.cloudyDay : skyGradients.stormNight;
        document.documentElement.style.setProperty('--glass-tint', 'rgba(100, 150, 255, 0.08)');
    } else if (type === 'storm') {
        skyBg.style.background = isDay ? skyGradients.stormDay : skyGradients.stormNight;
        document.documentElement.style.setProperty('--glass-tint', 'rgba(100, 50, 150, 0.05)');
    } else {
        skyBg.style.background = skyGradients.cloudyDay;
    }

    // Clear previous
    cloudLayer.innerHTML = '';
    weatherAnimationsContainer.innerHTML = '';
    clearInterval(lightningInterval);
    lightningFlash.classList.remove('flash');

    // 2. Cloud System
    let cloudCount = 0;
    let cloudDurationBase = 60;
    
    if (type === 'cloudy' || type === 'fog') { cloudCount = 6; cloudDurationBase = 50; }
    else if (type === 'rain' || type === 'snow') { cloudCount = 8; cloudDurationBase = 40; }
    else if (type === 'heavyRain' || type === 'storm' || type === 'heavySnow') { cloudCount = 12; cloudDurationBase = 25; }
    else if (type === 'clear' && code !== 0) { cloudCount = 3; cloudDurationBase = 90; } // Mostly sunny

    for(let i=0; i<cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        
        // Randomize clouds
        const width = Math.random() * 300 + 150;
        cloud.style.width = width + 'px';
        cloud.style.height = (width * 0.4) + 'px'; // Ellipse like
        
        cloud.style.top = (Math.random() * 50 - 10) + 'vh'; // Mostly upper half
        cloud.style.opacity = Math.random() * 0.4 + 0.1;
        
        const duration = cloudDurationBase + (Math.random() * 30);
        cloud.style.animationDuration = duration + 's';
        cloud.style.animationDelay = '-' + (Math.random() * duration) + 's'; // Start at different x
        
        cloudLayer.appendChild(cloud);
    }

    // 3. Particles
    if (!isDay && type === 'clear') {
        for (let i = 0; i < 60; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.width = `${Math.random() * 3}px`;
            star.style.height = star.style.width;
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * 100}vh`;
            star.style.animationDuration = `${Math.random() * 3 + 1}s`;
            star.style.animationDelay = `${Math.random() * 2}s`;
            weatherAnimationsContainer.appendChild(star);
        }
    } 
    
    if (type === 'rain' || type === 'heavyRain' || type === 'storm') {
        const dropCount = (type === 'heavyRain' || type === 'storm') ? 120 : 60;
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 120 - 10}vw`;
            drop.style.height = `${Math.random() * 30 + 20}px`;
            drop.style.animationDuration = `${Math.random() * 0.4 + 0.4}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            weatherAnimationsContainer.appendChild(drop);
        }
    } 
    
    if (type === 'snow' || type === 'heavySnow') {
        const flakeCount = type === 'heavySnow' ? 120 : 60;
        for (let i = 0; i < flakeCount; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';
            const size = Math.random() * 5 + 3;
            flake.style.width = `${size}px`;
            flake.style.height = `${size}px`;
            flake.style.left = `${Math.random() * 120 - 20}vw`;
            flake.style.animationDuration = `${Math.random() * 5 + 4}s`;
            flake.style.animationDelay = `-${Math.random() * 5}s`;
            weatherAnimationsContainer.appendChild(flake);
        }
    }

    if (type === 'fog') {
        for(let i=0; i<3; i++) {
            const fog = document.createElement('div');
            fog.className = 'fog-layer';
            fog.style.animationDuration = (Math.random() * 20 + 30) + 's';
            fog.style.animationDelay = `-${Math.random() * 20}s`;
            weatherAnimationsContainer.appendChild(fog);
        }
    }

    // 4. Lightning
    if (type === 'storm') {
        lightningInterval = setInterval(() => {
            if(Math.random() > 0.6) { // Chance to strike
                lightningFlash.classList.add('flash');
                setTimeout(() => lightningFlash.classList.remove('flash'), 100);
                // Double flash
                if(Math.random() > 0.5) {
                    setTimeout(() => {
                        lightningFlash.classList.add('flash');
                        setTimeout(() => lightningFlash.classList.remove('flash'), 50);
                    }, 150);
                }
            }
        }, 3000);
    }
}

// Modal Logic
function openModal(type) {
    if (!currentWeatherData) return;
    const speedUnit = currentUnit === 'F' ? 'mph' : 'km/h';

    if (type === 'humidity') {
        modalIcon.className = 'fas fa-droplet';
        modalTitle.textContent = 'Moisture Details';
        modalBody.innerHTML = `
            <div class="modal-detail-row">
                <span class="modal-label">Relative Humidity</span>
                <span class="modal-value">${currentWeatherData.relative_humidity_2m}%</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-label">Precipitation</span>
                <span class="modal-value">${currentWeatherData.precipitation} mm</span>
            </div>
        `;
    } else if (type === 'wind') {
        modalIcon.className = 'fas fa-wind';
        modalTitle.textContent = 'Wind Conditions';
        modalBody.innerHTML = `
            <div class="modal-detail-row">
                <span class="modal-label">Wind Speed</span>
                <span class="modal-value">${currentWeatherData.wind_speed_10m} ${speedUnit}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-label">Wind Gusts</span>
                <span class="modal-value">${currentWeatherData.wind_gusts_10m} ${speedUnit}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-label">Direction</span>
                <span class="modal-value">${currentWeatherData.wind_direction_10m}°</span>
            </div>
        `;
    } else if (type === 'feels') {
        modalIcon.className = 'fas fa-temperature-half';
        modalTitle.textContent = 'Atmosphere';
        modalBody.innerHTML = `
            <div class="modal-detail-row">
                <span class="modal-label">Apparent Temp</span>
                <span class="modal-value">${currentWeatherData.apparent_temperature}°${currentUnit}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-label">Surface Pressure</span>
                <span class="modal-value">${currentWeatherData.surface_pressure} hPa</span>
            </div>
        `;
    }

    modalOverlay.classList.remove('hidden');
}

detailCards.forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.type));
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') openModal(card.dataset.type);
    });
});

modalCloseBtn.addEventListener('click', () => modalOverlay.classList.add('hidden'));
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});

function showLoading() {
    initialState.classList.add('hidden');
    weatherContent.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingSkeleton.classList.remove('hidden');
}

function showError() {
    loadingSkeleton.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    if (weatherContent.classList.contains('hidden')) {
        initialState.classList.remove('hidden');
    }
}

// Start
init();
