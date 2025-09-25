// ----------------------------
// Weather Page Voice & Weather System
// ----------------------------
const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32"; // Replace with your OpenWeather API key
const synth = window.speechSynthesis;

let recognition;
let voiceEnabled = false;

// DOM Elements
const geoBtn = document.getElementById('geo-btn');
const forecastList = document.getElementById('forecast-list');
const currentStatus = document.getElementById('current-status');
const homeBtn = document.getElementById('home-btn');
const settingsBtn = document.getElementById('settings-btn');
const exitBtn = document.getElementById('exit-btn');

// Create "Enable Voice" button for iOS / PWA
const voiceBtn = document.createElement('button');
voiceBtn.textContent = "Enable Voice Features";
voiceBtn.style.margin = "1rem 0";
voiceBtn.id = "start-voice-btn";
document.body.prepend(voiceBtn);

// ----------------------------
// Speak function
// ----------------------------
function speak(text) {
  if (!voiceEnabled) return;
  if (synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// ----------------------------
// Navbar buttons
// ----------------------------
homeBtn?.addEventListener('click', () => navigateHome());
settingsBtn?.addEventListener('click', () => navigateSettings());
exitBtn?.addEventListener('click', () => navigateExit());

function navigateHome() { speak("Returning to home screen"); window.location.href = "index.html"; }
function navigateSettings() { speak("Opening settings"); window.location.href = "settings.html"; }
function navigateExit() { speak("Thank you for using WeatherEase. Closing app now."); setTimeout(()=>window.close(), 3000); }

// ----------------------------
// Enable voice
// ----------------------------
voiceBtn.addEventListener('click', () => {
  voiceEnabled = true;
  speak("Voice features enabled. Listening for commands.");
  startRecognition();
  greetUser();
  voiceBtn.style.display = "none";
});

// ----------------------------
// Automatic greeting
// ----------------------------
function greetUser() {
  const greeting = `Welcome to WeatherEase Weather page!
To get weather, please share your location using the 'Use my location' button.
Once your location is confirmed, you can say:
1 for current temperature,
2 for feels like,
3 for condition,
4 for humidity,
5 for wind,
6 for 5-day forecast,
7 to return to home screen.`;
  speak(greeting);
  if(currentStatus) currentStatus.textContent = "Awaiting location...";
}

// ----------------------------
// Start voice recognition
// ----------------------------
function startRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    speak("Speech recognition is not supported in this browser.");
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

  recognition.onend = () => {
    if (voiceEnabled) recognition.start();
  };
}

// ----------------------------
// Handle voice commands
// ----------------------------
function handleCommand(cmd) {
  switch(cmd) {
    case 'one':
    case 'temperature':
    case 'current temperature':
      speakCurrent('temperature');
      break;
    case 'two':
    case 'feels like':
      speakCurrent('feels like');
      break;
    case 'three':
    case 'condition':
      speakCurrent('condition');
      break;
    case 'four':
    case 'humidity':
      speakCurrent('humidity');
      break;
    case 'five':
    case 'wind':
      speakCurrent('wind');
      break;
    case 'six':
    case 'five day forecast':
    case 'forecast':
      speakForecast();
      break;
    case 'seven':
    case 'home':
    case 'return home':
      navigateHome();
      break;
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
  if (el && el.textContent && el.textContent !== '—') speak(`${field.replace('-', ' ')} is ${el.textContent}`);
  else speak(`${field} is not available yet`);
}

// ----------------------------
// Speak 5-day forecast
// ----------------------------
function speakForecast() {
  const days = [...forecastList.querySelectorAll('li')];
  if (!days.length) { speak("No forecast data available."); return; }
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
    document.querySelector('[data-field="place"]').textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector('[data-field="temp"]').textContent = Math.round(data.main.temp) + '°C';
    document.querySelector('[data-field="feels"]').textContent = Math.round(data.main.feels_like) + '°C';
    document.querySelector('[data-field="desc"]').textContent = data.weather[0].description;
    document.querySelector('[data-field="humidity"]').textContent = data.main.humidity + '%';
    document.querySelector('[data-field="wind"]').textContent = data.wind.speed + ' m/s';
    if (currentStatus) currentStatus.textContent = "Weather updated.";
    fetchForecast(lat, lon);
  } catch (e) {
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
    for (let i = 0; i < days.length; i++) {
      const dayData = data.list[i * 8];
      days[i].querySelector('[data-day]').textContent = new Date(dayData.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
      days[i].querySelector('[data-high]').textContent = Math.round(dayData.main.temp_max) + '°C';
      days[i].querySelector('[data-low]').textContent = Math.round(dayData.main.temp_min) + '°C';
      days[i].querySelector('[data-desc]').textContent = dayData.weather[0].description;
    }
  } catch (e) {
    console.error(e);
  }
}

// ----------------------------
// Use my location button
// ----------------------------
geoBtn?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    speak("Geolocation not supported in this browser");
    return;
  }
  speak("Please allow location access to get weather");
  navigator.geolocation.getCurrentPosition(
    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
    err => {
      speak("Unable to access location. Please enable location permissions.");
      console.error("Geolocation error:", err);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});
