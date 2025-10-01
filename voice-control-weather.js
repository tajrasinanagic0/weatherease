// ----------------------------
// Weather Page Voice & Weather System
// ----------------------------
const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32"; // Your OpenWeather API key
const synth = window.speechSynthesis;

let recognition;           // For voice recognition
let voiceEnabled = false;  // Track if voice commands are active
let weatherDataReady = false; // Track if current weather is loaded

// DOM elements
const geoBtn = document.getElementById('geo-btn');
const forecastList = document.getElementById('forecast-list');
const currentStatus = document.getElementById('current-status');
const homeBtn = document.getElementById('home-btn');
const settingsBtn = document.getElementById('settings-btn');
const exitBtn = document.getElementById('exit-btn');
const voiceBtn = document.getElementById('enable-voice-btn');
const currentCard = document.getElementById('current-card');

// ----------------------------
// Speak function
// ----------------------------
function speak(text) {
  if (!voiceEnabled) return;  // Only speak if voice is enabled
  if (synth.speaking) synth.cancel(); // Cancel any previous speech
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// ----------------------------
// Navigation buttons with voice feedback
// ----------------------------
homeBtn?.addEventListener('click', () => {
  speak("Returning home");
  window.location.href = "index.html";
});

settingsBtn?.addEventListener('click', () => {
  speak("Opening settings");
  window.location.href = "settings.html";
});

exitBtn?.addEventListener('click', () => {
  speak("Closing WeatherEase");
  setTimeout(() => window.location.href = "exit.html", 1000);
});

// ----------------------------
// Enable voice button
// ----------------------------
voiceBtn?.addEventListener('click', () => {
  voiceEnabled = true;
  speak("Voice features enabled! Say a number to get weather info.");
  startRecognition();
  greetUser();
  voiceBtn.style.display = "none"; // Hide after enabling
});

// ----------------------------
// Automatic greeting
// ----------------------------
function greetUser() {
  const greeting = `Welcome to WeatherEase Weather page!
To get weather, share your location using the 'Use My Location' button.
Then say:
1: Current temperature
2: Feels like
3: Condition
4: Humidity
5: Wind
6: 5-day forecast
7: Return home`;
  speak(greeting);
  if(currentStatus) currentStatus.textContent = "Awaiting location...";
}

// ----------------------------
// Voice recognition
// ----------------------------
function startRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    speak("Sorry, voice commands not supported in this browser.");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.trim().toLowerCase();
    console.log("Heard:", command);
    handleCommand(command);
  };

  recognition.onerror = (event) => {
    console.error(event.error);
    speak("Error in voice recognition: " + event.error);
  };

  recognition.onend = () => { if(voiceEnabled) recognition.start(); };
}

// ----------------------------
// Handle voice commands
// ----------------------------
function handleCommand(cmd) {
  switch(cmd) {
    case 'one':
    case 'temperature':
    case 'current temperature':
      speakCurrent('temp'); break;
    case 'two':
    case 'feels like':
      speakCurrent('feels'); break;
    case 'three':
    case 'condition':
      speakCurrent('desc'); break;
    case 'four':
    case 'humidity':
      speakCurrent('humidity'); break;
    case 'five':
    case 'wind':
      speakCurrent('wind'); break;
    case 'six':
    case 'five day forecast':
    case 'forecast':
      speakForecast(); break;
    case 'seven':
    case 'home':
    case 'return home':
      homeBtn.click(); break;
    default:
      speak("Command not recognized, please try again.");
      break;
  }
}

// ----------------------------
// Speak current weather field
// ----------------------------
function speakCurrent(field) {
  const el = document.querySelector(`[data-field="${field}"]`);
  if(!el) {
    speak(`${field} not available`);
    return;
  }

  // Check if content is still placeholder
  if(el.textContent === '—' || el.textContent.trim() === '') {
    speak(`${field} not available yet. Please press 'Use My Location' or wait a moment.`);
    return;
  }

  speak(`${field.replace('-', ' ')} is ${el.textContent}`);
}

// ----------------------------
// Speak 5-day forecast
// ----------------------------
function speakForecast() {
  const days = [...forecastList.querySelectorAll('li')];
  if(!days.length) { speak("No forecast data available."); return; }
  let text = "Here is your 5-day forecast: ";
  days.forEach(li => {
    const day = li.querySelector('[data-day]')?.textContent || '—';
    const high = li.querySelector('[data-high]')?.textContent || '—';
    const low = li.querySelector('[data-low]')?.textContent || '—';
    const desc = li.querySelector('[data-desc]')?.textContent || '—';
    text += `${day}, high ${high}, low ${low}, ${desc}. `;
  });
  speak(text);
}

// ----------------------------
// Fetch weather by coordinates
// ----------------------------
async function fetchWeather(lat, lon) {
  try {
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await resp.json();

    const placeEl = document.querySelector('[data-field="place"]');
    const tempEl = document.querySelector('[data-field="temp"]');
    const feelsEl = document.querySelector('[data-field="feels"]');
    const descEl = document.querySelector('[data-field="desc"]');
    const humidityEl = document.querySelector('[data-field="humidity"]');
    const windEl = document.querySelector('[data-field="wind"]');

    // Update DOM
    placeEl.textContent = `${data.name}, ${data.sys.country}`;
    tempEl.textContent = Math.round(data.main.temp) + '°C';
    feelsEl.textContent = Math.round(data.main.feels_like) + '°C';
    descEl.textContent = data.weather[0].description;
    humidityEl.textContent = data.main.humidity + '%';
    windEl.textContent = data.wind.speed + ' m/s';

    // Delay to ensure iOS updates the DOM before speaking
    setTimeout(() => {
      weatherDataReady = true;
      if(currentStatus) currentStatus.textContent = "Weather updated.";
    }, 100);

    fetchForecast(lat, lon);

    // Ensure background Figma card shows
    if(currentCard) currentCard.style.backgroundImage = 
      "url('https://platform.vox.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/15788040/20150428-cloud-computing.0.1489222360.jpg?quality=90&strip=all&crop=0,5.5555555555556,100,88.888888888889')";

  } catch(e) {
    weatherDataReady = false;
    speak("Error fetching weather data. Make sure location is enabled.");
    console.error(e);
  }
}

// ----------------------------
// Fetch 5-day forecast
// ----------------------------
async function fetchForecast(lat, lon) {
  try {
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await resp.json();
    const days = [...forecastList.querySelectorAll('li')];

    for(let i=0; i<days.length; i++) {
      const dayData = data.list[i*8]; // every 8th item = next day
      days[i].querySelector('[data-day]').textContent = new Date(dayData.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
      days[i].querySelector('[data-high]').textContent = Math.round(dayData.main.temp_max) + '°C';
      days[i].querySelector('[data-low]').textContent = Math.round(dayData.main.temp_min) + '°C';
      days[i].querySelector('[data-desc]').textContent = dayData.weather[0].description;
    }
  } catch(e) {
    console.error(e);
  }
}

// ----------------------------
// Use my location button
// ----------------------------
geoBtn?.addEventListener('click', () => {
  if(!navigator.geolocation){
    speak("Geolocation not supported in this browser");
    return;
  }
  speak("Please allow location access to get weather");
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
    err => { speak("Unable to access location. Please enable location permissions."); console.error(err); },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

