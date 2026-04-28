const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const suggestionsList = document.getElementById('suggestions-list');
const errorMessage = document.getElementById('error-message');
const weatherContent = document.getElementById('weather-content');
const initialState = document.getElementById('initial-state');
const loadingSpinner = document.getElementById('loading-spinner');
const forecastContainer = document.getElementById('forecast-container');
const hourlyForecastContainer = document.getElementById('hourly-forecast-container');
const kenBurnsBg = document.getElementById('ken-burns-bg');
const weatherAnimationsContainer = document.getElementById('weather-animations');

// Modal Elements
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalIcon = document.getElementById('modal-icon');
const modalBody = document.getElementById('modal-body');
const detailCards = document.querySelectorAll('.detail-card.interactive');

// Elements to update
const cityNameEl = document.getElementById('city-name');
const currentDateEl = document.getElementById('current-date');
const weatherIconEl = document.getElementById('weather-icon');
const tempValueEl = document.getElementById('temp-value');
const weatherDescEl = document.getElementById('weather-description');
const humidityValueEl = document.getElementById('humidity-value');
const windValueEl = document.getElementById('wind-value');
const feelsLikeValueEl = document.getElementById('feels-like-value');

// Map variables
const windyMap = document.getElementById('windy-map');

// Weather Code Mapping & Ultra-Reliable Pexels Backgrounds
const weatherCodes = {
    0: { desc: 'Clear', icon: 'fa-sun', color: ['#fbbf24', '#f59e0b'], bg: 'https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&w=1920', bgNight: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'clear' },
    1: { desc: 'Mostly Clear', icon: 'fa-cloud-sun', color: ['#fbbf24', '#f59e0b'], bg: 'https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&w=1920', bgNight: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'clear' },
    2: { desc: 'Partly Cloudy', icon: 'fa-cloud-sun', color: ['#fcd34d', '#94a3b8'], bg: 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'cloud' },
    3: { desc: 'Cloudy', icon: 'fa-cloud', color: ['#94a3b8', '#64748b'], bg: 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'cloud' },
    45: { desc: 'Fog', icon: 'fa-smog', color: ['#cbd5e1', '#94a3b8'], bg: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'cloud' },
    48: { desc: 'Freezing Fog', icon: 'fa-smog', color: ['#cbd5e1', '#94a3b8'], bg: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'cloud' },
    51: { desc: 'Light Drizzle', icon: 'fa-cloud-rain', color: ['#93c5fd', '#3b82f6'], bg: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'rain' },
    53: { desc: 'Drizzle', icon: 'fa-cloud-rain', color: ['#93c5fd', '#3b82f6'], bg: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'rain' },
    55: { desc: 'Heavy Drizzle', icon: 'fa-cloud-rain', color: ['#60a5fa', '#2563eb'], bg: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'rain' },
    61: { desc: 'Light Rain', icon: 'fa-cloud-showers-heavy', color: ['#60a5fa', '#3b82f6'], bg: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'rain' },
    63: { desc: 'Rain', icon: 'fa-cloud-showers-heavy', color: ['#3b82f6', '#2563eb'], bg: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'rain' },
    65: { desc: 'Heavy Rain', icon: 'fa-cloud-showers-heavy', color: ['#2563eb', '#1d4ed8'], bg: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'rain' },
    71: { desc: 'Light Snow', icon: 'fa-snowflake', color: ['#e2e8f0', '#cbd5e1'], bg: 'https://images.pexels.com/photos/158028/benni-marmot-snow-fall-158028.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'snow' },
    73: { desc: 'Snow', icon: 'fa-snowflake', color: ['#f1f5f9', '#e2e8f0'], bg: 'https://images.pexels.com/photos/158028/benni-marmot-snow-fall-158028.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'snow' },
    75: { desc: 'Heavy Snow', icon: 'fa-snowflake', color: ['#ffffff', '#f1f5f9'], bg: 'https://images.pexels.com/photos/158028/benni-marmot-snow-fall-158028.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'snow' },
    77: { desc: 'Snow Grains', icon: 'fa-snowflake', color: ['#e2e8f0', '#cbd5e1'], bg: 'https://images.pexels.com/photos/158028/benni-marmot-snow-fall-158028.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'snow' },
    80: { desc: 'Light Showers', icon: 'fa-cloud-showers-water', color: ['#60a5fa', '#3b82f6'], bg: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'rain' },
    81: { desc: 'Showers', icon: 'fa-cloud-showers-water', color: ['#3b82f6', '#2563eb'], bg: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'rain' },
    82: { desc: 'Heavy Showers', icon: 'fa-cloud-showers-water', color: ['#2563eb', '#1e40af'], bg: 'https://images.pexels.com/photos/1529360/pexels-photo-1529360.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'rain' },
    95: { desc: 'Thunderstorm', icon: 'fa-bolt', color: ['#c084fc', '#9333ea'], bg: 'https://images.pexels.com/photos/1118869/pexels-photo-1118869.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'storm' },
    96: { desc: 'Storm & Hail', icon: 'fa-bolt', color: ['#d8b4fe', '#a855f7'], bg: 'https://images.pexels.com/photos/1118869/pexels-photo-1118869.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'storm' },
    99: { desc: 'Heavy Storm', icon: 'fa-bolt', color: ['#e9d5ff', '#c084fc'], bg: 'https://images.pexels.com/photos/1118869/pexels-photo-1118869.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'storm' },
};

const defaultWeather = { desc: 'Unknown', icon: 'fa-cloud', color: ['#94a3b8', '#64748b'], bg: 'https://images.pexels.com/photos/158163/clouds-cloudporn-weather-lookup-158163.jpeg?auto=compress&cs=tinysrgb&w=1920', type: 'cloud' };

let currentWeatherData = null;

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

document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !searchBtn.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.classList.add('hidden');
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
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) throw new Error('City not found');
        fetchWeatherForCoords(geoData.results[0].latitude, geoData.results[0].longitude, geoData.results[0].name);
    } catch (error) { showError(); }
}

async function fetchWeatherForCoords(lat, lon, cityName) {
    showLoading();
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const weatherResponse = await fetch(url);
        const weatherData = await weatherResponse.json();
        currentWeatherData = weatherData.current;
        updateUI(cityName, weatherData.current, weatherData.hourly, weatherData.daily, lat, lon);
    } catch (error) { showError(); }
}

function updateUI(cityName, current, hourly, daily, lat, lon) {
    loadingSpinner.classList.add('hidden');
    initialState.classList.add('hidden');
    weatherContent.classList.remove('hidden');
    errorMessage.classList.add('hidden');

    const date = new Date();
    currentDateEl.textContent = date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
    cityNameEl.textContent = cityName;
    tempValueEl.textContent = Math.round(current.temperature_2m);
    humidityValueEl.textContent = `${current.relative_humidity_2m}%`;
    windValueEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    feelsLikeValueEl.textContent = `${Math.round(current.apparent_temperature)}°`;

    const isDay = current.is_day;
    let codeInfo = weatherCodes[current.weather_code] || defaultWeather;
    
    let iconClass = codeInfo.icon;
    if (!isDay && iconClass === 'fa-sun') iconClass = 'fa-moon';
    if (!isDay && iconClass === 'fa-cloud-sun') iconClass = 'fa-cloud-moon';

    weatherDescEl.textContent = codeInfo.desc;
    weatherIconEl.className = `fas ${iconClass} weather-icon-large`;
    weatherIconEl.style.background = `linear-gradient(135deg, ${codeInfo.color[0]}, ${codeInfo.color[1]})`;
    weatherIconEl.style.webkitBackgroundClip = 'text';
    weatherIconEl.style.webkitTextFillColor = 'transparent';
    
    // Set cinematic background image
    const bgImage = (!isDay && codeInfo.bgNight) ? codeInfo.bgNight : (codeInfo.bg || defaultWeather.bg);
    kenBurnsBg.style.backgroundImage = `url('${bgImage}')`;
    
    // Gradient fallback matching the weather color
    document.body.style.background = `linear-gradient(135deg, ${codeInfo.color[0]}, #0f172a)`;

    // Render components
    
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
    
    renderHourlyForecast(hourly, startIndex, 'Today');
    renderForecast(daily, hourly);
    renderWeatherAnimations(codeInfo.type, isDay);
    
    // Setup Interactive Map using Windy iframe embed
    const zoomLevel = 5;
    const windySrc = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=${zoomLevel}&overlay=clouds&product=ecmwf&level=surface&lat=${lat}&lon=${lon}`;
    windyMap.src = windySrc;
}

function renderHourlyForecast(hourly, startIndex, titleText) {
    const titleEl = document.querySelector('#hourly-forecast-container').previousElementSibling;
    titleEl.textContent = titleText;
    
    hourlyForecastContainer.innerHTML = '';
    
    // Render 24 hours from the start index
    for (let i = startIndex; i < startIndex + 24; i++) {
        if (!hourly.time[i]) break;
        
        const dateObj = new Date(hourly.time[i]);
        let hours = dateObj.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        
        // If it's the very first item and the title is "Today", call it "Now"
        const timeStr = (i === startIndex && titleText === 'Today') ? 'Now' : `${hours} ${ampm}`;

        const codeInfo = weatherCodes[hourly.weather_code[i]] || defaultWeather;
        const temp = Math.round(hourly.temperature_2m[i]);

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <div class="forecast-time">${timeStr}</div>
            <i class="fas ${codeInfo.icon} forecast-icon" style="color: ${codeInfo.color[0]}"></i>
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
            <i class="fas ${codeInfo.icon} forecast-icon" style="color: ${codeInfo.color[0]}"></i>
            <div class="forecast-temps">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
        `;
        
        // Click listener to expand this specific day in the hourly view
        item.addEventListener('click', () => {
            // Remove active from all
            document.querySelectorAll('#forecast-container .forecast-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            // Calculate the start index for this day in the hourly array (i * 24)
            const targetStartIndex = i * 24;
            const fullDayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            
            renderHourlyForecast(hourly, targetStartIndex, fullDayName);
            
            // Scroll hourly container to the left smoothly
            hourlyForecastContainer.scrollTo({ left: 0, behavior: 'smooth' });
        });
        
        forecastContainer.appendChild(item);
    }
}

function renderWeatherAnimations(weatherType, isDay) {
    weatherAnimationsContainer.innerHTML = ''; 

    if (!isDay && weatherType === 'clear') {
        for (let i = 0; i < 50; i++) {
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
    } else if (weatherType === 'rain' || weatherType === 'storm') {
        const dropCount = weatherType === 'storm' ? 100 : 50;
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 120 - 10}vw`;
            drop.style.height = `${Math.random() * 30 + 20}px`;
            drop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            weatherAnimationsContainer.appendChild(drop);
        }
    } else if (weatherType === 'snow') {
        for (let i = 0; i < 80; i++) {
            const flake = document.createElement('div');
            flake.className = 'snow-flake';
            const size = Math.random() * 5 + 3;
            flake.style.width = `${size}px`;
            flake.style.height = `${size}px`;
            flake.style.left = `${Math.random() * 100}vw`;
            flake.style.animationDuration = `${Math.random() * 5 + 5}s`;
            flake.style.animationDelay = `-${Math.random() * 5}s`;
            weatherAnimationsContainer.appendChild(flake);
        }
    }
}

// Modal Logic
function openModal(type) {
    if (!currentWeatherData) return;

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
                <span class="modal-value">${currentWeatherData.wind_speed_10m} km/h</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-label">Wind Gusts</span>
                <span class="modal-value">${currentWeatherData.wind_gusts_10m} km/h</span>
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
                <span class="modal-value">${currentWeatherData.apparent_temperature}°C</span>
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
    loadingSpinner.classList.remove('hidden');
}

function showError() {
    loadingSpinner.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    if (weatherContent.classList.contains('hidden')) {
        initialState.classList.remove('hidden');
    }
}
