// ----------------------------
// Weather Page Voice & Weather System
// ----------------------------
const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32";
const synth = window.speechSynthesis;

let recognition; // Speech recognition instance
let voiceEnabled = false; // Voice toggle for iOS / PWA

// DOM Elements
const voiceBtn = document.createElement('button');
voiceBtn.textContent = "Enable Voice Features";
voiceBtn.style.margin = "1rem 0";
voiceBtn.id = "start-voice-btn";
document.body.prepend(voiceBtn);

const voiceStatus = document.getElementById('voice-status') || document.createElement('p');

// Navbar Buttons
document.getElementById('home-btn')?.addEventListener('click', () => navigateHome());
document.getElementById('settings-btn')?.addEventListener('click', () => navigateSettings());
document.getElementById('exit-btn')?.addEventListener('click', () => navigateExit());

// Location & Forecast
const geoBtn = document.getElementById('geo-btn');
const locationForm = document.getElementById('location-form');
const searchInput = document.getElementById('search');
const forecastList = document.getElementById('forecast-list');
const currentStatus = document.getElementById('current-status');

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
// Navbar Navigation
// ----------------------------
function navigateHome() { speak("Returning to home screen"); window.location.href = "index.html"; }
function navigateSettings() { speak("Opening settings"); window.location.href = "settings.html"; }
function navigateExit() { speak("Thank you for using WeatherEase. Closing app now."); setTimeout(()=>window.close(), 3000); }

// ----------------------------
// Greeting & Voice Setup
// ----------------------------
voiceBtn.addEventListener('click', () => {
  voiceEnabled = true;
  speak("Voice features enabled. Listening for commands.");
  startRecognition();
  greetUser();
  voiceBtn.style.display = "none";
});

// Automatic greeting
function greetUser() {
  const greeting = `Welcome to WeatherEase Weather page!
To access weather, share your location or say a city.
Then choose an option:
1: Current temperature
2: Feels like
3: Condition
4: Humidity
5: Wind
6: 5-day forecast
7: Return to home screen.`;
  speak(greeting);
  if(voiceStatus) voiceStatus.textContent = "Listening for commands...";
}

// ----------------------------
// Start voice recognition
// ----------------------------
function startRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    voiceStatus.textContent = "Speech recognition not supported in this browser.";
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
    if(voiceStatus) voiceStatus.textContent = `Error: ${event.error}`;
  };

  recognition.onend = () => {
    if (voiceEnabled) recognition.start(); // continuous listening
  };
}

// ----------------------------
// Handle voice commands
// ----------------------------
function handleCommand(cmd) {
  switch(cmd) {
    case '1':
    case 'temperature':
    case 'current temperature':
      speakCurrent('temp');
      break;
    case '2':
    case 'feels like':
      speakCurrent('feels');
      break;
    case '3':
    case 'condition':
      speakCurrent('desc');
      break;
    case '4':
    case 'humidity':
      speakCurrent('humidity');
      break;
    case '5':
    case 'wind':
      speakCurrent('wind');
      break;
    case '6':
    case '5-day forecast':
      speakForecast();
      break;
    case '7':
    case 'home':
    case 'return home':
      navigateHome();
      break;
    default:
      if (cmd.includes('home')) navigateHome();
      else if (cmd.includes('settings')) navigateSettings();
      else if (cmd.includes('exit')) navigateExit();
      else if (cmd.length > 0) fetchWeatherByCity(cmd); // assume city
      else speak("Command not recognized, please try again.");
      break;
  }
}

// ----------------------------
// Speak current weather fields
// ----------------------------
function speakCurrent(field){
  const el = document.querySelector(`[data-field="${field}"]`);
  if (el && el.textContent && el.textContent !== '—') speak(`${field.replace('-', ' ')} is ${el.textContent}`);
  else speak(`${field} is not available yet`);
}

// ----------------------------
// Speak 5-day forecast
// ----------------------------
function speakForecast(){
  const days = [...forecastList.querySelectorAll('li')];
  if(!days.length){ speak("No forecast data available."); return; }
  let text = "Here is your 5-day forecast: ";
  days.forEach(li=>{
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
async function fetchWeather(lat, lon){
  try{
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await resp.json();
    document.querySelector('[data-field="place"]').textContent = `${data.name}, ${data.sys.country}`;
    document.querySelector('[data-field="temp"]').textContent = Math.round(data.main.temp)+'°C';
    document.querySelector('[data-field="feels"]').textContent = Math.round(data.main.feels_like)+'°C';
    document.querySelector('[data-field="desc"]').textContent = data.weather[0].description;
    document.querySelector('[data-field="humidity"]').textContent = data.main.humidity+'%';
    document.querySelector('[data-field="wind"]').textContent = data.wind.speed+' m/s';
    if(currentStatus) currentStatus.textContent="Weather updated.";
    fetchForecast(lat, lon);
  } catch(e){ speak("Error fetching weather data"); console.log(e); }
}

// ----------------------------
// Fetch 5-day forecast
// ----------------------------
async function fetchForecast(lat, lon){
  try{
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await resp.json();
    const days = [...forecastList.querySelectorAll('li')];
    for(let i=0;i<days.length;i++){
      const dayData = data.list[i*8]; // approx 1 reading per day
      days[i].querySelector('[data-day]').textContent = new Date(dayData.dt*1000).toLocaleDateString('en-US',{weekday:'long'});
      days[i].querySelector('[data-high]').textContent = Math.round(dayData.main.temp_max)+'°C';
      days[i].querySelector('[data-low]').textContent = Math.round(dayData.main.temp_min)+'°C';
      days[i].querySelector('[data-desc]').textContent = dayData.weather[0].description;
    }
  } catch(e){ console.log(e); }
}

// ----------------------------
// Fetch weather by city name
// ----------------------------
async function fetchWeatherByCity(city){
  try{
    const geoResp = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
    const geoData = await geoResp.json();
    if(!geoData.length){ speak("City not found"); return; }
    const {lat, lon} = geoData[0];
    fetchWeather(lat, lon);
  } catch(e){ speak("Error fetching city location"); console.log(e); }
}

// ----------------------------
// Event listeners
// ----------------------------
geoBtn?.addEventListener('click', ()=>{
  if(!navigator.geolocation){ speak("Geolocation not supported"); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
  });
});

locationForm?.addEventListener('submit', e=>{
  e.preventDefault();
  const city = searchInput.value.trim();
  if(city.length>0) fetchWeatherByCity(city);
});

