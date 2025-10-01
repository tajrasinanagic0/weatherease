const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32";
const synth = window.speechSynthesis;

let recognition;
let voiceEnabled = false;
let weatherDataReady = false; // track if weather info is loaded

// DOM elements
const geoBtn = document.getElementById('geo-btn');
const forecastList = document.getElementById('forecast-list');
const currentStatus = document.getElementById('current-status');
const currentCard = document.getElementById('current-card');
const homeBtn = document.getElementById('home-btn');
const settingsBtn = document.getElementById('settings-btn');
const exitBtn = document.getElementById('exit-btn');
const voiceBtn = document.getElementById('enable-voice-btn');

// ----------------------------
// Speak function
// ----------------------------
function speak(text) {
  if(!voiceEnabled) return;
  if(synth.speaking) synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  synth.speak(utter);
}

// ----------------------------
// Navigation buttons
// ----------------------------
homeBtn?.addEventListener('click', () => { speak("Returning home"); window.location.href = "index.html"; });
settingsBtn?.addEventListener('click', () => { speak("Opening settings"); window.location.href = "settings.html"; });
exitBtn?.addEventListener('click', () => { speak("Closing WeatherEase"); setTimeout(()=>window.location.href="exit.html", 1000); });

// ----------------------------
// Enable voice
// ----------------------------
voiceBtn?.addEventListener('click', () => {
  voiceEnabled = true;
  speak("Voice features enabled! Say a number to get weather info.");
  startRecognition();
  greetUser();
  voiceBtn.style.display = "none";
});

// ----------------------------
// Greeting
// ----------------------------
function greetUser() {
  const greeting = `Welcome to WeatherEase Weather page!
Use 'Use My Location' to get weather.
Say:
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
    speak("Voice commands not supported.");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();

  recognition.onresult = event => handleCommand(event.results[0][0].transcript.trim().toLowerCase());
  recognition.onerror = event => { console.error(event.error); speak("Error: " + event.error); };
  recognition.onend = () => { if(voiceEnabled) recognition.start(); };
}

// ----------------------------
// Command handler
// ----------------------------
function handleCommand(cmd) {
  if(!weatherDataReady) { speak("Weather not ready yet. Please press 'Use My Location'."); return; }

  switch(cmd) {
    case 'one':
    case 'temperature':
    case 'current temperature': speakCurrent('temp'); break;
    case 'two':
    case 'feels like': speakCurrent('feels'); break;
    case 'three':
    case 'condition': speakCurrent('desc'); break;
    case 'four':
    case 'humidity': speakCurrent('humidity'); break;
    case 'five':
    case 'wind': speakCurrent('wind'); break;
    case 'six':
    case 'five day forecast':
    case 'forecast': speakForecast(); break;
    case 'seven':
    case 'home':
    case 'return home': homeBtn.click(); break;
    default: speak("Command not recognized."); break;
  }
}

// ----------------------------
// Speak current weather
// ----------------------------
function speakCurrent(field) {
  const el = document.querySelector(`[data-field="${field}"]`);
  if(el && el.textContent && el.textContent !== '—') {
    speak(`${field.replace('-', ' ')} is ${el.textContent}`);
  } else {
    speak(`${field} not available`);
  }
}

// ----------------------------
// Speak forecast
// ----------------------------
function speakForecast() {
  const days = [...forecastList.querySelectorAll('li')];
  if(!days.length) { speak("No forecast data."); return; }
  let text = "5-day forecast: ";
  days.forEach(li => {
    const day = li.querySelector('[data-day]')?.textContent || '—';
    const high = li.querySelector('[data-high]')?.textContent || '—';
    const low = li.querySelector('[data-low]')?.textContent || '—';
    const desc = li.querySelector('[data-desc]')?.textContent || '—';
    text += `${day}: ${desc}, high ${high}, low ${low}. `;
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

    document.querySelector('[data-field="place"]')?.textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector('[data-field="temp"]')?.textContent = Math.round(data.main.temp) + '°C';
    document.querySelector('[data-field="feels"]')?.textContent = Math.round(data.main.feels_like) + '°C';
    document.querySelector('[data-field="desc"]')?.textContent = data.weather[0].description;
    document.querySelector('[data-field="humidity"]')?.textContent = data.main.humidity + '%';
    document.querySelector('[data-field="wind"]')?.textContent = data.wind.speed + ' m/s';

    weatherDataReady = true;

    if(currentStatus) currentStatus.textContent = "Weather updated.";

    if(currentCard) {
      currentCard.style.backgroundImage = "url('https://platform.vox.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/15788040/20150428-cloud-computing.0.1489222360.jpg?quality=90&strip=all&crop=0,5.5555555555556,100,88.888888888889')";
    }

    fetchForecast(lat, lon);

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
    const listItems = forecastList.querySelectorAll('li');

    for(let i = 0; i < 5; i++) {
      const item = listItems[i];
      const dayData = data.list[i*8];
      if(!dayData) continue;

      item.querySelector('[data-day]')?.setAttribute('data-day','day');
      item.querySelector('[data-day]').textContent = new Date(dayData.dt_txt).toLocaleDateString('en-US', { weekday: 'short' });
      item.querySelector('[data-high]')?.setAttribute('data-high','high');
      item.querySelector('[data-high]').textContent = Math.round(dayData.main.temp_max) + '°C';
      item.querySelector('[data-low]')?.setAttribute('data-low','low');
      item.querySelector('[data-low]').textContent = Math.round(dayData.main.temp_min) + '°C';
      item.querySelector('[data-desc]')?.setAttribute('data-desc','desc');
      item.querySelector('[data-desc]').textContent = dayData.weather[0].description;
    }

  } catch(e) {
    console.error(e);
  }
}

// ----------------------------
// Geolocation
// ----------------------------
geoBtn?.addEventListener('click', () => {
  if(!navigator.geolocation) { speak("Geolocation not supported."); return; }
  speak("Please allow location access to get weather");
  navigator.geolocation.getCurrentPosition(pos => {
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
  }, err => {
    speak("Unable to retrieve location.");
    console.error(err);
  }, { enableHighAccuracy: true, timeout: 10000 });
});



