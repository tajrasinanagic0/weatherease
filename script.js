// ----------------------------
// Weather Page Voice & Weather System
// ----------------------------
const API_KEY = "2c1fb322de5c86e87d6eb7e265fe9f32"; // put your OpenWeather API key here
const synth = window.speechSynthesis;

let recognition;
let voiceEnabled = false;

// DOM Elements
const voiceBtn = document.getElementById('enable-voice-btn');
const geoBtn = document.getElementById('geo-btn');
const forecastList = document.getElementById('forecast-list');
const currentStatus = document.getElementById('current-status');

// Navbar buttons
document.getElementById('home-btn')?.addEventListener('click', () => navigateHome());
document.getElementById('settings-btn')?.addEventListener('click', () => navigateSettings());
document.getElementById('exit-btn')?.addEventListener('click', () => navigateExit());

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
// Navbar navigation
// ----------------------------
function navigateHome() { speak("Returning to home screen"); window.location.href = "index.html"; }
function navigateSettings() { speak("Opening settings"); window.location.href = "settings.html"; }
function navigateExit() { speak("Thank you for using WeatherEase. Closing app now."); setTimeout(()=>window.close(), 3000); }

// ----------------------------
// Enable voice button
// ----------------------------
voiceBtn?.addEventListener('click', () => {
  voiceEnabled = true;
  speak("Voice features enabled. Listening for commands.");
  startRecognition();
  greetUser();
  voiceBtn.style.display = "none";
});

// ----------------------------
// Greeting
// ----------------------------
function greetUser() {
  speak(`Welcome to WeatherEase Weather page! 
To access weather, press or say 'Use my location'. 
Once location is ready, choose an option: 
1 for Current temperature, 
2 for Feels like, 
3 for Condition, 
4 for Humidity, 
5 for Wind, 
6 for 5-day forecast, 
7 to return to home screen.`);
}

// ----------------------------
// Start voice recognition
// ----------------------------
function startRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    currentStatus.textContent = "Speech recognition not supported in this browser.";
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
    currentStatus.textContent = `Error: ${event.error}`;
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
    case '1': case 'temperature': case 'current temperature': speakCurrent('temp'); break;
    case '2': case 'feels like': speakCurrent('feels'); break;
    case '3': case 'condition': speakCurrent('desc'); break;
    case '4': case 'humidity': speakCurrent('humidity'); break;
    case '5': case 'wind': speakCurrent('wind'); break;
    case '6': case '5-day forecast': speakForecast(); break;
    case '7': case 'home': case 'return home': navigateHome(); break;
    case 'use my location':
      geoBtn.click(); // trigger location button
      break;
    default: speak("Command not recognized, please try again."); break;
  }
}

// ----------------------------
// Speak current weather
// ----------------------------
function speakCurrent(field){
  const el = document.querySelector(`[data-field="${field}"]`);
  if(el && el.textContent && el.textContent !== '—') speak(`${field.replace('-', ' ')} is ${el.textContent}`);
  else speak(`${field.replace('-', ' ')} is not available yet`);
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
// Fetch weather via geolocation
// ----------------------------
geoBtn?.addEventListener('click', ()=>{
  if(!navigator.geolocation){ speak("Geolocation not supported"); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    fetchWeather(pos.coords.latitude, pos.coords.longitude);
  });
});

// ----------------------------
// Fetch weather
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
// Fetch forecast
// ----------------------------
async function fetchForecast(lat, lon){
  try{
    const resp = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const data = await resp.json();
    const days = [...forecastList.querySelectorAll('li')];
    for(let i=0;i<days.length;i++){
      const dayData = data.list[i*8];
      days[i].querySelector('[data-day]').textContent = new Date(dayData.dt*1000).toLocaleDateString('en-US',{weekday:'long'});
      days[i].querySelector('[data-high]').textContent = Math.round(dayData.main.temp_max)+'°C';
      days[i].querySelector('[data-low]').textContent = Math.round(dayData.main.temp_min)+'°C';
      days[i].querySelector('[data-desc]').textContent = dayData.weather[0].description;
    }
  } catch(e){ speak("Error fetching forecast"); console.log(e); }
}
